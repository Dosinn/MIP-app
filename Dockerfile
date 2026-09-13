# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY MIP/package*.json ./
RUN npm ci

COPY MIP/ ./
RUN npm run build


# Stage 2: Production Runtime (Python + Nginx + Supervisord)
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/storage/huggingface \
    TRANSFORMERS_CACHE=/storage/huggingface

COPY python/requirements.txt /app/python/
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r /app/python/requirements.txt

COPY python/ /app/python/

COPY --from=frontend-builder /build/dist /var/www/html

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p /storage/huggingface /storage/data && \
    chmod -R 777 /storage

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/up || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
