from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
import httpx
import os

import tempfile
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
        # Kita BYPASS proses Replicate di sini.
        # Karena model text-to-image/img2img standar tidak mampu mempertahankan motif rumit,
        # kita akan langsung menggunakan foto kain flat ini untuk dimasukkan ke IDM-VTON.
        # IDM-VTON cukup pintar untuk membedah flat texture menjadi baju.
        
        # 1. Pastikan folder uploads ada
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        # 2. Buat nama file unik
        import time
        filename = f"fabric_{int(time.time())}.png"
        filepath = os.path.join(upload_dir, filename)
        
        # 3. Simpan file
        with open(filepath, "wb") as f:
            f.write(await batik_image.read())
            
        # 4. Buat URL yang bisa diakses publik (menggunakan base URL dari request)
        base_url = str(request.base_url).rstrip("/")
        garment_url = f"{base_url}/uploads/{filename}"
        
        print(f"Bypass berhasil! Flat fabric disimpan di: {garment_url}")
        
        return {"status": "success", "garment_image_url": garment_url}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Garment generation failed: {str(e)}")
