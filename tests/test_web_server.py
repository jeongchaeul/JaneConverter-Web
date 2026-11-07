"""
Tests for JaneConverter Web FastAPI endpoints and job lifecycle.
"""

import sys
import os
from starlette.testclient import TestClient

# Ensure web-server directory is on sys.path
web_server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web-server"))
if web_server_dir not in sys.path:
    sys.path.insert(0, web_server_dir)

from app import app  # noqa: E402


client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_runtime_info():
    response = client.get("/api/v1/runtime")
    assert response.status_code == 200
    data = response.json()
    assert data["max_duration_seconds"] == 10800  # 3 hours
    assert data["max_video_height"] == 1080       # 1080p
    assert "mp3" in data["supported_audio"]
    assert "mp4" in data["supported_video"]
    assert "png" in data["supported_images"]


def test_reject_ssrf_job():
    payload = {
        "source_url": "http://169.254.169.254/latest/meta-data/",
        "target_format": "mp3",
    }
    response = client.post("/api/v1/jobs", json=payload)
    assert response.status_code == 400
    assert "restricted" in response.json()["detail"].lower()


def test_upload_and_create_job(tmp_path):
    dummy_file_path = tmp_path / "test_audio.wav"
    dummy_file_path.write_bytes(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")

    with open(dummy_file_path, "rb") as f:
        resp = client.post(
            "/api/v1/uploads",
            files={"file": ("test_audio.wav", f, "audio/wav")}
        )
    assert resp.status_code == 200
    upload_data = resp.json()
    upload_id = upload_data["upload_id"]
    assert upload_data["filename"] == "test_audio.wav"

    # Create conversion job using upload_id
    job_payload = {
        "upload_id": upload_id,
        "target_format": "mp3",
        "audio_bitrate": "192k",
    }
    job_resp = client.post("/api/v1/jobs", json=job_payload)
    assert job_resp.status_code == 202
    job_data = job_resp.json()
    assert "id" in job_data
    assert job_data["status"] in ("queued", "downloading", "converting", "completed")


def test_playlist_inspect_rejects_private_url():
    resp = client.post("/api/v1/playlist/inspect", json={"url": "http://localhost:8000/playlist"})
    assert resp.status_code == 400
