from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
import os
import socket
import uuid
import asyncio
from datetime import datetime, timedelta

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMP_DIR = os.path.join(BASE_DIR, "uploads", "photobox_temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# Masa berlaku link & halaman preview
TTL_HOURS = 24

# Selang penyapuan file kadaluarsa (detik)
CLEANUP_INTERVAL_SECONDS = 3600

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


# ─── TTL Cleanup (hapus file lewat masa berlaku) ─────────────
def cleanup_old_files():
    now = datetime.utcnow()
    try:
        for filename in os.listdir(TEMP_DIR):
            filepath = os.path.join(TEMP_DIR, filename)
            if os.path.isfile(filepath):
                mtime = datetime.utcfromtimestamp(os.path.getmtime(filepath))
                if now - mtime > timedelta(hours=TTL_HOURS):
                    os.remove(filepath)
    except Exception as e:
        print(f"[WARN] Cleanup photobox temp failed: {e}")


# ─── Penyapu berkala ─────────────────────────────────────────
# cleanup_old_files() di atas hanya jalan saat ada upload baru. Task ini
# menyapu berkala supaya file kadaluarsa tetap terhapus walau booth sepi.
_cleanup_task = None


async def _cleanup_loop():
    while True:
        try:
            # file I/O dijalankan di thread lain agar tidak memblokir event loop
            await asyncio.to_thread(cleanup_old_files)
        except asyncio.CancelledError:
            raise
        except Exception as e:
            print(f"[WARN] Photobox cleanup loop error: {e}")
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)


async def start_cleanup_task():
    """Dipanggil saat startup app (lihat main.py)."""
    global _cleanup_task
    if _cleanup_task is None or _cleanup_task.done():
        _cleanup_task = asyncio.create_task(_cleanup_loop())
        print(f"[OK] Photobox cleanup task aktif (tiap {CLEANUP_INTERVAL_SECONDS // 60} menit).")


