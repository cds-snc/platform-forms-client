FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
  && apt-get install --no-install-recommends --yes python3 python3-pip python3-venv \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py ./

ENV WHISPER_DEVICE=cuda
ENV WHISPER_COMPUTE_TYPE=float16

EXPOSE 8080

CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080", "--no-access-log"]