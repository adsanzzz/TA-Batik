import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from gradio_client import Client, handle_file

from database import SessionLocal
import models

router = APIRouter()

# URL Hugging Face Space API
HF_SPACE_URL = os.getenv("HF_SPACE_URL", "Umanzz/trisara-batik-ai")
hf_client = Client(HF_SPACE_URL)

# Class Names (11 Classes)
CLASS_NAMES = [
    "batik-bali", "batik-betawi", "batik-celup", "batik-cendrawasih", 
    "batik-kawung", "batik-megamendung", "batik-parang", "batik-sekar", 
    "batik-sidoluhur", "batik-sidomukti", "batik-tambal"
]

LABEL_MAPPING = {
    "batik-bali": "Bali",
    "batik-betawi": "Betawi",
    "batik-celup": "Celup",
    "batik-cendrawasih": "Cendrawasih",
    "batik-kawung": "Kawung",
    "batik-megamendung": "Mega Mendung",
    "batik-parang": "Parang",
    "batik-sekar": "Sekar",
    "batik-sidoluhur": "Sidoluhur",
    "batik-sidomukti": "Sidomukti",
    "batik-tambal": "Tambal"
}

# Event recommendations (rule-based)
EVENT_RECOMMENDATIONS = {
    "Pernikahan": ["Batik Sidomukti", "Batik Sidoluhur", "Batik Sekar", "Batik Kawung"],
    "Acara Adat": ["Batik Parang", "Batik Kawung", "Batik Sidoluhur"],
    "Acara Formal": ["Batik Bali", "Batik Mega Mendung", "Batik Kawung", "Batik Parang"],
    "Seminar": ["Batik Bali", "Batik Mega Mendung", "Batik Cendrawasih"],
    "Kantor": ["Batik Bali", "Batik Mega Mendung"],
    "Festival Budaya": ["Batik Betawi", "Batik Cendrawasih"],
    "Acara Keluarga": ["Batik Sekar", "Batik Tambal"],
    "Acara Sosial": ["Batik Tambal"],
    "Acara Santai": ["Batik Celup"],
    "Acara Kreatif": ["Batik Celup"]
}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/predict")
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Simpan file sementara untuk diproses gradio_client
        temp_filepath = f"temp_{file.filename}"
        with open(temp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        try:
            # Panggil Hugging Face API
            result = hf_client.predict(
                handle_file(temp_filepath),
                api_name="/predict"
            )
        finally:
            # Selalu hapus file sementara
            if os.path.exists(temp_filepath):
                os.remove(temp_filepath)

        # Parse hasil
        # result form: {'label': 'batik-kawung', 'confidences': [{'label': 'batik-kawung', 'confidence': 0.99}]}
        label_data = result.get("confidences", [])
        if not label_data:
            raise ValueError("Invalid response from Hugging Face API")
            
        top_result = label_data[0]
        predicted_class_name = top_result["label"]
        confidence = float(top_result["confidence"])

        warning_msg = None
        if confidence < 0.50:
            warning_msg = "Hasil mungkin tidak akurat, harap upload gambar lain yang lebih jelas atau yang terdaftar pada sistem"

        # Konversi ke display name
        display_name = LABEL_MAPPING.get(predicted_class_name, predicted_class_name)

        # Cari info di DB
        ai_info = db.query(models.BatikAIInfo).filter(models.BatikAIInfo.nama == display_name).first()
        ai_description = ai_info.deskripsi if ai_info else "Informasi batik ini belum tersedia di basis data AI."

        batik_list = db.query(models.Batik).filter(models.Batik.nama.ilike(f"%{display_name}%")).all()
        matches = [
            {
                "id": b.id,
                "nama": b.nama,
                "motif_utama": b.motif_utama,
                "jenis_acara": b.jenis_acara,
                "jenis_batik": b.jenis_batik,
                "filosofi": b.filosofi,
                "gambar": b.gambar
            }
            for b in batik_list
        ]

        batik_full_name = f"Batik {display_name}"
        event_suggestions = [event for event, batiks in EVENT_RECOMMENDATIONS.items() if batik_full_name in batiks]

        return {
            "predicted_label": display_name,
            "confidence": confidence,
            "description": ai_description,
            "matches": matches,
            "warning": warning_msg,
            "event_recommendations": EVENT_RECOMMENDATIONS,
            "event_suggestions": event_suggestions
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error prediksi: {str(e)}")
