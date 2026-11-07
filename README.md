---
title: JaneConverter Web Lite
emoji: 🎵
colorFrom: purple
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# JaneConverter Web Lite

<p align="center">
  <img src="assets/icon.png" width="128" height="128" alt="JaneConverter application icon" />
</p>

<p align="center">
  <strong>Sovereign Public Media Converter & Audio Engineering Web Suite</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Edition-Web%20Lite-purple?style=flat-square" alt="Edition" />
  <img src="https://img.shields.io/badge/Compute-Hugging%20Face%20Spaces%20(Docker)-blue?style=flat-square" alt="Hosting" />
  <img src="https://img.shields.io/badge/Edge%20CDN-Cloudflare%20Pages-orange?style=flat-square" alt="CDN" />
  <img src="https://img.shields.io/badge/Max%20Duration-3%20Hours-success?style=flat-square" alt="Duration Ceiling" />
  <img src="https://img.shields.io/badge/Max%20Resolution-1080p-blueviolet?style=flat-square" alt="Resolution Ceiling" />
</p>

> *"JaneConverter Web Lite is the streamlined, web-accessible edition of JaneConverter. Built for high-fidelity audio/video conversion, loudness normalization, and public playlist batch exports without installing local binaries."*  
> — **Jane Cerys** (`project//aspyr`)

---

## ⚡ Web Lite Features

- **Public Media Conversion**: High-speed audio and video transcoding for YouTube, SoundCloud, TikTok, X/Twitter, and public web media.
- **Streaming Catalog Resolution**: Public metadata resolution for Spotify and Apple Music tracks, albums, and playlists into downloadable studio masters.
- **Local File Uploads**: Convert files up to 500 MiB directly in your browser.
- **Public Playlists & Zip Bundles**: Batch convert up to 50 tracks per playlist with 1-click zipped downloads.
- **Studio Audio DSP**: EBU R128 loudness normalization (`-14 LUFS`), true-peak limiting (`-1.0 dBTP`), and harmonic frequency exciter for high-end sparkle.
- **SSRF & Network Containment**: DNS-pinned network guard prohibiting loopback, private RFC 1918 subnets, and cloud metadata access.
- **Zero Account / Cookie Tracking**: Completely air-gapped from private user sessions.

---

## 🌐 Deployment Architecture

JaneConverter Web Lite operates via a decoupled hybrid cloud model:

1. **Frontend Edge (Cloudflare Pages)**:
   - Hosted globally on Cloudflare Pages (`janeconverter.pages.dev`).
   - Reverse-proxies API requests (`/api/*`) seamlessly via `_redirects` to the container backend.
2. **Backend Engine (Hugging Face Spaces - Docker SDK)**:
   - Python 3.12 + FastAPI + FFmpeg container.
   - Provides REST endpoints, Server-Sent Events (SSE) real-time progress, and bounded concurrent job processing.

---

## 🚀 Local Development

```bash
# Setup Python engine and web server
uv sync
uv run python -m uvicorn app:app --app-dir web-server --reload --port 7860

# Setup and build frontend
cd desktop-ui
npm install
npm run build
npm run preview
```

---

## 🧪 Verification

```bash
# Run backend test suite
uv run pytest tests/ -v

# Run frontend tests
cd desktop-ui && npm test
```

---

## 📜 Sovereign Desktop Version

For browser cookie decryption, private story scraping, offline DPAPI extraction, and Studio DAW utilities (FL Studio `.flp` & Ableton `.als` project patching), see the full desktop repository at [JaneConverter Desktop](https://github.com/jeongchaeul/JaneConverter).

---

## License

JaneConverter Web Lite is released under the [MIT License](LICENSE).
