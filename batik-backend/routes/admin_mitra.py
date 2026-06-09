from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from routes.auth import get_current_admin, get_db
from typing import List

router = APIRouter()

# Get all mitra with pending status
@router.get("/admin/mitra/pending", response_model=List[schemas.UserResponse])
def get_pending_mitra(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    mitras = db.query(models.User).filter(
        models.User.role == "mitra",
        models.User.status == "pending"
    ).all()
    return mitras

# Update mitra status (approve or reject)
@router.post("/admin/mitra/{mitra_id}/status")
def update_mitra_status(
    mitra_id: int,
    status_action: str, # "approve" or "reject"
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    mitra = db.query(models.User).filter(
        models.User.id == mitra_id,
        models.User.role == "mitra"
    ).first()
    
    if not mitra:
        raise HTTPException(status_code=404, detail="Mitra tidak ditemukan")
    
    if status_action == "approve":
        mitra.status = "approved"
    elif status_action == "reject":
        mitra.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Aksi tidak valid. Gunakan 'approve' atau 'reject'.")
        
    db.commit()
    db.refresh(mitra)
    return {"message": f"Status Mitra berhasil diubah menjadi {mitra.status}", "status": mitra.status}
