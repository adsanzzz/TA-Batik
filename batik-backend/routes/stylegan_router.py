import os
import sys
import time
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from PIL import Image
import torch
import tensorflow as tf
import tensorflow_hub as hub

# Ensure stylegan_lib is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STYLEGAN_LIB = os.path.join(BASE_DIR, "stylegan_lib")
if STYLEGAN_LIB not in sys.path:
    sys.path.insert(0, STYLEGAN_LIB)

import legacy
import dnnlib

router = APIRouter(prefix="/stylegan", tags=["StyleGAN2 Generator & Mixer"])

# Global variables for caching model
_G = None
_model_path = os.path.join(BASE_DIR, "models", "stylegan2_batik.pkl")

def get_generator():
    global _G
    if _G is not None:
        return _G
        
    if not os.path.exists(_model_path):
        raise HTTPException(
            status_code=500,
            detail=f"Model StyleGAN2 tidak ditemukan di {_model_path}. Harap pastikan model sudah dipindahkan."
        )
        
    try:
        print(f"Loading StyleGAN2 model from {_model_path} into CPU memory...", flush=True)
        # Optimize CPU threads for PyTorch to prevent CPU hangs/contention
        torch.set_num_threads(4)
        
        with dnnlib.util.open_url(_model_path) as f:
            network = legacy.load_network_pkl(f)
            _G = network['G_ema']
            _G = _G.eval().to(torch.device('cpu'))
            print("StyleGAN2 model loaded successfully!", flush=True)
            return _G
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal memuat model StyleGAN2: {str(e)}")

def save_tensor_to_image(img_tensor, filename: str) -> str:
    """Converts a StyleGAN2 output tensor [-1, 1] to a saved image file and returns the relative path."""
    upload_dir = os.path.join(BASE_DIR, "uploads", "generated")
    os.makedirs(upload_dir, exist_ok=True)
    
    filepath = os.path.join(upload_dir, filename)
    
    # Post-process image: [-1, 1] -> [0, 255]
    img = (img_tensor * 127.5 + 128).clamp(0, 255).to(torch.uint8)
    img = img[0].permute(1, 2, 0).cpu().numpy()
    
    pil_img = Image.fromarray(img)
    pil_img.save(filepath)
    
    return f"uploads/generated/{filename}"

@router.get("/generate")
def generate_from_seed(seed: int = Query(..., description="Random seed (angka integer)")):
    """
    Generate gambar batik baru menggunakan single seed.
    """
    G = get_generator()
    device = torch.device('cpu')
    
    try:
        # Generate random vector z based on seed
        z = torch.from_numpy(legacy.np.random.RandomState(seed).randn(1, G.z_dim).astype(legacy.np.float32)).to(device)
        
        # Inference
        with torch.no_grad():
            img_tensor = G(z, None, force_fp32=True, fused_modconv=False)
            
        filename = f"gen_seed_{seed}_{int(time.time())}.png"
        relative_path = save_tensor_to_image(img_tensor, filename)
        
        return {
            "status": "success",
            "seed": seed,
            "image_url": f"http://127.0.0.1:8000/{relative_path}"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal men-generate gambar batik: {str(e)}")

@router.get("/mix")
def mix_seeds(
    seed_a: int = Query(..., description="Seed untuk Batik A"),
    seed_b: int = Query(..., description="Seed untuk Batik B"),
    weight: float = Query(0.5, ge=0.0, le=1.0, description="Bobot percampuran (0.0 = murni A, 1.0 = murni B)")
):
    """
    Menggabungkan (blending) dua batik berdasarkan seed_a dan seed_b dengan bobot (weight) tertentu.
    """
    G = get_generator()
    device = torch.device('cpu')
    
    try:
        # Generate latent vectors z_a and z_b
        z_a = torch.from_numpy(legacy.np.random.RandomState(seed_a).randn(1, G.z_dim).astype(legacy.np.float32)).to(device)
        z_b = torch.from_numpy(legacy.np.random.RandomState(seed_b).randn(1, G.z_dim).astype(legacy.np.float32)).to(device)
        
        with torch.no_grad():
            # 1. Map to W-space
            w_a = G.mapping(z_a, None)
            w_b = G.mapping(z_b, None)
            
            # 2. Linear interpolation in W-space
            w_mixed = (1.0 - weight) * w_a + weight * w_b
            
            # 3. Synthesize image from mixed W
            img_tensor = G.synthesis(w_mixed, force_fp32=True, fused_modconv=False)
            
        filename = f"mix_{seed_a}_{seed_b}_w{int(weight*100)}_{int(time.time())}.png"
        relative_path = save_tensor_to_image(img_tensor, filename)
        
        return {
            "status": "success",
            "seed_a": seed_a,
            "seed_b": seed_b,
            "weight": weight,
            "image_url": f"http://127.0.0.1:8000/{relative_path}"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal melakukan blending batik: {str(e)}")

# --- NEURAL STYLE TRANSFER (NST) FOR UPLOADED IMAGES ---
_nst_model = None

def get_nst_model():
    global _nst_model
    if _nst_model is None:
        try:
            print("Loading pre-trained Magenta Arbitrary Style Transfer model locally...", flush=True)
            # Disable GPU for NST to prevent conflicts
            tf.config.set_visible_devices([], 'GPU')
            model_path = os.path.join(BASE_DIR, "models", "magenta_nst")
            _nst_model = hub.load(model_path)
            print("Magenta NST model loaded successfully from local storage!", flush=True)
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Gagal memuat model NST Magenta secara lokal: {str(e)}")
    return _nst_model

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
    try:
        content_bytes = await content_image.read()
        style_bytes = await style_image.read()
        
        # Preprocess images
        # Content image resized to 512x512, Style image resized to 256x256 (optimized for Magenta)
        content_tensor = load_and_preprocess_img(content_bytes, target_dim=512)
        style_tensor = load_and_preprocess_img(style_bytes, target_dim=256)
        
        # Load model and run inference
        nst_model = get_nst_model()
        outputs = nst_model(tf.constant(content_tensor), tf.constant(style_tensor))
        stylized_img = outputs[0]
        
        # Convert content bytes to PIL for blending and resizing
        import io
        content_pil = Image.open(io.BytesIO(content_bytes)).convert("RGB").resize((512, 512))
        
        # Convert stylized tensor [1, H, W, 3] back to PIL Image
        img_np = (stylized_img[0].numpy() * 255.0).clip(0, 255).astype(legacy.np.uint8)
        stylized_pil = Image.fromarray(img_np)
        
        # Apply Color Preservation if requested (YCbCr Channel Merge)
        if preserve_color:
            content_ycbcr = content_pil.convert("YCbCr")
            stylized_ycbcr = stylized_pil.convert("YCbCr")
            
            c_y, c_cb, c_cr = content_ycbcr.split()
            s_y, s_cb, s_cr = stylized_ycbcr.split()
            
            # Combine stylized luminance with original chrominance
            stylized_pil = Image.merge("YCbCr", (s_y, c_cb, c_cr)).convert("RGB")
        
        # Apply Style Strength (Linear interpolation between original content and stylized image)
        if style_strength < 1.0:
            final_pil = Image.blend(content_pil, stylized_pil, style_strength)
        else:
            final_pil = stylized_pil
        
        # Save output image
        filename = f"nst_{int(time.time())}.png"
        upload_dir = os.path.join(BASE_DIR, "uploads", "generated")
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        final_pil.save(filepath)
        
        return {
            "status": "success",
            "image_url": f"http://127.0.0.1:8000/uploads/generated/{filename}"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gagal melakukan style transfer: {str(e)}")
