"""
FastAPI Application Entry Point for JaneConverter Web Lite.

Provides REST and SSE endpoints for media ingestion, public playlist expansion,
file upload, and multi-format conversion.
"""

import os
import uuid
import asyncio
import shutil
import subprocess
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from janeconverter.version import __version__
from janeconverter.policy import DEFAULT_POLICY
from janeconverter.net_guard import validate_url_or_raise
from janeconverter.extractor import fetch_playlist_entries
from janeconverter.constants import (
    SUPPORTED_AUDIO_FORMATS,
    SUPPORTED_VIDEO_FORMATS,
    SUPPORTED_IMAGE_FORMATS,
)

from schemas import (
    CreateJobRequest,
    JobResponse,
    PlaylistInspectRequest,
    PlaylistInspectResponse,
    PlaylistEntryItem,
    UploadResponse,
    RuntimeInfoResponse,
)
from worker import manager, UPLOADS_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start bgutil-pot POT daemon if available (YouTube Proof-of-Origin Token provider)
    pot_proc = None
    pot_bin = shutil.which("bgutil-pot") or ("/usr/local/bin/bgutil-pot" if os.path.exists("/usr/local/bin/bgutil-pot") else None)
    if pot_bin:
        try:
            pot_proc = subprocess.Popen(
                [pot_bin, "server", "--host", "127.0.0.1", "--port", "4416"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            print("[INFO] bgutil-pot POT provider server daemon started on 127.0.0.1:4416")
        except Exception as e:
            print(f"[WARN] Failed to start bgutil-pot daemon: {e}")

    # Start ephemeral file reaper task
    reaper = asyncio.create_task(manager.run_reaper_task())
    try:
        yield
    finally:
        reaper.cancel()
        if pot_proc:
            try:
                pot_proc.terminate()
            except Exception:
                pass


app = FastAPI(
    title="JaneConverter Web Lite API",
    version=__version__,
    description="Sovereign Public Media & Audio Engineering Web Converter",
    lifespan=lifespan,
)

# CORS configuration for Cloudflare Pages and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "JaneConverter Web Lite",
        "version": __version__,
    }


@app.get("/api/v1/runtime", response_model=RuntimeInfoResponse, tags=["Runtime"])
def get_runtime_info():
    return RuntimeInfoResponse(
        version=__version__,
        app_name="JaneConverter Web Lite",
        max_duration_seconds=DEFAULT_POLICY.max_duration_seconds,
        max_video_height=DEFAULT_POLICY.max_video_height,
        max_playlist_items=DEFAULT_POLICY.max_playlist_items,
        supported_audio=sorted(list(SUPPORTED_AUDIO_FORMATS)),
        supported_video=sorted(list(SUPPORTED_VIDEO_FORMATS)),
        supported_images=sorted(list(SUPPORTED_IMAGE_FORMATS)),
    )


@app.post("/api/v1/uploads", response_model=UploadResponse, tags=["Uploads"])
async def upload_file(file: UploadFile = File(...)):
    """Upload a local media file (bounded to max_upload_size_bytes)."""
    upload_id = uuid.uuid4().hex[:12]
    filename = os.path.basename(file.filename or "media_upload")
    clean_filename = "".join(c for c in filename if c.isalnum() or c in " ._-()").strip()
    destination = os.path.join(UPLOADS_DIR, f"{upload_id}_{clean_filename}")

    total_bytes = 0
    chunk_size = 1024 * 1024  # 1 MiB

    with open(destination, "wb") as f:
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > DEFAULT_POLICY.max_upload_size_bytes:
                os.remove(destination)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Uploaded file exceeds the maximum size limit of {DEFAULT_POLICY.max_upload_size_bytes // (1024*1024)} MiB.",
                )
            f.write(chunk)

    manager.register_upload(upload_id, destination, clean_filename, total_bytes)
    return UploadResponse(
        upload_id=upload_id,
        filename=clean_filename,
        size_bytes=total_bytes,
    )


@app.post("/api/v1/jobs", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Jobs"])
async def create_conversion_job(request: CreateJobRequest):
    """Enqueues a conversion job for a public URL or uploaded file."""
    if not request.source_url and not request.upload_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'source_url' or 'upload_id' must be provided.",
        )

    if request.source_url:
        try:
            validate_url_or_raise(request.source_url)
        except ValueError as err:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    job = await manager.create_job(request)
    return job.to_response()


@app.get("/api/v1/jobs/{job_id}", response_model=JobResponse, tags=["Jobs"])
def get_job_status(job_id: str):
    job = manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    return job.to_response()


@app.get("/api/v1/jobs/{job_id}/events", tags=["Jobs"])
def stream_job_events(job_id: str):
    """Real-time SSE event stream for live progress updates."""
    job = manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    return StreamingResponse(
        manager.subscribe_events(job_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.delete("/api/v1/jobs/{job_id}", tags=["Jobs"])
def cancel_job(job_id: str):
    success = manager.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    return {"status": "cancelled", "job_id": job_id}


@app.get("/api/v1/jobs/{job_id}/download", tags=["Jobs"])
def download_job_output(job_id: str):
    """Download the converted media file or playlist zip archive."""
    job = manager.get_job(job_id)
    if not job or not job.output_path or not os.path.exists(job.output_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job output file is not available or has expired.",
        )
    return FileResponse(
        path=job.output_path,
        filename=job.filename or "converted_media",
        media_type="application/octet-stream",
    )


@app.post("/api/v1/playlist/inspect", response_model=PlaylistInspectResponse, tags=["Playlists"])
def inspect_playlist(request: PlaylistInspectRequest):
    """Parses track metadata for a public Spotify, Apple Music, YouTube, or SoundCloud playlist."""
    try:
        safe_url = validate_url_or_raise(request.url)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    try:
        data = fetch_playlist_entries(safe_url)
        raw_entries = data.get("entries") or []
        parsed_entries = [
            PlaylistEntryItem(
                index=e.get("index", idx),
                title=e.get("title", f"Track {idx}"),
                artist=e.get("artist", ""),
                duration=e.get("duration", 0),
                duration_str=e.get("duration_str", "00:00"),
                url=e.get("url", ""),
                thumbnail=e.get("thumbnail", ""),
                album=e.get("album", ""),
            )
            for idx, e in enumerate(raw_entries, 1)
        ]
        return PlaylistInspectResponse(
            playlist_title=data.get("playlist_title", "Playlist"),
            source_type=data.get("source_type", "playlist"),
            total_count=len(parsed_entries),
            thumbnail_url=data.get("thumbnail_url", ""),
            entries=parsed_entries,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to inspect playlist: {e}")


# Optional SPA static files mount when desktop-ui is built
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "desktop-ui", "dist"))
if os.path.isdir(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
