#!/bin/sh
# Salin template pakaian ke folder uploads saat startup
# Ini perlu karena volume Docker menutupi /app/uploads saat runtime
echo "[STARTUP] Menyalin template pakaian ke /app/uploads..."
cp -n /app/assets/shirt_template.png /app/uploads/shirt_template.png 2>/dev/null && echo "[STARTUP] shirt_template.png disalin." || echo "[STARTUP] shirt_template.png sudah ada, lewati."
cp -n /app/assets/blouse_template.png /app/uploads/blouse_template.png 2>/dev/null && echo "[STARTUP] blouse_template.png disalin." || echo "[STARTUP] blouse_template.png sudah ada, lewati."

# Jalankan uvicorn
# --forwarded-allow-ips='*' supaya X-Forwarded-Proto/Host dari reverse proxy
# (Traefik/Dokploy) dipercaya, sehingga URL yang dibentuk backend memakai https
exec uvicorn main:app --host 0.0.0.0 --port 8000 --forwarded-allow-ips='*'

