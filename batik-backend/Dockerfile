FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and PIL
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt && \
    pip install --no-cache-dir --no-deps tensorflow-hub

# Download Classification Model from Hugging Face space
RUN apt-get update && apt-get install -y wget && \
    mkdir -p models && \
    wget -qO models/model_94ebc873b24c497cba3157eb944d2db7.keras https://huggingface.co/spaces/Umanzz/trisara-batik-ai/resolve/main/model_94ebc873b24c497cba3157eb944d2db7.keras

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
