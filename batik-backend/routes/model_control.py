import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from routes.auth import get_current_admin, get_db
from typing import List

router = APIRouter()

# Define the models directory (where model files are stored)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

@router.get("/admin/models")
def get_models(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """
    Get all uploaded AI models.
    """
    db_models = db.query(models.AIModel).order_by(models.AIModel.uploaded_at.desc()).all()
    
    result = []
    for m in db_models:
        file_exists = os.path.exists(os.path.join(BASE_DIR, m.filepath))
        result.append({
            "id": m.id,
            "name": m.name,
            "filename": m.filename,
            "filepath": m.filepath,
            "is_active": m.is_active,
            "uploaded_at": m.uploaded_at.isoformat(),
            "file_exists": file_exists
        })
    return result

@router.post("/admin/models/upload")
def upload_model(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """
    Upload a new AI model (.keras or .h5).
    """
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".keras", ".h5"]:
        raise HTTPException(
            status_code=400,
            detail="Tipe file tidak didukung. Harap upload file model dengan ekstensi .keras atau .h5."
        )
    
    # Save the file with a unique name to avoid collisions
    unique_filename = f"model_{uuid.uuid4().hex}{ext}"
    filepath_relative = os.path.join("models", unique_filename)
    filepath_absolute = os.path.join(BASE_DIR, filepath_relative)
    
    try:
        with open(filepath_absolute, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menyimpan file model ke server: {str(e)}"
        )
    
    # Save to database
    new_model = models.AIModel(
        name=name,
        filename=filename,
        filepath=filepath_relative,
        is_active=False
    )
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    
    return {
        "message": "Model berhasil diupload!",
        "model": {
            "id": new_model.id,
            "name": new_model.name,
            "filename": new_model.filename,
            "is_active": new_model.is_active
        }
    }

@router.post("/admin/models/{model_id}/activate")
def activate_model(
    model_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """
    Set a model as the active model.
    """
    # Find model in DB
    target_model = db.query(models.AIModel).filter(models.AIModel.id == model_id).first()
    if not target_model:
        raise HTTPException(status_code=404, detail="Model tidak ditemukan.")
    
    # Verify file exists
    filepath_absolute = os.path.join(BASE_DIR, target_model.filepath)
    if not os.path.exists(filepath_absolute):
        raise HTTPException(
            status_code=400,
            detail="File model tidak ditemukan di server. Silakan upload ulang atau hapus entri ini."
        )
    
    # Deactivate all other models
    db.query(models.AIModel).update({models.AIModel.is_active: False})
    
    # Activate target model
    target_model.is_active = True
    db.commit()
    db.refresh(target_model)
    
    return {
        "message": f"Model '{target_model.name}' berhasil diaktifkan!",
        "model_id": target_model.id
    }

@router.post("/admin/models/deactivate-all")
def deactivate_all_models(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """
    Deactivate all custom models, falling back to the default baseline model.
    """
    db.query(models.AIModel).update({models.AIModel.is_active: False})
    db.commit()
    return {"message": "Semua model kustom dinonaktifkan. Sistem kembali menggunakan model bawaan."}

@router.delete("/admin/models/{model_id}")
def delete_model(
    model_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """
    Delete a model (file and DB record).
    """
    target_model = db.query(models.AIModel).filter(models.AIModel.id == model_id).first()
    if not target_model:
        raise HTTPException(status_code=404, detail="Model tidak ditemukan.")
    
    # Cannot delete active model
    if target_model.is_active:
        raise HTTPException(
            status_code=400,
            detail="Model yang sedang aktif tidak dapat dihapus. Aktifkan model lain terlebih dahulu."
        )
    
    # Delete the physical file
    filepath_absolute = os.path.join(BASE_DIR, target_model.filepath)
    if os.path.exists(filepath_absolute):
        try:
            os.remove(filepath_absolute)
        except Exception as e:
            print(f"Warning: Failed to delete model file {filepath_absolute}: {e}")
            # We will still proceed to delete the record in case the file is already gone
            
    # Delete database record
    db.delete(target_model)
    db.commit()
    
    return {"message": "Model berhasil dihapus!"}
