"""
Web Lite Security & Operational Policy for JaneConverter Web.

Enforces resource limits, duration and resolution ceilings, SSRF protection,
and strict disabled-by-default credential boundaries for publicly accessible
conversions.
"""

from dataclasses import dataclass
from typing import Optional, Tuple
import re

@dataclass(frozen=True)
class WebLitePolicy:
    """Security and operational bounds for JaneConverter Web Lite."""

    # Resource & Transcode Quotas
    max_duration_seconds: int = 10800  # 3 hours (10,800s)
    max_video_height: int = 1080       # Capped at 1080p
    allow_playlists: bool = True       # Public playlists supported
    max_playlist_items: int = 50       # Max items per playlist batch
    allow_catalog_matching: bool = True# Spotify & Apple Music metadata matching
    allow_cookies: bool = False        # Strictly disallowed in Web Lite

    # FFmpeg Security & CPU Containment
    ffmpeg_protocols: str = "file,pipe,crypto"
    ffmpeg_threads: int = 2            # Prevent CPU starvation on shared/free hosts

    # Server Storage & Lifecycles
    max_upload_size_bytes: int = 500 * 1024 * 1024  # 500 MiB upload limit
    job_timeout_seconds: int = 1800                 # 30-minute hard job timeout
    output_retention_seconds: int = 600             # 10-minute ephemeral artifact purge

    def clamp_resolution(self, requested_resolution: Optional[str]) -> str:
        """Clamp any requested resolution string to at most 1080p."""
        if not requested_resolution:
            return "1080p"
        res = requested_resolution.strip().lower()
        if res in ("original", "source", "best", "max", "8k", "4k", "2k", "1440p", "1440", "2160p", "2160", "4320p", "4320"):
            return "1080p"
        m = re.match(r"^(\d+)p?$", res)
        if m:
            try:
                height = int(m.group(1))
                if height > self.max_video_height:
                    return f"{self.max_video_height}p"
                return f"{height}p"
            except ValueError:
                pass
        return "1080p"

    def validate_duration(self, duration_seconds: Optional[float]) -> Tuple[bool, Optional[str]]:
        """Verify media duration does not exceed the allowed ceiling."""
        if duration_seconds is None or duration_seconds <= 0:
            return True, None
        if duration_seconds > self.max_duration_seconds:
            hours = self.max_duration_seconds // 3600
            return False, f"Media duration ({duration_seconds:.0f}s) exceeds the Web Lite limit of {hours} hours ({self.max_duration_seconds}s)."
        return True, None


DEFAULT_POLICY = WebLitePolicy()
