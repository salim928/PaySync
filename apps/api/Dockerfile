FROM python:3.12-slim

WORKDIR /app

# System deps for asyncpg + cryptography
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps (cached layer)
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

# Copy source code only (secrets come from env vars)
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

EXPOSE 8000

# Railway sets $PORT dynamically
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
