# Multi-stage build for production
FROM node:20-alpine as frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend build
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements*.txt ./
RUN pip install --no-cache-dir -r requirements-prod.txt

# Copy backend code
COPY backend/ ./
COPY reset_db.py ./
COPY rolling_stone_top_500_albums_2020.csv ./

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./static

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Set environment variables
ENV FLASK_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start gunicorn
CMD exec gunicorn --bind :$PORT --workers 2 --threads 2 --timeout 60 wsgi:app