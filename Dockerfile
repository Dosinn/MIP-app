# ==============================================================================
# Multi-Stage Dockerfile for MIP Platform (Basecamp ONCE Compatible)
# 1. Build React PWA Frontend
# 2. Setup Python FastAPI NLP Backend + Nginx Reverse Proxy + Supervisord
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# Copy frontend package manifests
COPY MIP/package*.json ./
RUN npm ci

# Copy frontend source and build production bundle
COPY MIP/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime (Python + Nginx + Supervisord)
# ------------------------------------------------------------------------------
FROM python:3.11-slim

# Install system dependencies: Nginx, Supervisor, curl (for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set Python environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/storage/huggingface \
    TRANSFORMERS_CACHE=/storage/huggingface

# Install Python requirements in separate layers to prevent memory exhaustion
COPY python/requirements.txt /app/python/
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r /app/python/requirements.txt

# Copy Python backend source code
COPY python/ /app/python/

# Copy built frontend assets from Stage 1 into Nginx webroot
COPY --from=frontend-builder /build/dist /var/www/html

# Setup Nginx and Supervisor configs
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create the mandatory ONCE /storage directory for persistent data and model cache
RUN mkdir -p /storage/huggingface /storage/data && \
    chmod -R 777 /storage

# ONCE requires HTTP traffic on port 80
EXPOSE 80

# Health check for Docker / ONCE
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/up || exit 1

# Start all services via Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
