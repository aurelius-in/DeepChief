FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /workspace

COPY services/api/requirements.txt /workspace/services/api/requirements.txt
RUN pip install --no-cache-dir -r /workspace/services/api/requirements.txt

# Copy entire repo to ensure cross-service imports (e.g., services.receipts)
COPY . /workspace

EXPOSE 8080

ENV PYTHONPATH=/workspace

CMD ["uvicorn", "services.api.app.main:app", "--host", "0.0.0.0", "--port", "8080"]


