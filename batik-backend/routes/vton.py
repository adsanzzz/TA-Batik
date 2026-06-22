from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import replicate
import os
import tempfile
import time

router = APIRouter(prefix="/vton", tags=["Virtual Try On"])

SHIRT_TEMPLATE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "uploads", "shirt_template.png"
)

@router.post("/try-on")
async def execute_vton(
    human_image: UploadFile = File(...),
    garment_image_url: str = Form(..., description="URL gambar kain batik yang sudah disimpan")
):
    """
    Pipeline 2 tahap:
    Tahap 1 - Buat gambar kemeja batik: Tempel motif batik ke template kemeja putih menggunakan img2img.
    Tahap 2 - Virtual Try-On: Pakaikan kemeja batik hasil tahap 1 ke foto user menggunakan IDM-VTON.
    """
    if not os.environ.get("REPLICATE_API_TOKEN"):
        raise HTTPException(
            status_code=500,
            detail="REPLICATE_API_TOKEN is not configured in .env"
        )

    if not os.path.exists(SHIRT_TEMPLATE_PATH):
        raise HTTPException(
            status_code=500,
            detail="Template kemeja tidak ditemukan. Pastikan file shirt_template.png ada di folder uploads."
        )

    temp_human_path = None
    batik_shirt_path = None

    try:
        # === TAHAP 1: Buat gambar kemeja batik dari template + kain batik ===
        # Dapatkan path kain batik
        filename = garment_image_url.split("/")[-1]
        fabric_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "uploads", filename
        )
        if not os.path.exists(fabric_path):
            raise HTTPException(status_code=404, detail=f"File kain batik tidak ditemukan: {filename}")

        print("TAHAP 1: Membuat gambar kemeja batik menggunakan IP-Adapter Style Transfer...")

        # Gunakan fofr/style-transfer:
        #   structure_image = template kemeja putih (untuk bentuk, kerah, kancing)
        #   style_image     = kain batik (untuk motif dan warna)
        with open(SHIRT_TEMPLATE_PATH, "rb") as s_img, \
             open(fabric_path, "rb") as f_img:

            style_transfer_output = replicate.run(
                "fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0",
                input={
                    "structure_image": s_img,      # Bentuk kemeja putih
                    "style_image": f_img,           # Motif & warna batik
                    "prompt": "A photorealistic collared batik shirt. The batik fabric pattern completely covers every inch of the shirt including collar, sleeves, pocket and body. Fully patterned, no plain areas. Studio photography.",
                    "negative_prompt": "plain white shirt, solid color, unpatterned, blank areas, no pattern, low quality, blurry",
                    "structure_depth_strength": 0.6,      # Lebih rendah = AI lebih bebas mengisi motif
                    "structure_denoising_strength": 0.88, # Lebih tinggi = motif batik menutupi seluruh kain
                    "model": "fast",
                    "width": 768,
                    "height": 768,
                    "number_of_images": 1
                }
            )

        batik_shirt_url = str(style_transfer_output[0]) if isinstance(style_transfer_output, list) else str(style_transfer_output)
        print(f"TAHAP 1 selesai! URL kemeja batik: {batik_shirt_url}")

        # Jeda 10 detik untuk menghindari rate limit Replicate
        print("Menunggu 10 detik sebelum Tahap 2 (rate limit avoidance)...")
        time.sleep(10)

        # === TAHAP 2: Pakaikan kemeja batik ke foto user (IDM-VTON) ===
        print("TAHAP 2: Memakaikan kemeja batik ke foto user...")

        # Simpan foto user ke temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_human:
            temp_human.write(await human_image.read())
            temp_human_path = temp_human.name

        with open(temp_human_path, "rb") as h_img:
            output = replicate.run(
                "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
                input={
                    "crop": False,
                    "seed": 42,
                    "steps": 30,
                    "category": "upper_body",
                    "force_dc": False,
                    "garm_img": batik_shirt_url,   # URL kemeja batik hasil Tahap 1
                    "human_img": h_img,
                    "mask_only": False,
                    "garment_des": "A short-sleeve collared button-up batik shirt with colorful floral pattern"
                }
            )

        if temp_human_path:
            os.remove(temp_human_path)

        result_url = str(output) if not isinstance(output, list) else str(output[0])

        print(f"TAHAP 2 selesai! URL hasil VTON: {result_url}")

        return {
            "status": "success",
            "vton_result_url": result_url,
            "batik_shirt_url": batik_shirt_url  # bonus: user bisa lihat kemeja batiknya juga
        }

    except Exception as e:
        try:
            if temp_human_path and os.path.exists(temp_human_path):
                os.remove(temp_human_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"VTON process failed: {str(e)}")
