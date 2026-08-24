FROM python:3.12-slim AS builder
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
WORKDIR /app
RUN python -m venv "$VIRTUAL_ENV"
COPY services/ai-python/pyproject.toml ./
COPY services/ai-python/app ./app
RUN python -m pip install . \
    && python -c "import fastapi, uvicorn"

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY services/ai-python/app ./app
USER 65532:65532
EXPOSE 8001
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/health', timeout=2)"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
