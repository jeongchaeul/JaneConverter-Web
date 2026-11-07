# ==============================================================================
# Multi-stage Dockerfile for JaneConverter Web Lite
# Designed for Hugging Face Spaces (Docker SDK), Render, Fly.io, or self-hosting.
# Default port: 7860 (Hugging Face Spaces standard)
# ==============================================================================

# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/desktop-ui

COPY desktop-ui/package.json ./
RUN npm install

COPY desktop-ui/ ./
RUN npm run build

# Stage 2: Production Python & FFmpeg Container
FROM python:3.12-slim AS runner

# Install FFmpeg and system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create standard non-root user for Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copy python project definition and install dependencies
COPY pyproject.toml README.md LICENSE ./
COPY src/ ./src/
RUN pip install --no-cache-dir .

# Copy web-server implementation
COPY web-server/ ./web-server/

# Copy compiled frontend from Stage 1 into desktop-ui/dist
COPY --from=frontend-builder /app/desktop-ui/dist ./desktop-ui/dist

# Create storage directory for ephemeral jobs and set permissions
RUN mkdir -p /app/temp_web_jobs && chown -R appuser:appuser /app

USER appuser

ENV PORT=7860
ENV JANE_STORAGE_DIR=/app/temp_web_jobs
EXPOSE 7860

CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--app-dir", "web-server"]
