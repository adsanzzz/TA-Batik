from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import replicate
import os
import tempfile
import time

router = APIRouter(prefix="/vton", tags=["Virtual Try On"])

# Template disimpan di 'assets/' (BUKAN 'uploads/') supaya tidak tertutup Docker volume.
# uploads/ di-mount volume -> isinya bisa ketutup; assets/ selalu ikut image.
SHIRT_TEMPLATE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "assets", "shirt_template.png"
)
BLOUSE_TEMPLATE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "assets", "blouse_template.png"
)

@router.post("/try-on")
async def execute_vton(
    human_image: UploadFile = File(...),
    garment_image_url: str = Form(..., description="URL gambar kain batik yang sudah disimpan"),
    template_type: str = Form("male_shirt", description="Jenis template: 'male_shirt' atau 'female_blouse'")
):
    """
    Pipeline 2 tahap:
    Tahap 1 - Buat gambar kemeja/blus batik: Tempel motif batik ke template putih menggunakan img2img.
    Tahap 2 - Virtual Try-On: Pakaikan pakaian batik hasil tahap 1 ke foto user menggunakan IDM-VTON.
    """
    if not os.environ.get("REPLICATE_API_TOKEN"):
        raise HTTPException(
            status_code=500,
            detail="REPLICATE_API_TOKEN is not configured in .env"
        )

    # Pilih template pakaian berdasarkan jenis
    if template_type == "female_blouse":
        template_path = BLOUSE_TEMPLATE_PATH
        template_name = "blouse_template.png"
        prompt_garment = "A photorealistic short-sleeve female batik blouse. The batik fabric pattern completely covers every inch of the blouse. Fully patterned, no plain areas. Studio photography."
        description_garment = "A short-sleeve female batik blouse with colorful pattern"
    else:
        template_path = SHIRT_TEMPLATE_PATH
        template_name = "shirt_template.png"
        prompt_garment = "A photorealistic collared batik shirt. The batik fabric pattern completely covers every inch of the shirt including collar, sleeves, pocket and body. Fully patterned, no plain areas. Studio photography."
        description_garment = "A short-sleeve collared button-up batik shirt with colorful pattern"

    if not os.path.exists(template_path):
        raise HTTPException(
            status_code=500,
            detail=f"Template {template_name} tidak ditemukan. Pastikan file ada di folder uploads."
        )

    temp_human_path = None
    batik_shirt_path = None

    try:
        # === TAHAP 1: Buat gambar kemeja/blus batik dari template + kain batik ===
        # Dapatkan path kain batik
        filename = garment_image_url.split("/")[-1]
        fabric_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "uploads", filename
        )
        if not os.path.exists(fabric_path):
            raise HTTPException(status_code=404, detail=f"File kain batik tidak ditemukan: {filename}")

        print(f"TAHAP 1: Membuat gambar pakaian batik menggunakan IP-Adapter Style Transfer ({template_type})...")

        # Gunakan fofr/style-transfer:
        #   structure_image = template kemeja/blus putih (untuk bentuk)
        #   style_image     = kain batik (untuk motif dan warna)
        with open(template_path, "rb") as s_img, \
             open(fabric_path, "rb") as f_img:

            style_transfer_output = replicate.run(
                "fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0",
                input={
                    "structure_image": s_img,      # Bentuk pakaian putih
                    "style_image": f_img,           # Motif & warna batik
                    "prompt": prompt_garment,
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
        print(f"TAHAP 1 selesai! URL pakaian batik: {batik_shirt_url}")

        # Jeda 10 detik untuk menghindari rate limit Replicate
        print("Menunggu 10 detik sebelum Tahap 2 (rate limit avoidance)...")
        time.sleep(10)

        # === TAHAP 2: Pakaikan pakaian batik ke foto user (IDM-VTON) ===
        print("TAHAP 2: Memakaikan pakaian batik ke foto user...")

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
                    "garm_img": batik_shirt_url,   # URL pakaian batik hasil Tahap 1
                    "human_img": h_img,
                    "mask_only": False,
                    "garment_des": description_garment
                }
            )

        if temp_human_path:
            os.remove(temp_human_path)

        result_url = str(output) if not isinstance(output, list) else str(output[0])

        print(f"TAHAP 2 selesai! URL hasil VTON: {result_url}")

        return {
            "status": "success",
            "vton_result_url": result_url,
            "batik_shirt_url": batik_shirt_url
        }

    except Exception as e:
        try:
            if temp_human_path and os.path.exists(temp_human_path):
                os.remove(temp_human_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"VTON process failed: {str(e)}")
