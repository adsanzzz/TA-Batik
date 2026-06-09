from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import shutil
import os
import uuid
from routes.auth import get_current_admin
from PIL import Image
import io

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CREATE (Admin Only)
@router.post("/admin/frames")
async def create_frame(
    nama: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    try:
        ext = ".png" # always save as PNG
        unique_filename = f"frame_{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        from PIL import ImageDraw
        
        # Read the uploaded motif
        contents = await file.read()
        motif_img = Image.open(io.BytesIO(contents)).convert("RGBA")
        
        # Define frame specs
        frame_w, frame_h = 1280, 720
        border_size = 120
        
        # Resize motif (keep aspect ratio)
        motif_img.thumbnail((200, 200))
        mw, mh = motif_img.size
        
        # 1. Create full pattern layer
        pattern_layer = Image.new("RGBA", (frame_w, frame_h))
        for x in range(0, frame_w, mw):
            for y in range(0, frame_h, mh):
                pattern_layer.paste(motif_img, (x, y))
                
        frame_img = pattern_layer
        
        # Save the generated frame
        frame_img.save(file_path, "PNG")
            
        web_path = f"uploads/{unique_filename}"
        
        frame = models.Frame(nama=nama, gambar=web_path)

        db.add(frame)
        db.commit()
        db.refresh(frame)

        return {"message": "Frame berhasil ditambahkan", "id": frame.id, "nama": frame.nama, "gambar": frame.gambar}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# READ ALL (Public)
@router.get("/frames")
def get_frames(db: Session = Depends(get_db)):
    data = db.query(models.Frame).all()
    return data

# DELETE (Admin Only)
@router.delete("/admin/frames/{frame_id}")
def delete_frame(
    frame_id: int, 
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    try:
        frame = db.query(models.Frame).filter(models.Frame.id == frame_id).first()
        if frame is None:
            raise HTTPException(status_code=404, detail="Frame tidak ditemukan")

        if frame.gambar and os.path.exists(frame.gambar):
            os.remove(frame.gambar)

        db.delete(frame)
        db.commit()
        return {"message": "Frame berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
