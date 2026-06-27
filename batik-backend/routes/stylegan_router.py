import os
import shutil
import io
import time
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from PIL import Image
from gradio_client import Client
import numpy as np
import base64

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import tensorflow as tf
import tensorflow_hub as hub

router = APIRouter(prefix="/stylegan", tags=["StyleGAN2 Generator & Mixer"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# URL Hugging Face Space API
HF_SPACE_URL = os.getenv("HF_SPACE_URL", "Umanzz/trisara-batik-ai")
hf_client = None

def get_hf_client():
    global hf_client
    if hf_client is None:
        print(f"Connecting to HuggingFace Space: {HF_SPACE_URL}")
        try:
            hf_client = Client(HF_SPACE_URL)
        except Exception as e:
            print(f"Failed to connect to HF Space: {e}")
    return hf_client

nst_model = None

def get_nst_model():
    global nst_model
    if nst_model is None:
        print("Loading Magenta NST model from local directory...")
        try:
            nst_path = os.path.join(BASE_DIR, "models", "magenta_nst")
            nst_model = hub.load(nst_path)
        except Exception as e:
            print(f"Failed to load NST model: {e}")
    return nst_model

def load_and_preprocess_img(image_bytes, target_dim=None):
    img = tf.image.decode_image(image_bytes, channels=3)
    img = tf.image.convert_image_dtype(img, tf.float32)
    if target_dim:
        img = tf.image.resize(img, [target_dim, target_dim])
    img = img[tf.newaxis, :]
    return img

@router.post("/nst-blend")
async def nst_blend(
    content_image: UploadFile = File(...),
    style_image: UploadFile = File(...),
    style_strength: float = Form(1.0, ge=0.0, le=1.0, description="Kekuatan penerapan gaya (0.0 - 1.0)"),
    preserve_color: bool = Form(False, description="Apakah warna asli batik konten dipertahankan")
):
    """
    Padukan gaya (warna/tekstur) dari style_image ke struktur content_image menggunakan Neural Style Transfer.
    """
    model = get_nst_model()
    if model is None:
        raise HTTPException(status_code=500, detail="Model NST lokal gagal dimuat.")

    try:
        content_bytes = await content_image.read()
        style_bytes = await style_image.read()
        
        # Preprocess - IDENTIK dengan versi original sebelum HF migration
        # Content image resized ke 512x512, Style image ke 256x256 (optimized for Magenta)
        content_tensor = load_and_preprocess_img(content_bytes, target_dim=512)
        style_tensor = load_and_preprocess_img(style_bytes, target_dim=256)
        
        # Run NST inference
        outputs = model(tf.constant(content_tensor), tf.constant(style_tensor))
        stylized_img = outputs[0]
        
        # Convert content bytes ke PIL untuk blending dan resizing
        content_pil = Image.open(io.BytesIO(content_bytes)).convert("RGB").resize((512, 512))
        
        # Convert stylized tensor [1, H, W, 3] balik ke PIL Image
        img_np = (stylized_img[0].numpy() * 255.0).clip(0, 255).astype(np.uint8)
        stylized_pil = Image.fromarray(img_np)
        
        # Apply Color Preservation jika diminta (YCbCr Channel Merge)
        if preserve_color:
            content_ycbcr = content_pil.convert("YCbCr")
            stylized_ycbcr = stylized_pil.convert("YCbCr")
            c_y, c_cb, c_cr = content_ycbcr.split()
            s_y, s_cb, s_cr = stylized_ycbcr.split()
            # Gabungkan luminance stylized dengan chrominance asli
            stylized_pil = Image.merge("YCbCr", (s_y, c_cb, c_cr)).convert("RGB")
        
        # Apply Style Strength (Linear interpolation antara konten asli dan hasil stylized)
        if style_strength < 1.0:
            final_pil = Image.blend(content_pil, stylized_pil, style_strength)
        else:
            final_pil = stylized_pil
        
        # Save ke base64 langsung
        buffered = io.BytesIO()
        final_pil.save(buffered, format="PNG")
        b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {
            "status": "success",
            "image_b64": f"data:image/png;base64,{b64_str}"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal melakukan style transfer: {str(e)}")

@router.get("/generate")
async def generate_from_seed(seed: int = Query(..., description="Random seed (angka integer)")):
    """
    Generate gambar batik baru menggunakan single seed via Hugging Face API.
    """
    try:
        # Panggil Hugging Face API (Gradio)
        result_filepath = get_hf_client().predict(
            float(seed),
            api_name="/generate"
        )

        # Baca file asli untuk di-encode ke base64 (dari hugging face gradio client yg nyimpen ke temp)
        with open(result_filepath, "rb") as f:
            b64_str = base64.b64encode(f.read()).decode("utf-8")
        
        # Hapus file sementara dari gradio_client
        try:
            os.remove(result_filepath)
        except:
            pass

        return {
            "status": "success",
            "seed": seed,
            "image_b64": f"data:image/png;base64,{b64_str}"
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
        path_a = get_hf_client().predict(float(seed_a), api_name="/generate")
        # Generate gambar B
        path_b = get_hf_client().predict(float(seed_b), api_name="/generate")

        # Blend kedua gambar secara lokal (tanpa AI, sangat ringan)
        img_a = Image.open(path_a).convert("RGB")
        img_b = Image.open(path_b).convert("RGB")
        img_b = img_b.resize(img_a.size)
        blended = Image.blend(img_a, img_b, weight)

        # Convert ke base64 tanpa nyimpen
        buffered = io.BytesIO()
        blended.save(buffered, format="PNG")
        b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # Bersihkan temp file
        try:
            os.remove(path_a)
            os.remove(path_b)
        except:
            pass

        return {
            "status": "success",
            "seed_a": seed_a,
            "seed_b": seed_b,
            "weight": weight,
            "image_b64": f"data:image/png;base64,{b64_str}"
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
    model = get_nst_model()
    if model is None:
        raise HTTPException(status_code=500, detail="Model NST lokal gagal dimuat.")

    try:
        content_bytes = await content_image.read()
        style_bytes = await style_image.read()

        # Open as PIL (sama persis dengan app.py)
        content_pil = Image.open(io.BytesIO(content_bytes)).convert("RGB")
        style_pil = Image.open(io.BytesIO(style_bytes)).convert("RGB")
        original_size = content_pil.size  # Simpan ukuran asli

        # Resize content ke 384px (sweet spot untuk model Magenta)
        target_dim = 384
        w, h = content_pil.size
        scale = min(target_dim / w, target_dim / h)
        content_pil_resized = content_pil.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

        # Preprocess (identik dengan app.py)
        content_tensor = load_and_preprocess_img(content_pil_resized)
        style_tensor = load_and_preprocess_img(style_pil, target_dim=256)
        
        # Run Style Transfer
        outputs = model(tf.constant(content_tensor), tf.constant(style_tensor))
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

        # Upscale kembali ke resolusi asli konten agar tidak terlihat kecil/buram
        stylized_pil = stylized_pil.resize(original_size, Image.LANCZOS)

        # Sharpening - membuat detail lebih tajam (mirip hasil HF)
        from PIL import ImageFilter, ImageEnhance
        stylized_pil = stylized_pil.filter(ImageFilter.UnsharpMask(radius=1.5, percent=120, threshold=3))

        # Preserve Color jika diminta
        if preserve_color:
            content_for_color = content_pil.resize(stylized_pil.size)
            content_ycbcr = content_for_color.convert("YCbCr")
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
