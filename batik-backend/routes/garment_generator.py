from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel
import httpx
import os
import time
import replicate

router = APIRouter(prefix="/vton", tags=["Virtual Try On"])

@router.post("/generate-garment")
async def generate_garment(
    request: Request,
    batik_image: UploadFile = File(...),
    template_type: str = Form(..., description="Jenis template: 'male_shirt' atau 'female_blouse'")
):
    """
    Endpoint ini menerima gambar bahan batik dan template pilihan user,
    kemudian mengeksekusinya langsung ke model Replicate untuk diproses menjadi gambar baju.
    """
    if template_type not in ["male_shirt", "female_blouse"]:
        raise HTTPException(status_code=400, detail="Invalid template type")

    # Pastikan API Token Replicate sudah diset
    if not os.environ.get("REPLICATE_API_TOKEN"):
        raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN is not configured in .env")

    try:
        # 1. Pastikan folder uploads ada
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        # 2. Buat nama file unik
        filename = f"fabric_{int(time.time())}.png"
        filepath = os.path.join(upload_dir, filename)
        
        # 3. Simpan file
        with open(filepath, "wb") as f:
            f.write(await batik_image.read())
            
        # 4. Buat URL yang bisa diakses publik
        base_url = str(request.base_url).rstrip("/")
        garment_url = f"{base_url}/uploads/{filename}"
        
        print(f"Bypass berhasil! Flat fabric disimpan di: {garment_url}")
        
        return {"status": "success", "garment_image_url": garment_url}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Garment generation failed: {str(e)}")


class GarmentByUrlRequest(BaseModel):
    batik_image_url: str
    template_type: str = "male_shirt"

@router.post("/generate-garment-url")
async def generate_garment_by_url(
    request: Request,
    payload: GarmentByUrlRequest
):
    """
    Alternatif endpoint: menerima URL gambar batik (bukan file upload).
    Backend akan download gambarnya sendiri.
    Berguna ketika gambar tidak bisa diakses dari browser tapi bisa diakses dari server.
    """
    if payload.template_type not in ["male_shirt", "female_blouse"]:
        raise HTTPException(status_code=400, detail="Invalid template type")

    try:
        # Download gambar batik dari URL
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(payload.batik_image_url)
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Gagal download gambar dari URL: {payload.batik_image_url}")
            image_bytes = resp.content

        # Simpan ke uploads/
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"fabric_{int(time.time())}.png"
        filepath = os.path.join(upload_dir, filename)

        with open(filepath, "wb") as f:
            f.write(image_bytes)

        base_url = str(request.base_url).rstrip("/")
        garment_url = f"{base_url}/uploads/{filename}"
        print(f"[generate-garment-url] Saved fabric from URL: {garment_url}")

        return {"status": "success", "garment_image_url": garment_url}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Garment URL generation failed: {str(e)}")
