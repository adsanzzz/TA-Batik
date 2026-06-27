import os
import shutil
import io
import time
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from PIL import Image
from gradio_client import Client
import numpy as np

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import tensorflow as tf
import tensorflow_hub as hub

router = APIRouter(prefix="/stylegan", tags=["StyleGAN2 Generator & Mixer"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# URL Hugging Face Space API
HF_SPACE_URL = os.getenv("HF_SPACE_URL", "Umanzz/trisara-batik-ai")
hf_client = Client(HF_SPACE_URL)

print("Loading Magenta NST model from TF Hub...")
try:
    # Mengunduh model otomatis dari TF Hub, hanya dieksekusi 1x saat startup
    nst_model = hub.load("https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2")
except Exception as e:
    print(f"Failed to load NST model: {e}")
    nst_model = None

def load_and_preprocess_img(image_bytes, target_dim=None):
    img_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = np.array(img_pil)
    img = tf.convert_to_tensor(img, dtype=tf.float32)
    img = tf.image.convert_image_dtype(img, tf.float32)
    if target_dim:
        img = tf.image.resize(img, [target_dim, target_dim])
    img = img[tf.newaxis, :]
    return img

@router.get("/generate")
async def generate_from_seed(seed: int = Query(..., description="Random seed (angka integer)")):
    """
    Generate gambar batik baru menggunakan single seed via Hugging Face API.
    """
    try:
        # Panggil Hugging Face API (Gradio)
        result_filepath = hf_client.predict(
            float(seed),
            api_name="/generate"
        )

        filename = f"gen_seed_{seed}_{int(time.time())}.png"
        upload_dir = os.path.join(BASE_DIR, "uploads", "generated")
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)

        # Copy hasil download dari gradio_client ke direktori kita
        shutil.copy2(result_filepath, filepath)

        return {
            "status": "success",
            "seed": seed,
            "image_url": f"/uploads/generated/{filename}"
        }
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
        # Generate gambar A
        path_a = hf_client.predict(float(seed_a), api_name="/generate")
        # Generate gambar B
        path_b = hf_client.predict(float(seed_b), api_name="/generate")

        # Blend kedua gambar secara lokal (tanpa AI, sangat ringan)
        img_a = Image.open(path_a).convert("RGB")
        img_b = Image.open(path_b).convert("RGB")
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
    Neural Style Transfer via Local TensorFlow Hub.
    """
    if nst_model is None:
        raise HTTPException(status_code=500, detail="Model NST lokal gagal dimuat.")

    try:
        content_bytes = await content_image.read()
        style_bytes = await style_image.read()

        # Preprocess
        content_tensor = load_and_preprocess_img(content_bytes)
        style_tensor = load_and_preprocess_img(style_bytes, target_dim=256)
        
        # Run Style Transfer
        outputs = nst_model(tf.constant(content_tensor), tf.constant(style_tensor))
        stylized_tensor = outputs[0]
        
        # Blending (style strength)
        if style_strength < 1.0:
            content_resized = tf.image.resize(content_tensor, [stylized_tensor.shape[1], stylized_tensor.shape[2]])
            stylized_tensor = style_strength * stylized_tensor + (1.0 - style_strength) * content_resized
            
        # Convert back to PIL Image
        stylized_tensor = tf.squeeze(stylized_tensor)
        stylized_tensor = tf.clip_by_value(stylized_tensor, 0.0, 1.0)
        img_array = (stylized_tensor.numpy() * 255).astype(np.uint8)
        stylized_pil = Image.fromarray(img_array)

        # Preserve Color jika diminta
        if preserve_color:
            content_pil = Image.open(io.BytesIO(content_bytes)).convert("RGB").resize(stylized_pil.size)
            content_ycbcr = content_pil.convert("YCbCr")
            stylized_ycbcr = stylized_pil.convert("YCbCr")
            s_y, _, _ = stylized_ycbcr.split()
            _, c_cb, c_cr = content_ycbcr.split()
            stylized_pil = Image.merge("YCbCr", (s_y, c_cb, c_cr)).convert("RGB")

        filename = f"nst_{int(time.time())}.png"
        upload_dir = os.path.join(BASE_DIR, "uploads", "generated")
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        
        stylized_pil.save(filepath)

        return {
            "status": "success",
            "image_url": f"/uploads/generated/{filename}"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal melakukan style transfer lokal: {str(e)}")
