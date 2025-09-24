FROM python:3.11-slim
WORKDIR /workspace
COPY services/api/requirements.txt /workspace/services/api/requirements.txt
RUN pip install --no-cache-dir -r /workspace/services/api/requirements.txt
COPY . /workspace
ENV PYTHONPATH=/workspace
CMD ["python", "-m", "services.scheduler.main"]

