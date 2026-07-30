FROM python:3.10-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

# Install system dependencies for OpenCV and PIL
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install TensorFlow CPU first to cache the heavy ML layer.
# (torch TIDAK dipakai lagi: embedding pakai FastEmbed/ONNX, bukan sentence-transformers.)
RUN pip install --no-cache-dir tensorflow-cpu==2.16.1

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

# Pastikan folder uploads dan assets ada
RUN mkdir -p /app/uploads /app/assets

# Salin template ke assets/ (tidak tertimpa volume mount)
RUN cp /app/uploads/shirt_template.png /app/assets/shirt_template.png 2>/dev/null || true && \
    cp /app/uploads/blouse_template.png /app/assets/blouse_template.png 2>/dev/null || true

EXPOSE 8000

# entrypoint.sh: salin template ke uploads/ lalu jalankan uvicorn
RUN chmod +x /app/entrypoint.sh
CMD ["/app/entrypoint.sh"]
