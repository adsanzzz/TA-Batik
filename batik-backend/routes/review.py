from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from database import SessionLocal
import models

router = APIRouter(prefix="/reviews", tags=["Review / Feedback"])

# Fitur yang boleh dinilai
ALLOWED_FITUR = {"scan", "vton", "generative", "photobox", "rag"}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ReviewCreate(BaseModel):
    fitur: str = Field(..., description="scan | vton | generative | photobox | rag")
    rating: int = Field(..., ge=1, le=5, description="Bintang 1-5")
    komentar: Optional[str] = None


@router.post("")
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    fitur = payload.fitur.strip().lower()
    if fitur not in ALLOWED_FITUR:
        raise HTTPException(status_code=400, detail=f"Fitur tidak valid. Pilih: {', '.join(sorted(ALLOWED_FITUR))}")

    review = models.Review(
        fitur=fitur,
        rating=payload.rating,
        komentar=(payload.komentar or "").strip() or None,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {"status": "success", "message": "Terima kasih atas ulasanmu!", "id": review.id}


@router.get("")
def list_reviews(fitur: Optional[str] = None, db: Session = Depends(get_db)):
    """Daftar semua review (untuk admin). Bisa difilter per fitur."""
    q = db.query(models.Review)
    if fitur:
        q = q.filter(models.Review.fitur == fitur.strip().lower())
    rows = q.order_by(models.Review.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "fitur": r.fitur,
            "rating": r.rating,
            "komentar": r.komentar,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/summary")
def review_summary(db: Session = Depends(get_db)):
    """Rekap: rata-rata rating & jumlah review per fitur (untuk admin)."""
    rows = (
        db.query(
            models.Review.fitur,
            func.avg(models.Review.rating).label("avg_rating"),
            func.count(models.Review.id).label("total"),
        )
        .group_by(models.Review.fitur)
        .all()
    )
    per_fitur = {
        fitur: {"avg_rating": round(float(avg or 0), 2), "total": int(total)}
        for fitur, avg, total in rows
    }
    total_all = db.query(func.count(models.Review.id)).scalar() or 0
    avg_all = db.query(func.avg(models.Review.rating)).scalar()
    return {
        "total_reviews": int(total_all),
        "avg_rating_overall": round(float(avg_all or 0), 2),
        "per_fitur": per_fitur,
    }
