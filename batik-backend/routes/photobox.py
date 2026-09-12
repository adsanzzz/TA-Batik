from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse
import os
import socket
import uuid
import asyncio
from datetime import datetime, timedelta

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMP_DIR = os.path.join(BASE_DIR, "uploads", "photobox_temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# ─── Base URL publik untuk QR code ───────────────────────────
def _detect_lan_ip():
    """IP LAN mesin ini (mis. 192.168.x.x), supaya QR bisa dibuka dari HP."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # tidak benar-benar mengirim paket, hanya memilih interface keluar
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]
    except Exception:
        return None
    finally:
        sock.close()


def _public_base_url(request: Request) -> str:
    """
    URL yang dipakai di QR code. Prioritas:
    1. env PUBLIC_BASE_URL (wajib saat production / di balik domain & tunnel)
    2. IP LAN mesin ini, kalau backend diakses lewat localhost
       (QR berisi 'localhost' tidak bisa dibuka dari HP — localhost-nya jadi HP itu sendiri)
    3. host asal request
    """
    env_base = os.getenv("PUBLIC_BASE_URL", "").strip().rstrip("/")
    if env_base:
        return env_base

    host = request.url.hostname or ""
    if host in ("localhost", "127.0.0.1", "0.0.0.0", "::1", ""):
        lan_ip = _detect_lan_ip()
        if lan_ip:
            port = request.url.port
            if port and port not in (80, 443):
                return f"{request.url.scheme}://{lan_ip}:{port}"
            return f"{request.url.scheme}://{lan_ip}"

    return str(request.base_url).rstrip("/")


# ─── TTL Cleanup (hapus file > 24 jam) ───────────────────────
def cleanup_old_files():
    now = datetime.utcnow()
    try:
        for filename in os.listdir(TEMP_DIR):
            filepath = os.path.join(TEMP_DIR, filename)
            if os.path.isfile(filepath):
                mtime = datetime.utcfromtimestamp(os.path.getmtime(filepath))
                if now - mtime > timedelta(hours=24):
                    os.remove(filepath)
    except Exception as e:
        print(f"[WARN] Cleanup photobox temp failed: {e}")


# ─── Upload foto sementara ────────────────────────────────────
@router.post("/photobox/upload-temp")
async def upload_photobox_temp(request: Request, file: UploadFile = File(...)):
    """
    Menerima file PNG/JPG hasil photobox, simpan sementara (24 jam),
    return URL download yang bisa di-embed di QR code.
    """
    # Cleanup file lama sebelum upload baru
    cleanup_old_files()

    try:
        ext = ".png"
        unique_id = uuid.uuid4().hex
        filename = f"pb_{unique_id}{ext}"
        filepath = os.path.join(TEMP_DIR, filename)

        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        download_path = f"/photobox/download/{unique_id}"
        return {
            "success": True,
            "uuid": unique_id,
            "download_url": download_path,
            # URL absolut siap dipakai QR code (bisa dibuka dari perangkat lain)
            "qr_url": f"{_public_base_url(request)}{download_path}",
            "expires_in": "24 jam"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload gagal: {str(e)}")


# ─── Download foto berdasarkan UUID ──────────────────────────
@router.get("/photobox/download/{unique_id}")
async def download_photobox(unique_id: str):
    """
    Download file photobox sementara berdasarkan UUID.
    File dihapus otomatis setelah 24 jam.
    """
    # Sanitize UUID untuk keamanan (hanya hex chars)
    if not unique_id.replace("-", "").isalnum() or len(unique_id) > 64:
        raise HTTPException(status_code=400, detail="UUID tidak valid")

    filename = f"pb_{unique_id}.png"
    filepath = os.path.join(TEMP_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=404,
            detail="File tidak ditemukan atau sudah kadaluarsa (>24 jam)"
        )

    return FileResponse(
        path=filepath,
        media_type="image/png",
        filename="Trisara_Photobox.png",
        headers={"Content-Disposition": "attachment; filename=Trisara_Photobox.png"}
    )
