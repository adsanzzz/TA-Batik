from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from typing import List, Optional
from io import BytesIO
from PIL import Image, ImageOps
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

# GIF animasi dari foto-foto yang diambil
GIF_WIDTH = 480          # px; cukup tajam di HP, ukuran file tetap kecil
GIF_FRAME_MS = 700       # lama tiap foto tampil
GIF_MAX_FRAMES = 6
FRAME_MAX_BYTES = 8 * 1024 * 1024

# Jenis file per hasil photobox: kolase (png) dan animasi (gif)
FILE_KINDS = {
    "png": ("image/png", "Trisara_Photobox.png"),
    "gif": ("image/gif", "Trisara_Photobox.gif"),
}

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
        filenames = os.listdir(TEMP_DIR)
    except Exception as e:
        print(f"[WARN] Cleanup photobox temp failed: {e}")
        return
    for filename in filenames:
        # per file: satu file yang gagal dihapus (mis. sedang dibuka) tidak menghentikan sisanya
        filepath = os.path.join(TEMP_DIR, filename)
        try:
            if os.path.isfile(filepath):
                mtime = datetime.utcfromtimestamp(os.path.getmtime(filepath))
                if now - mtime > timedelta(hours=TTL_HOURS):
                    os.remove(filepath)
        except Exception as e:
            print(f"[WARN] Cleanup photobox temp gagal untuk {filename}: {e}")


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


# ─── GIF animasi dari foto-foto mentah ───────────────────────
def _build_gif(frames: List[bytes], path: str) -> bool:
    """
    Susun foto-foto jadi GIF yang berulang terus. Semua frame dipotong ke ukuran
    frame pertama supaya animasinya tidak goyang. Return False kalau gagal.
    """
    images = []
    for raw in frames[:GIF_MAX_FRAMES]:
        img = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
        images.append(img)
    if len(images) < 2:
        return False

    first = images[0]
    size = (GIF_WIDTH, round(first.height * GIF_WIDTH / first.width))
    # palet 256 warna per frame; dither halus agar gradasi kulit tidak belang
    palette_frames = [
        ImageOps.fit(img, size, Image.Resampling.LANCZOS).quantize(
            colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG
        )
        for img in images
    ]
    palette_frames[0].save(
        path,
        save_all=True,
        append_images=palette_frames[1:],
        duration=GIF_FRAME_MS,
        loop=0,
        disposal=2,
    )
    return True


