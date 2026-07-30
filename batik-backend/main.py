from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

print("=== TRISARA BACKEND STARTUP ===")
print(f"Python starting up...")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

app = FastAPI()

# CORS (WAJIB untuk React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SERVE IMAGE (Create folder if not exists)
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Seed template pakaian dari assets/ ke uploads/ setiap startup
# Ini diperlukan karena Docker volume menutupi /app/uploads saat runtime
for template_name in ["shirt_template.png", "blouse_template.png"]:
    src = os.path.join(ASSETS_DIR, template_name)
    dst = os.path.join(UPLOAD_DIR, template_name)
    if os.path.exists(src):
        try:
            shutil.copy2(src, dst)
            print(f"[OK] Template '{template_name}' berhasil disalin ke uploads/.")
        except Exception as err:
            print(f"[WARN] Gagal menyalin '{template_name}': {err}")
    else:
        print(f"[WARN] Template '{template_name}' tidak ditemukan di assets/.")

from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# DATABASE SETUP - wrapped so crash doesn't kill app
try:
    from database import engine
    import models
    models.Base.metadata.create_all(bind=engine)
    print("[OK] Database connected and tables created.")
except Exception as e:
    print(f"[ERROR] Database setup failed: {e}")

# ROUTES - each wrapped individually so one failure doesn't kill all
try:
    from routes import batik, auth
    app.include_router(auth.router, tags=["Authentication"])
    app.include_router(batik.router, tags=["Batik Management"])
    print("[OK] Auth & Batik routes loaded.")
except Exception as e:
    print(f"[ERROR] Auth/Batik routes failed: {e}")

try:
    from routes import predict
    app.include_router(predict.router, tags=["AI Prediction"])
    print("[OK] Predict route loaded.")
except Exception as e:
    print(f"[ERROR] Predict route failed: {e}")

try:
    from routes import frame, batik_ai, admin_mitra, model_control
    app.include_router(frame.router, tags=["Frame Management"])
    app.include_router(batik_ai.router, tags=["AI Info Management"])
    app.include_router(admin_mitra.router, tags=["Admin Mitra Management"])
    app.include_router(model_control.router, tags=["AI Model Management"])
    print("[OK] Frame/BatikAI/Admin routes loaded.")
except Exception as e:
    print(f"[ERROR] Frame/BatikAI/Admin routes failed: {e}")

try:
    from routes import garment_generator
    app.include_router(garment_generator.router)
    print("[OK] Garment Generator route loaded.")
except Exception as e:
    print(f"[ERROR] Garment Generator route failed: {e}")

try:
    from routes import vton
    app.include_router(vton.router)
    print("[OK] VTON route loaded.")
except Exception as e:
    print(f"[ERROR] VTON route failed: {e}")

try:
    from routes import stylegan_router
    app.include_router(stylegan_router.router)
    print("[OK] StyleGAN route loaded.")
except Exception as e:
    print(f"[ERROR] StyleGAN route failed: {e}")

try:
    from routes import rag_router
    app.include_router(rag_router.router)
    print("[OK] RAG Batik Recommendation route loaded.")
except Exception as e:
    print(f"[ERROR] RAG route failed: {e}")

print("=== STARTUP COMPLETE - App is running ===")

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)