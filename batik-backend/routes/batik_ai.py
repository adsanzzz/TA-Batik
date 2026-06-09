from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from routes.auth import get_current_admin
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BatikAIInfoCreate(BaseModel):
    nama: str
    deskripsi: str

@router.get("/admin/batik-ai-info")
def get_all_info(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    return db.query(models.BatikAIInfo).all()

@router.post("/admin/batik-ai-info")
def create_info(info: BatikAIInfoCreate, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    db_info = db.query(models.BatikAIInfo).filter(models.BatikAIInfo.nama == info.nama).first()
    if db_info:
        db_info.deskripsi = info.deskripsi
    else:
        db_info = models.BatikAIInfo(nama=info.nama, deskripsi=info.deskripsi)
        db.add(db_info)
    db.commit()
    db.refresh(db_info)
    return db_info

@router.delete("/admin/batik-ai-info/{info_id}")
def delete_info(info_id: int, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    info = db.query(models.BatikAIInfo).filter(models.BatikAIInfo.id == info_id).first()
    if not info:
        raise HTTPException(status_code=404, detail="Info tidak ditemukan")
    db.delete(info)
    db.commit()
    return {"message": "Berhasil dihapus"}