# ─── Upload foto sementara ────────────────────────────────────
@router.post("/photobox/upload-temp")
async def upload_photobox_temp(
    request: Request,
    file: UploadFile = File(...),
    frames: Optional[List[UploadFile]] = File(None),
):
    """
    Menerima kolase PNG hasil photobox (+ opsional foto-foto mentahnya sebagai
    `frames` untuk dijadikan GIF), simpan sementara (24 jam),
    return URL halaman preview yang bisa di-embed di QR code.
    """
    # Cleanup file lama sebelum upload baru
    cleanup_old_files()

    try:
        unique_id = uuid.uuid4().hex
        contents = await file.read()
        with open(_temp_filepath(unique_id, "png"), "wb") as f:
            f.write(contents)

        # GIF opsional: kalau gagal, kolase tetap tersimpan & QR tetap jalan
        has_gif = False
        if frames and len(frames) >= 2:
            try:
                raw_frames = []
                for frame in frames[:GIF_MAX_FRAMES]:
                    data = await frame.read()
                    if data and len(data) <= FRAME_MAX_BYTES:
                        raw_frames.append(data)
                has_gif = await asyncio.to_thread(
                    _build_gif, raw_frames, _temp_filepath(unique_id, "gif")
                )
            except Exception as e:
                print(f"[WARN] Photobox GIF gagal dibuat: {e}")

        base = _public_base_url(request)
        return {
            "success": True,
            "uuid": unique_id,
            "download_url": f"/photobox/download/{unique_id}",
            # QR & tombol copy link mengarah ke halaman preview (bukan unduh langsung),
            # supaya pengunjung bisa lihat fotonya dulu lalu pilih unduh.
            "qr_url": f"{base}/photobox/p/{unique_id}",
            "page_url": f"{base}/photobox/p/{unique_id}",
            "has_gif": has_gif,
            "expires_in": f"{TTL_HOURS} jam"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload gagal: {str(e)}")


# ─── Helper file & masa berlaku ──────────────────────────────
def _temp_filepath(unique_id: str, kind: str = "png") -> str:
    """Path file photobox, sekaligus validasi UUID & jenis file (cegah path traversal)."""
    if not unique_id.replace("-", "").isalnum() or len(unique_id) > 64:
        raise HTTPException(status_code=400, detail="UUID tidak valid")
    if kind not in FILE_KINDS:
        raise HTTPException(status_code=400, detail="Jenis file tidak valid")
    return os.path.join(TEMP_DIR, f"pb_{unique_id}.{kind}")


def _is_available(filepath: str) -> bool:
    return os.path.exists(filepath) and _time_left(filepath) is not None


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
  /* struk/koran bisa sangat panjang: batasi tinggi preview supaya tombol unduh tetap kelihatan */
  .shot img{display:block;max-width:100%;max-height:58vh;width:auto;height:auto;margin:0 auto}
  .btn{display:block;width:100%;background:#033EEE;color:#fff;text-decoration:none;
       font-size:1rem;font-weight:700;padding:15px 18px;border-radius:14px;
       box-shadow:0 8px 22px rgba(3,62,238,.30)}
  .btn:active{transform:translateY(1px)}
  .hint{margin-top:14px;font-size:.76rem;color:#5A6480;line-height:1.55}
  .hint b{color:#0C1B4D}
  .expired{font-size:2.6rem;margin-bottom:6px}
  .foot{margin-top:18px;font-size:.68rem;color:#8A93A6;letter-spacing:.4px}
  /* tab Foto / GIF tanpa JavaScript: radio tersembunyi + :checked */
  .tabs{display:flex;gap:4px;margin-top:18px;padding:4px;background:#EEF3FF;
        border:1px solid #E1E7F5;border-radius:30px}
  .tabs label{flex:1;padding:9px 0;border-radius:26px;font-size:.85rem;font-weight:700;
              color:#5A6480;cursor:pointer}
  .panel{display:none}
  #v-foto:checked ~ .tabs label[for=v-foto],
  #v-gif:checked ~ .tabs label[for=v-gif]{background:#033EEE;color:#fff;
                                           box-shadow:0 2px 8px rgba(3,62,238,.28)}
  #v-foto:checked ~ .p-foto, #v-gif:checked ~ .p-gif{display:block}
  .panel .shot{margin-top:14px}
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
    filepath = _temp_filepath(unique_id, "png")

    if not _is_available(filepath):
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
    expiry = f'Link ini berlaku <b>{TTL_HOURS} jam</b> &middot; kadaluarsa <b>{left_txt}</b>'
    photo_panel = (
        f'<div class="shot"><img src="/photobox/view/{unique_id}" alt="Hasil photobox Trisara"></div>'
        f'<a class="btn" href="/photobox/download/{unique_id}" download="Trisara_Photobox.png">'
        f'\u2b07\ufe0f&nbsp;&nbsp;Unduh Foto</a>'
    )

    if _is_available(_temp_filepath(unique_id, "gif")):
        gif_panel = (
            f'<div class="shot"><img src="/photobox/view/{unique_id}?type=gif" alt="GIF photobox Trisara"></div>'
            f'<a class="btn" href="/photobox/download/{unique_id}?type=gif" download="Trisara_Photobox.gif">'
            f'\u2b07\ufe0f&nbsp;&nbsp;Unduh GIF</a>'
        )
        body = (
            '<div>'
            '<input type="radio" name="v" id="v-foto" checked hidden>'
            '<input type="radio" name="v" id="v-gif" hidden>'
            '<div class="tabs"><label for="v-foto">Foto</label><label for="v-gif">GIF</label></div>'
            f'<div class="panel p-foto">{photo_panel}</div>'
            f'<div class="panel p-gif">{gif_panel}</div>'
            '</div>'
            f'<div class="hint">Di iPhone, kalau GIF tidak tersimpan ke galeri: tekan lama GIF-nya '
            f'lalu pilih <b>Simpan ke Foto</b>.<br>{expiry}</div>'
        )
    else:
        body = (
            f'{photo_panel}'
            f'<div class="hint">Tekan tombol di atas untuk menyimpan ke galeri.<br>{expiry}</div>'
        )
    page = _render_page("Hasil Photobox - Trisara", "HASIL FOTO KAMU", body)
    return HTMLResponse(content=page)


# ─── Tampilkan foto/GIF inline (untuk <img> di halaman preview) ──
@router.get("/photobox/view/{unique_id}")
async def view_photobox(unique_id: str, type: str = "png"):
    filepath = _temp_filepath(unique_id, type)
    if not _is_available(filepath):
        raise HTTPException(status_code=404, detail="File tidak ditemukan atau sudah kadaluarsa")
    media_type, filename = FILE_KINDS[type]
    return FileResponse(
        path=filepath,
        media_type=media_type,
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )


# ─── Download foto/GIF berdasarkan UUID ──────────────────────
@router.get("/photobox/download/{unique_id}")
async def download_photobox(unique_id: str, type: str = "png"):
    """
    Download file photobox sementara berdasarkan UUID (?type=png|gif).
    File dihapus otomatis setelah 24 jam.
    """
    filepath = _temp_filepath(unique_id, type)

    if not _is_available(filepath):
        raise HTTPException(
            status_code=404,
            detail=f"File tidak ditemukan atau sudah kadaluarsa (>{TTL_HOURS} jam)"
        )

    media_type, filename = FILE_KINDS[type]
    return FileResponse(
        path=filepath,
        media_type=media_type,
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
