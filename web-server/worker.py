"""
Job Worker and Concurrency Manager for JaneConverter Web.

Orchestrates background media extraction and conversion jobs with:
- Bounded concurrency semaphores to protect server CPU/RAM
- Thread-safe SSE progress streaming
- Ephemeral job sandbox directories
- Automatic reaper for expired artifacts (10-minute auto-purge)
"""

import asyncio
import os
import shutil
import time
import uuid
import zipfile
import threading
from typing import Dict, Optional, Any, AsyncGenerator

from janeconverter.policy import DEFAULT_POLICY
from janeconverter.net_guard import validate_url_or_raise
from janeconverter.extractor import fetch_media_stream, fetch_playlist_entries
from janeconverter.converter import convert_media
from janeconverter.constants import (
    SUPPORTED_AUDIO_FORMATS,
    SUPPORTED_VIDEO_FORMATS,
    SUPPORTED_IMAGE_FORMATS,
)

from schemas import JobState, JobResponse, CreateJobRequest


BASE_STORAGE_DIR = os.getenv("JANE_STORAGE_DIR", os.path.join(os.getcwd(), "temp_web_jobs"))
UPLOADS_DIR = os.path.join(BASE_STORAGE_DIR, "uploads")
JOBS_DIR = os.path.join(BASE_STORAGE_DIR, "jobs")


class Job:
    def __init__(self, job_id: str, request: CreateJobRequest):
        self.id = job_id
        self.request = request
        self.status = JobState.QUEUED
        self.progress = 0.0
        self.step = "Job queued..."
        self.filename: Optional[str] = None
        self.output_path: Optional[str] = None
        self.error: Optional[str] = None
        self.created_at = time.time()
        self.completed_at: Optional[float] = None
        self.abort_event = threading.Event()
        self.subscribers: list[asyncio.Queue] = []
        self.is_playlist = request.is_playlist
        self.items_total = 1
        self.items_completed = 0

    def to_response(self) -> JobResponse:
        download_url = f"/api/v1/jobs/{self.id}/download" if self.status == JobState.COMPLETED and self.filename else None
        return JobResponse(
            id=self.id,
            status=self.status,
            progress=self.progress,
            step=self.step,
            filename=self.filename,
            download_url=download_url,
            error=self.error,
            created_at=self.created_at,
            is_playlist=self.is_playlist,
            items_total=self.items_total,
            items_completed=self.items_completed,
        )

    def emit_progress(self, progress: float, step: str):
        self.progress = max(0.0, min(1.0, round(progress, 3)))
        self.step = step
        data = self.to_response().model_dump_json()
        for q in list(self.subscribers):
            try:
                q.put_nowait(data)
            except asyncio.QueueFull:
                pass


