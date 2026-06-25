from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import engine
import models
from routes import batik, auth, predict, frame, batik_ai, admin_mitra, model_control, garment_generator, vton, stylegan_router
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

app = FastAPI()

# CREATE TABLES
models.Base.metadata.create_all(bind=engine)

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

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ROUTER
app.include_router(auth.router, tags=["Authentication"])
app.include_router(batik.router, tags=["Batik Management"])
app.include_router(predict.router, tags=["AI Prediction"])
app.include_router(frame.router, tags=["Frame Management"])
app.include_router(batik_ai.router, tags=["AI Info Management"])
app.include_router(admin_mitra.router, tags=["Admin Mitra Management"])
app.include_router(model_control.router, tags=["AI Model Management"])
app.include_router(garment_generator.router)
app.include_router(vton.router)
app.include_router(stylegan_router.router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)