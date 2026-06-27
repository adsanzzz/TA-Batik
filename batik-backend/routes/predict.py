import os
import shutil
import io
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from PIL import Image

from database import SessionLocal
import models

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input
import numpy as np

# ==========================================
# UNIVERSAL KERAS 3 WORKAROUND
# ==========================================
from keras.src.saving import serialization_lib
from keras.src.layers import BatchNormalization
import keras.src.layers.core.input_layer as _il_module

_STRIP_ARGS = {
    "BatchNormalization": ['renorm', 'quantization_config'],
    "Dense": ['optional'],
    "InputLayer": ['optional'],
    "GlobalAveragePooling2D": ['optional']
}

_original_from_config = serialization_lib.deserialize_keras_object

def patched_deserialize_keras_object(config, *args, **kwargs):
    class_name = config.get("class_name")
    if class_name in _STRIP_ARGS and "config" in config:
        for arg_to_remove in _STRIP_ARGS[class_name]:
            config["config"].pop(arg_to_remove, None)
    return _original_from_config(config, *args, **kwargs)

serialization_lib.deserialize_keras_object = patched_deserialize_keras_object

def _make_patched_from_config(orig_from_config, keys_to_remove):
    def _patched(cls, config, *args, **kwargs):
        for k in keys_to_remove:
            config.pop(k, None)
        return orig_from_config(config, *args, **kwargs)
    return classmethod(_patched)

BatchNormalization.from_config = _make_patched_from_config(
    BatchNormalization.from_config.__func__, 
    _STRIP_ARGS["BatchNormalization"]
)
_il_module.InputLayer.from_config = _make_patched_from_config(
    _il_module.InputLayer.from_config,
    _STRIP_ARGS["InputLayer"]
)

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "model_94ebc873b24c497cba3157eb944d2db7.keras")
print("Loading Keras Classification model locally...")
try:
    classifier_model = tf.keras.models.load_model(MODEL_PATH)
except Exception as e:
    print(f"Failed to load model: {e}")
    classifier_model = None

router = APIRouter()

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
    if classifier_model is None:
        raise HTTPException(status_code=500, detail="Model klasifikasi tidak diload dengan benar.")
        
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        
        predictions = classifier_model.predict(img_array)[0]
        max_index = np.argmax(predictions)
        predicted_class_name = CLASS_NAMES[max_index]
        confidence = float(predictions[max_index])

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