async def stop_cleanup_task():
    """Dipanggil saat shutdown app, supaya task tidak menggantung."""
    global _cleanup_task
    if _cleanup_task and not _cleanup_task.done():
        _cleanup_task.cancel()
        try:
            await _cleanup_task
        except asyncio.CancelledError:
            pass
        print("[OK] Photobox cleanup task dihentikan.")
    _cleanup_task = None


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

        base = _public_base_url(request)
        return {
            "success": True,
            "uuid": unique_id,
            "download_url": f"/photobox/download/{unique_id}",
            # QR & tombol copy link mengarah ke halaman preview (bukan unduh langsung),
            # supaya pengunjung bisa lihat fotonya dulu lalu pilih unduh.
            "qr_url": f"{base}/photobox/p/{unique_id}",
            "page_url": f"{base}/photobox/p/{unique_id}",
            "expires_in": f"{TTL_HOURS} jam"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload gagal: {str(e)}")


# ─── Helper file & masa berlaku ──────────────────────────────
def _temp_filepath(unique_id: str) -> str:
    """Path file photobox, sekaligus validasi UUID (cegah path traversal)."""
    if not unique_id.replace("-", "").isalnum() or len(unique_id) > 64:
        raise HTTPException(status_code=400, detail="UUID tidak valid")
    return os.path.join(TEMP_DIR, f"pb_{unique_id}.png")


def _time_left(filepath: str):
    """Sisa masa berlaku file. None kalau sudah lewat TTL."""
    mtime = datetime.utcfromtimestamp(os.path.getmtime(filepath))
    left = (mtime + timedelta(hours=TTL_HOURS)) - datetime.utcnow()
    return left if left.total_seconds() > 0 else None


def _format_left(left) -> str:
    total_minutes = int(left.total_seconds() // 60)
    hours, minutes = divmod(total_minutes, 60)
    if hours > 0:
        return f"{hours} jam {minutes} menit lagi"
    return f"{minutes} menit lagi"


# ─── Halaman preview foto (target QR code) ───────────────────
_PAGE_CSS = """
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
       background:#EEF3FF;color:#0C1B4D;min-height:100vh;display:flex;align-items:center;
       justify-content:center;padding:20px 16px}
  .card{background:#fff;border-radius:22px;padding:24px 20px 26px;width:100%;max-width:460px;
        box-shadow:0 18px 50px rgba(12,27,77,.14);border:1px solid #E1E7F5;text-align:center}
  .brand{font-size:1.55rem;font-weight:800;letter-spacing:-.4px;line-height:1.1}
  .brand span{color:#033EEE}
  .tag{display:inline-block;margin-top:8px;font-size:.66rem;font-weight:700;letter-spacing:1.4px;
       color:#5A6480;background:#EEF3FF;border:1px solid #E1E7F5;border-radius:20px;padding:4px 12px}
  .shot{margin:20px 0 18px;border-radius:14px;overflow:hidden;border:1px solid #E1E7F5;
        background:#F7F9FF;box-shadow:0 6px 20px rgba(12,27,77,.10)}
  .shot img{display:block;width:100%;height:auto}
  .btn{display:block;width:100%;background:#033EEE;color:#fff;text-decoration:none;
       font-size:1rem;font-weight:700;padding:15px 18px;border-radius:14px;
       box-shadow:0 8px 22px rgba(3,62,238,.30)}
  .btn:active{transform:translateY(1px)}
  .hint{margin-top:14px;font-size:.76rem;color:#5A6480;line-height:1.55}
  .hint b{color:#0C1B4D}
  .expired{font-size:2.6rem;margin-bottom:6px}
  .foot{margin-top:18px;font-size:.68rem;color:#8A93A6;letter-spacing:.4px}
"""

_PAGE_HTML = """<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>__TITLE__</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>__CSS__</style>
</head>
<body>
  <div class="card">
    <div class="brand">Tri<span>sara</span> Photobox</div>
    <div class="tag">__TAG__</div>
    __BODY__
    <div class="foot">TRISARA &middot; BATIK NUSANTARA</div>
  </div>
</body>
</html>"""


def _render_page(title: str, tag: str, body: str) -> str:
    return (_PAGE_HTML
            .replace("__CSS__", _PAGE_CSS)
            .replace("__TITLE__", title)
            .replace("__TAG__", tag)
            .replace("__BODY__", body))


@router.get("/photobox/p/{unique_id}", response_class=HTMLResponse)
async def photobox_page(unique_id: str):
    """
    Halaman preview foto photobox: lihat hasilnya dulu, lalu tombol unduh.
    Ini target QR code. Berlaku TTL_HOURS jam sejak foto dibuat.
    """
    filepath = _temp_filepath(unique_id)

    if not os.path.exists(filepath) or _time_left(filepath) is None:
        body = (
            '<div class="shot" style="padding:34px 18px;border-style:dashed">'
            '<div class="expired">\u23f0</div>'
            '<div style="font-weight:700;margin-bottom:6px">Link sudah kadaluarsa</div>'
            f'<div style="font-size:.8rem;color:#5A6480;line-height:1.55">'
            f'Foto photobox hanya tersimpan {TTL_HOURS} jam.<br>Silakan foto ulang di booth Trisara.</div>'
            '</div>'
        )
        page = _render_page("Link Kadaluarsa - Trisara Photobox", "LINK KADALUARSA", body)
        return HTMLResponse(content=page, status_code=404)

    left_txt = _format_left(_time_left(filepath))
    body = (
        f'<div class="shot"><img src="/photobox/view/{unique_id}" alt="Hasil photobox Trisara"></div>'
        f'<a class="btn" href="/photobox/download/{unique_id}" download="Trisara_Photobox.png">'
        f'\u2b07\ufe0f&nbsp;&nbsp;Unduh Foto</a>'
        f'<div class="hint">Tekan tombol di atas untuk menyimpan ke galeri.<br>'
        f'Link ini berlaku <b>{TTL_HOURS} jam</b> &middot; kadaluarsa <b>{left_txt}</b></div>'
    )
    page = _render_page("Hasil Photobox - Trisara", "HASIL FOTO KAMU", body)
    return HTMLResponse(content=page)


# ─── Tampilkan foto inline (untuk <img> di halaman preview) ──
@router.get("/photobox/view/{unique_id}")
async def view_photobox(unique_id: str):
    filepath = _temp_filepath(unique_id)
    if not os.path.exists(filepath) or _time_left(filepath) is None:
        raise HTTPException(status_code=404, detail="File tidak ditemukan atau sudah kadaluarsa")
    return FileResponse(
        path=filepath,
        media_type="image/png",
        headers={"Content-Disposition": "inline; filename=Trisara_Photobox.png"}
    )


# ─── Download foto berdasarkan UUID ──────────────────────────
@router.get("/photobox/download/{unique_id}")
async def download_photobox(unique_id: str):
    """
    Download file photobox sementara berdasarkan UUID.
    File dihapus otomatis setelah 24 jam.
    """
    filepath = _temp_filepath(unique_id)

    if not os.path.exists(filepath) or _time_left(filepath) is None:
        raise HTTPException(
            status_code=404,
            detail=f"File tidak ditemukan atau sudah kadaluarsa (>{TTL_HOURS} jam)"
        )

    return FileResponse(
        path=filepath,
        media_type="image/png",
        filename="Trisara_Photobox.png",
        headers={"Content-Disposition": "attachment; filename=Trisara_Photobox.png"}
    )
