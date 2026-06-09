import os
import numpy as np
import tensorflow as tf
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from PIL import Image
import io

from database import SessionLocal
import models
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class ModelManager:
    def __init__(self):
        self.cached_model = None
        self.cached_model_id = None
        self.default_model_path = os.path.join(BASE_DIR, "models", "model_batik_final_mbv3.keras")
        # Load default model initially to warm up
        self._load_default()

    def _load_default(self):
        if os.path.exists(self.default_model_path):
            try:
                print(f"Loading default model from {self.default_model_path}...")
                self.cached_model = tf.keras.models.load_model(self.default_model_path)
                self.cached_model_id = "default"
                print("Default model loaded successfully.")
            except Exception as e:
                print(f"ERROR: Failed to load default model: {e}")
                self.cached_model = None
                self.cached_model_id = None
        else:
            print(f"WARNING: Default model file not found at {self.default_model_path}")
            self.cached_model = None
            self.cached_model_id = None

    def get_model(self, db: Session):
        try:
            # Query the database for the active model
            active_model = db.query(models.AIModel).filter(models.AIModel.is_active == True).first()
            
            if active_model:
                # If the active model is already cached, return it
                if self.cached_model_id == active_model.id and self.cached_model is not None:
                    return self.cached_model
                
                # Check if file exists
                filepath_abs = os.path.join(BASE_DIR, active_model.filepath)
                if os.path.exists(filepath_abs):
                    try:
                        print(f"Loading active model: {active_model.name} ({filepath_abs})...")
                        loaded_model = tf.keras.models.load_model(filepath_abs)
                        self.cached_model = loaded_model
                        self.cached_model_id = active_model.id
                        print(f"Model {active_model.name} loaded successfully.")
                        return self.cached_model
                    except Exception as e:
                        print(f"ERROR: Failed to load active model {active_model.name}: {e}. Falling back to default.")
                else:
                    print(f"WARNING: Active model file not found at {filepath_abs}. Falling back to default.")
            
            # If no active model is set or failed to load, fall back to default
            if self.cached_model_id == "default" and self.cached_model is not None:
                return self.cached_model
            
            self._load_default()
            return self.cached_model
        except Exception as e:
            print(f"ERROR in ModelManager.get_model: {e}")
            if self.cached_model is not None:
                return self.cached_model
            self._load_default()
            return self.cached_model

model_manager = ModelManager()


# Class Names (11 Classes based on new training)
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

# Helper function for DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def preprocess_image(image_bytes: bytes):
    # Load image
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # Resize to match model input
    img = img.resize((224, 224))
    # Convert to array and make it float32
    img_array = np.array(img, dtype=np.float32)
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    # Apply MobileNetV3 preprocessing
    img_array = preprocess_input(img_array)
    return img_array

@router.post("/predict")
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    model = model_manager.get_model(db)
    if model is None:
        raise HTTPException(status_code=500, detail="Model AI tidak terload.")

    try:
        # Read file
        contents = await file.read()
        
        # Preprocess
        processed_img = preprocess_image(contents)
        
        # Predict
        predictions = model.predict(processed_img)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        
        warning_msg = None
        if confidence < 0.50:
            warning_msg = "Hasil mungkin tidak akurat, harap upload gambar lain yang lebih jelas atau yang terdaftar pada sistem"
        
        predicted_class_name = CLASS_NAMES[predicted_class_idx]
        
        # Conversion to display name using LABEL_MAPPING
        display_name = LABEL_MAPPING.get(predicted_class_name, predicted_class_name)
        
        # Search in DB for AI specific info
        ai_info = db.query(models.BatikAIInfo).filter(models.BatikAIInfo.nama == display_name).first()
        ai_description = ai_info.deskripsi if ai_info else "Informasi batik ini belum tersedia di basis data AI."

        # Search in DB for catalog matches
        batik_list = db.query(models.Batik).filter(models.Batik.nama.ilike(f"%{display_name}%")).all()
        
        matches = []
        for b in batik_list:
            matches.append({
                "id": b.id,
                "nama": b.nama,
                "motif_utama": b.motif_utama,
                "jenis_acara": b.jenis_acara,
                "jenis_batik": b.jenis_batik,
                "filosofi": b.filosofi,
                "gambar": b.gambar
            })
            
        # Determine which events are suitable for the predicted batik
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
