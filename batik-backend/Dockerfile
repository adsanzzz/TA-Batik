FROM python:3.10-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

# Install system dependencies for OpenCV and PIL
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU-only version & TensorFlow CPU first to cache heavy ML dependencies
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir tensorflow-cpu

COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt && \
    pip install --no-cache-dir --no-deps tensorflow-hub

# Download Models from Internet (so they don't bloat GitHub Repo)
RUN apt-get update && apt-get install -y wget tar && \
    mkdir -p models && \
    wget -O models/model_94ebc873b24c497cba3157eb944d2db7.keras https://huggingface.co/spaces/Umanzz/trisara-batik-ai/resolve/main/model_94ebc873b24c497cba3157eb944d2db7.keras && \
    wget -O models/magenta.tar.gz "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2?tf-hub-format=compressed" && \
    mkdir -p models/magenta_nst && \
    tar -xzf models/magenta.tar.gz -C models/magenta_nst && \
    rm models/magenta.tar.gz

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
