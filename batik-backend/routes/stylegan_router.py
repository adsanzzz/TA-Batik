import os
import io
import time
import base64
import httpx
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from PIL import Image

router = APIRouter(prefix="/stylegan", tags=["StyleGAN2 Generator & Mixer"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# URL Hugging Face Space API
HF_SPACE_URL = os.getenv("HF_SPACE_URL", "https://umanzz-trisara-batik-ai.hf.space")

def save_image_from_base64(b64_str: str, filename: str) -> str:
    """Simpan gambar base64 dari HF ke folder uploads/generated."""
    # Hapus header data URI jika ada
    if "base64," in b64_str:
        b64_str = b64_str.split("base64,")[1]
    
    img_bytes = base64.b64decode(b64_str)
    upload_dir = os.path.join(BASE_DIR, "uploads", "generated")
    os.makedirs(upload_dir, exist_ok=True)
    
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(img_bytes)
    
    return f"uploads/generated/{filename}"

@router.get("/generate")
async def generate_from_seed(seed: int = Query(..., description="Random seed (angka integer)")):
    """
    Generate gambar batik baru menggunakan single seed via Hugging Face API.
    """
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{HF_SPACE_URL}/api/predict",
                json={
                    "data": [float(seed)],
                    "fn_index": 1  # Tab StyleGAN adalah fungsi index 1
                }
            )
            response.raise_for_status()
            result = response.json()

        # Hasil dari Gradio berupa base64 image
        img_data = result["data"][0]
        filename = f"gen_seed_{seed}_{int(time.time())}.png"
        relative_path = save_image_from_base64(img_data, filename)

        return {
            "status": "success",
            "seed": seed,
            "image_url": f"/uploads/generated/{filename}"
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Gagal menghubungi Hugging Face AI: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal men-generate gambar batik: {str(e)}")

@router.get("/mix")
async def mix_seeds(
    seed_a: int = Query(..., description="Seed untuk Batik A"),
    seed_b: int = Query(..., description="Seed untuk Batik B"),
    weight: float = Query(0.5, ge=0.0, le=1.0, description="Bobot interpolasi (0.0 = A, 1.0 = B)")
):
    """
    Mix dua seed batik menggunakan interpolasi via Hugging Face API.
    Karena HF Space kita expose fungsi generate tunggal,
    kita generate dua gambar lalu blend secara lokal (ringan, tanpa AI).
    """
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Generate gambar A
            resp_a = await client.post(
                f"{HF_SPACE_URL}/api/predict",
                json={"data": [float(seed_a)], "fn_index": 1}
            )
            resp_a.raise_for_status()
            
            # Generate gambar B
            resp_b = await client.post(
                f"{HF_SPACE_URL}/api/predict",
                json={"data": [float(seed_b)], "fn_index": 1}
            )
            resp_b.raise_for_status()

        img_data_a = resp_a.json()["data"][0]
        img_data_b = resp_b.json()["data"][0]
        
        if "base64," in img_data_a:
            img_data_a = img_data_a.split("base64,")[1]
        if "base64," in img_data_b:
            img_data_b = img_data_b.split("base64,")[1]

        # Blend kedua gambar secara lokal (tanpa AI, sangat ringan)
        img_a = Image.open(io.BytesIO(base64.b64decode(img_data_a))).convert("RGB")
        img_b = Image.open(io.BytesIO(base64.b64decode(img_data_b))).convert("RGB")
        img_b = img_b.resize(img_a.size)
        blended = Image.blend(img_a, img_b, weight)

        # Simpan hasil blend
        filename = f"mix_{seed_a}_{seed_b}_{int(time.time())}.png"
        upload_dir = os.path.join(BASE_DIR, "uploads", "generated")
        os.makedirs(upload_dir, exist_ok=True)
        blended.save(os.path.join(upload_dir, filename))

        return {
            "status": "success",
            "seed_a": seed_a,
            "seed_b": seed_b,
            "weight": weight,
            "image_url": f"/uploads/generated/{filename}"
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Gagal menghubungi Hugging Face AI: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal melakukan blending batik: {str(e)}")

@router.post("/nst-blend")
async def nst_blend(
    content_image: UploadFile = File(...),
    style_image: UploadFile = File(...),
    style_strength: float = Form(1.0, ge=0.0, le=1.0, description="Kekuatan penerapan gaya (0.0 - 1.0)"),
    preserve_color: bool = Form(False, description="Apakah warna asli batik konten dipertahankan")
):
    """
    Neural Style Transfer via Hugging Face API.
    """
    try:
        content_bytes = await content_image.read()
        style_bytes = await style_image.read()
        
        content_b64 = "data:image/jpeg;base64," + base64.b64encode(content_bytes).decode("utf-8")
        style_b64 = "data:image/jpeg;base64," + base64.b64encode(style_bytes).decode("utf-8")

        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{HF_SPACE_URL}/api/predict",
                json={
                    "data": [content_b64, style_b64, style_strength],
                    "fn_index": 2  # Tab NST adalah fungsi index 2
                }
            )
            response.raise_for_status()
            result = response.json()

        img_data = result["data"][0]
        filename = f"nst_{int(time.time())}.png"
        upload_dir = os.path.join(BASE_DIR, "uploads", "generated")
        os.makedirs(upload_dir, exist_ok=True)

        if "base64," in img_data:
            img_data = img_data.split("base64,")[1]
        
        img_bytes = base64.b64decode(img_data)
        stylized_pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Preserve Color jika diminta (lokal, ringan)
        if preserve_color:
            content_pil = Image.open(io.BytesIO(content_bytes)).convert("RGB").resize(stylized_pil.size)
            content_ycbcr = content_pil.convert("YCbCr")
            stylized_ycbcr = stylized_pil.convert("YCbCr")
            s_y, _, _ = stylized_ycbcr.split()
            _, c_cb, c_cr = content_ycbcr.split()
            stylized_pil = Image.merge("YCbCr", (s_y, c_cb, c_cr)).convert("RGB")

        filepath = os.path.join(upload_dir, filename)
        stylized_pil.save(filepath)

        return {
            "status": "success",
            "image_url": f"/uploads/generated/{filename}"
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Gagal menghubungi Hugging Face AI: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal melakukan style transfer: {str(e)}")
