# JaneConverter Web Lite: Cloudflare + Hugging Face Deployment Guide

This guide covers deploying JaneConverter Web Lite with:
- **Cloudflare Pages** (Global Edge CDN hosting the React UI for free)
- **Hugging Face Spaces** (Docker SDK hosting the Python/FFmpeg transcode engine for free with 16GB RAM)

---

## Architecture Overview

```
User Browser
    │
    ▼
[Cloudflare Pages] (janeconverter.pages.dev)
    │  - Serves React SPA & Static Assets
    │  - Proxies /api/* to Hugging Face
    ▼
[Hugging Face Space] (https://<username>-janeconverter-web.hf.space)
    │  - Python 3.12 + FastAPI
    │  - FFmpeg Transcoding Engine (Capped at 1080p, 3-hour limit)
    │  - Ephemeral scratch storage (10-minute auto-purge)
```

---

## Part 1: Deploy Backend to Hugging Face Spaces

### Method A: Automated CLI Script (Recommended)

1. Get a free Hugging Face User Access Token with **Write** permissions:
   👉 [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Run the deployment script from your terminal:
   ```bash
   uv run python packaging/deploy_hf_space.py --token <YOUR_HF_TOKEN>
   ```
3. The script will automatically create the Docker Space `https://huggingface.co/spaces/<your-username>/janeconverter-web` and upload the container.
4. Note your Direct API endpoint:
   `https://<your-username>-janeconverter-web.hf.space`

---

## Part 2: Connect Frontend to Cloudflare Pages

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select repository: `jeongchaeul/JaneConverter-Web`.
3. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `desktop-ui`
4. Update `desktop-ui/public/_redirects`:
   ```
   /api/*  https://<your-username>-janeconverter-web.hf.space/api/:splat  200
   ```
5. Click **Save and Deploy**. Cloudflare Pages will build the site and provide your live URL (e.g. `https://janeconverter.pages.dev`).
