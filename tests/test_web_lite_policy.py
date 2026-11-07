"""
Unit tests for JaneConverter Web Lite security policies, SSRF containment,
and resource quotas.
"""

import pytest
from janeconverter.policy import DEFAULT_POLICY, WebLitePolicy
from janeconverter.net_guard import is_safe_public_url, validate_url_or_raise
from janeconverter.constants import SAFE_FFMPEG_PROTOCOLS
from janeconverter.converter import build_ffmpeg_args
from janeconverter.extractor import build_video_format_selector


def test_web_lite_policy_defaults():
    policy = WebLitePolicy()
    assert policy.max_duration_seconds == 10800  # 3 hours
    assert policy.max_video_height == 1080       # 1080p
    assert policy.allow_playlists is True
    assert policy.max_playlist_items == 50
    assert policy.allow_cookies is False
    assert policy.ffmpeg_threads == 2


def test_resolution_clamping():
    assert DEFAULT_POLICY.clamp_resolution("4k") == "1080p"
    assert DEFAULT_POLICY.clamp_resolution("8k") == "1080p"
    assert DEFAULT_POLICY.clamp_resolution("2160p") == "1080p"
    assert DEFAULT_POLICY.clamp_resolution("1440p") == "1080p"
    assert DEFAULT_POLICY.clamp_resolution("original") == "1080p"
    assert DEFAULT_POLICY.clamp_resolution("720p") == "720p"
    assert DEFAULT_POLICY.clamp_resolution("480p") == "480p"
    assert DEFAULT_POLICY.clamp_resolution("360p") == "360p"


def test_video_format_selector_never_exceeds_1080p():
    selector_4k = build_video_format_selector("4k")
    assert "height<=1080" in selector_4k
    assert "2160" not in selector_4k

    selector_orig = build_video_format_selector("original")
    assert "height<=1080" in selector_orig

    selector_720 = build_video_format_selector("720p")
    assert "height<=720" in selector_720


def test_duration_validation():
    ok, err = DEFAULT_POLICY.validate_duration(3600)  # 1 hour
    assert ok is True
    assert err is None

    ok, err = DEFAULT_POLICY.validate_duration(10800)  # 3 hours exactly
    assert ok is True
    assert err is None

    ok, err = DEFAULT_POLICY.validate_duration(10801)  # 3 hours + 1 second
    assert ok is False
    assert "exceeds the Web Lite limit" in err


def test_ssrf_blocking_private_and_loopback():
    blocked_urls = [
        "http://127.0.0.1:8080/secret",
        "http://localhost:3000/",
        "http://[::1]/internal",
        "http://10.0.0.5/admin",
        "http://192.168.1.1/router",
        "http://172.16.0.1/backend",
        "http://169.254.169.254/latest/meta-data/",
        "http://100.100.100.200/latest/meta-data/",
        "http://metadata.google.internal/computeMetadata/v1/",
        "http://service.local/api",
        "ftp://example.com/file",
        "file:///etc/passwd",
    ]
    for url in blocked_urls:
        assert not is_safe_public_url(url), f"Expected {url} to be blocked!"
        with pytest.raises(ValueError):
            validate_url_or_raise(url)


def test_safe_public_urls_allowed():
    allowed_urls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://soundcloud.com/artist/track",
        "https://example.com/test.mp4",
    ]
    for url in allowed_urls:
        assert is_safe_public_url(url), f"Expected {url} to be allowed"
        assert validate_url_or_raise(url) == url


def test_safe_ffmpeg_protocols():
    assert "http" not in SAFE_FFMPEG_PROTOCOLS.split(",")
    assert "https" not in SAFE_FFMPEG_PROTOCOLS.split(",")
    assert "tcp" not in SAFE_FFMPEG_PROTOCOLS.split(",")
    assert "file" in SAFE_FFMPEG_PROTOCOLS.split(",")
    assert "pipe" in SAFE_FFMPEG_PROTOCOLS.split(",")


def test_ffmpeg_args_thread_limit():
    cmd = build_ffmpeg_args("input.mp4", "output.mp3", "mp3")
    threads_idx = cmd.index("-threads")
    assert cmd[threads_idx + 1] == str(DEFAULT_POLICY.ffmpeg_threads)