class JobManager:
    def __init__(self, max_concurrent: int = 2):
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.jobs: Dict[str, Job] = {}
        self.uploads: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        os.makedirs(UPLOADS_DIR, exist_ok=True)
        os.makedirs(JOBS_DIR, exist_ok=True)

    def register_upload(self, upload_id: str, filepath: str, filename: str, size: int):
        self.uploads[upload_id] = {
            "path": filepath,
            "filename": filename,
            "size": size,
            "created_at": time.time(),
        }

    def get_upload_path(self, upload_id: str) -> Optional[str]:
        info = self.uploads.get(upload_id)
        if info and os.path.exists(info["path"]):
            return info["path"]
        return None

    async def create_job(self, request: CreateJobRequest) -> Job:
        job_id = uuid.uuid4().hex[:12]
        job = Job(job_id, request)

        async with self._lock:
            self.jobs[job_id] = job

        # Trigger background execution
        asyncio.create_task(self._process_job_wrapper(job))
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        return self.jobs.get(job_id)

    def cancel_job(self, job_id: str) -> bool:
        job = self.jobs.get(job_id)
        if not job:
            return False
        job.abort_event.set()
        if job.status in (JobState.QUEUED, JobState.DOWNLOADING, JobState.CONVERTING):
            job.status = JobState.CANCELLED
            job.emit_progress(job.progress, "Conversion cancelled by user.")
        return True

    async def subscribe_events(self, job_id: str) -> AsyncGenerator[str, None]:
        job = self.jobs.get(job_id)
        if not job:
            yield "event: error\ndata: Job not found\n\n"
            return

        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        job.subscribers.append(queue)
        try:
            # Emit current snapshot immediately
            yield f"data: {job.to_response().model_dump_json()}\n\n"

            while True:
                data = await queue.get()
                yield f"data: {data}\n\n"
                if job.status in (JobState.COMPLETED, JobState.FAILED, JobState.CANCELLED):
                    break
        finally:
            if queue in job.subscribers:
                job.subscribers.remove(queue)

    async def _process_job_wrapper(self, job: Job):
        async with self.semaphore:
            job.status = JobState.DOWNLOADING
            job.emit_progress(0.05, "Acquired conversion worker slot...")
            try:
                loop = asyncio.get_running_loop()
                await loop.run_in_executor(None, self._execute_job_sync, job)
            except Exception as e:
                job.status = JobState.FAILED
                job.error = str(e)
                job.emit_progress(job.progress, f"Error: {e}")
            finally:
                job.completed_at = time.time()

    def _execute_job_sync(self, job: Job):
        req = job.request
        job_work_dir = os.path.join(JOBS_DIR, job.id, "work")
        job_out_dir = os.path.join(JOBS_DIR, job.id, "out")
        os.makedirs(job_work_dir, exist_ok=True)
        os.makedirs(job_out_dir, exist_ok=True)

        fmt = req.target_format
        is_audio = fmt in SUPPORTED_AUDIO_FORMATS
        is_video = fmt in SUPPORTED_VIDEO_FORMATS
        is_image = fmt in SUPPORTED_IMAGE_FORMATS
        if not (is_audio or is_video or is_image):
            raise ValueError(f"Unsupported target format: '{fmt}'")

        # Case 1: Playlist / Album batch conversion
        if req.is_playlist:
            self._execute_playlist_sync(job, job_work_dir, job_out_dir)
            return

        # Case 2: Local uploaded file
        if req.upload_id:
            local_src = self.get_upload_path(req.upload_id)
            if not local_src:
                raise FileNotFoundError("Uploaded file was not found or has expired.")
            source_input = local_src
            job.status = JobState.CONVERTING
            job.emit_progress(0.20, "Input media verified. Beginning conversion...")
            extracted_meta = {
                "media_path": local_src,
                "title": os.path.splitext(os.path.basename(local_src))[0],
                "artist": "Uploaded Media",
                "album": "",
                "year": "",
                "thumbnail_path": None,
            }
        # Case 3: Public media URL
        elif req.source_url:
            safe_url = validate_url_or_raise(req.source_url)
            job.emit_progress(0.10, "Connecting to public media stream...")

            def on_extract_progress(pct: float, msg: str):
                if job.abort_event.is_set():
                    raise KeyboardInterrupt("Cancelled by user.")
                # Scale extraction from 10% to 50%
                job.emit_progress(0.10 + (pct * 0.40), msg)

            extracted_meta = fetch_media_stream(
                source=safe_url,
                output_dir=job_work_dir,
                audio_only=is_audio,
                resolution=req.resolution,
                abort_event=job.abort_event,
                progress_callback=on_extract_progress,
                target_format=fmt,
            )
            source_input = extracted_meta["media_path"]
        else:
            raise ValueError("No source URL or uploaded file provided.")

        if job.abort_event.is_set():
            job.status = JobState.CANCELLED
            return

        job.status = JobState.CONVERTING
        job.emit_progress(0.55, f"Transcoding to {fmt.upper()}...")

        def on_convert_progress(pct: float, msg: str):
            if job.abort_event.is_set():
                raise KeyboardInterrupt("Cancelled by user.")
            # Scale conversion from 55% to 95%
            job.emit_progress(0.55 + (pct * 0.40), msg)

        out_filename = f"{extracted_meta.get('title') or 'converted_media'}.{fmt}"
        out_filename = "".join(c for c in out_filename if c.isalnum() or c in " ._-()").strip()

        converted_path = convert_media(
            input_path=source_input,
            output_dir=job_out_dir,
            output_filename=out_filename,
            target_format=fmt,
            bitrate=req.audio_bitrate,
            normalize_audio=req.normalize_audio,
            resolution=req.resolution,
            use_gpu=False,  # Cloud server CPU transcode
            metadata={
                "title": extracted_meta.get("title", ""),
                "artist": extracted_meta.get("artist", ""),
                "album": extracted_meta.get("album", ""),
                "date": extracted_meta.get("year", ""),
            },
            cover_path=extracted_meta.get("thumbnail_path"),
            start_time=req.start_time,
            end_time=req.end_time,
            reconstruct_frequency_loss=req.reconstruct_frequency_loss,
            abort_event=job.abort_event,
            progress_callback=on_convert_progress,
        )

        job.output_path = converted_path
        job.filename = os.path.basename(converted_path)
        job.status = JobState.COMPLETED
        job.emit_progress(1.0, "Conversion complete! Ready to download.")

    def _execute_playlist_sync(self, job: Job, work_dir: str, out_dir: str):
        req = job.request
        if not req.source_url:
            raise ValueError("Playlist source URL is required.")

        safe_url = validate_url_or_raise(req.source_url)
        job.emit_progress(0.05, "Inspecting public playlist tracks...")

        playlist_info = fetch_playlist_entries(safe_url)
        entries = playlist_info.get("entries") or []
        if not entries:
            raise ValueError("No tracks could be found in this playlist.")

        # Cap entries to Web Lite policy limit
        if len(entries) > DEFAULT_POLICY.max_playlist_items:
            entries = entries[:DEFAULT_POLICY.max_playlist_items]

        job.items_total = len(entries)
        job.emit_progress(0.10, f"Found {len(entries)} items. Converting playlist tracks...")

        fmt = req.target_format
        is_audio = fmt in SUPPORTED_AUDIO_FORMATS
        converted_files = []

        for idx, entry in enumerate(entries, 1):
            if job.abort_event.is_set():
                job.status = JobState.CANCELLED
                return

            track_url = entry.get("url")
            track_title = entry.get("title") or f"Track {idx}"
            track_artist = entry.get("artist") or ""

            base_pct = 0.10 + ((idx - 1) / len(entries)) * 0.80
            job.emit_progress(base_pct, f"[{idx}/{len(entries)}] Ingesting {track_title}...")

            try:
                track_work_dir = os.path.join(work_dir, f"track_{idx}")
                os.makedirs(track_work_dir, exist_ok=True)

                extracted = fetch_media_stream(
                    source=track_url,
                    output_dir=track_work_dir,
                    audio_only=is_audio,
                    resolution=req.resolution,
                    fallback_title=track_title,
                    fallback_artist=track_artist,
                    abort_event=job.abort_event,
                    target_format=fmt,
                )

                track_filename = f"{idx:02d}_{track_title}.{fmt}"
                track_filename = "".join(c for c in track_filename if c.isalnum() or c in " ._-()").strip()

                converted = convert_media(
                    input_path=extracted["media_path"],
                    output_dir=out_dir,
                    output_filename=track_filename,
                    target_format=fmt,
                    bitrate=req.audio_bitrate,
                    normalize_audio=req.normalize_audio,
                    resolution=req.resolution,
                    use_gpu=False,
                    metadata={
                        "title": extracted.get("title") or track_title,
                        "artist": extracted.get("artist") or track_artist,
                        "album": playlist_info.get("playlist_title", ""),
                    },
                    cover_path=extracted.get("thumbnail_path"),
                    abort_event=job.abort_event,
                )
                converted_files.append(converted)
                job.items_completed = idx
            except Exception as e:
                # Log track error and continue batch
                print(f"Skipping track {idx} ({track_title}) due to: {e}")

        if not converted_files:
            raise RuntimeError("None of the tracks in the playlist could be converted.")

        # Bundle converted items into a ZIP archive for clean 1-click download
        job.emit_progress(0.92, "Archiving playlist into downloadable .zip...")
        zip_name = f"{playlist_info.get('playlist_title', 'Playlist')[:50].strip() or 'Playlist'}.zip"
        # Sanitize zip filename
        zip_name = "".join(c for c in zip_name if c.isalnum() or c in " ._-()").strip()
        zip_path = os.path.join(out_dir, zip_name)

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for fpath in converted_files:
                zf.write(fpath, arcname=os.path.basename(fpath))

        job.output_path = zip_path
        job.filename = zip_name
        job.status = JobState.COMPLETED
        job.emit_progress(1.0, f"Converted {len(converted_files)} tracks into {zip_name}!")

    async def run_reaper_task(self):
        """Periodically cleans up old jobs and temporary uploads."""
        while True:
            await asyncio.sleep(60)
            now = time.time()
            retention = DEFAULT_POLICY.output_retention_seconds

            # Clean expired jobs
            async with self._lock:
                for jid, job in list(self.jobs.items()):
                    if job.completed_at and (now - job.completed_at > retention):
                        jdir = os.path.join(JOBS_DIR, jid)
                        if os.path.exists(jdir):
                            shutil.rmtree(jdir, ignore_errors=True)
                        del self.jobs[jid]

            # Clean expired uploads
            for uid, info in list(self.uploads.items()):
                if now - info["created_at"] > retention:
                    if os.path.exists(info["path"]):
                        try:
                            os.remove(info["path"])
                        except OSError:
                            pass
                    del self.uploads[uid]


max_jobs = int(os.environ.get("CONCURRENT_JOBS", "1"))
manager = JobManager(max_concurrent=max_jobs)
