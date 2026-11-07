"""
Pydantic Request and Response Schemas for JaneConverter Web API.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class JobState(str, Enum):
    QUEUED = "queued"
    DOWNLOADING = "downloading"
    CONVERTING = "converting"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class CreateJobRequest(BaseModel):
    """Payload to initiate a new conversion job."""
    source_url: Optional[str] = Field(default=None, description="Public media or playlist URL")
    upload_id: Optional[str] = Field(default=None, description="ID of a previously uploaded local file")
    target_format: str = Field(default="mp3", description="Target container format (mp3, wav, flac, mp4, etc.)")
    audio_bitrate: str = Field(default="320k", description="Audio quality / bitrate")
    resolution: str = Field(default="1080p", description="Video resolution ceiling (capped at 1080p)")
    normalize_audio: bool = Field(default=False, description="Apply EBU R128 loudness normalization")
    reconstruct_frequency_loss: bool = Field(default=False, description="Apply harmonic exciter for high-end sparkle")
    start_time: Optional[str] = Field(default=None, description="Trim start offset (HH:MM:SS or seconds)")
    end_time: Optional[str] = Field(default=None, description="Trim end offset (HH:MM:SS or seconds)")
    is_playlist: bool = Field(default=False, description="Whether source is a playlist/album to batch convert")

    @field_validator("target_format")
    @classmethod
    def clean_format(cls, v: str) -> str:
        cleaned = v.strip().lower().lstrip(".")
        if not cleaned:
            return "mp3"
        return cleaned


class JobResponse(BaseModel):
    """Status and progress representation of a conversion job."""
    id: str
    status: JobState
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    step: str = ""
    filename: Optional[str] = None
    download_url: Optional[str] = None
    error: Optional[str] = None
    duration: Optional[float] = None
    created_at: float
    is_playlist: bool = False
    items_total: int = 1
    items_completed: int = 0


class PlaylistEntryItem(BaseModel):
    index: int
    title: str
    artist: str = ""
    duration: int = 0
    duration_str: str = "00:00"
    url: str
    thumbnail: str = ""
    album: str = ""


class PlaylistInspectRequest(BaseModel):
    url: str


class PlaylistInspectResponse(BaseModel):
    playlist_title: str
    source_type: str
    total_count: int
    thumbnail_url: str = ""
    entries: List[PlaylistEntryItem] = []


class UploadResponse(BaseModel):
    upload_id: str
    filename: str
    size_bytes: int


class RuntimeInfoResponse(BaseModel):
    version: str
    app_name: str = "JaneConverter Web Lite"
    max_duration_seconds: int = 10800
    max_video_height: int = 1080
    max_playlist_items: int = 50
    supported_audio: List[str]
    supported_video: List[str]
    supported_images: List[str]
