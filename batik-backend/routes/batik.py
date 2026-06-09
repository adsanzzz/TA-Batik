from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import shutil
import os
import uuid
from routes.auth import get_current_admin, get_current_mitra
from typing import List, Optional
from schemas import BatikResponse
router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper function for DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CREATE (Admin Only)
@router.post("/admin/batik")
def create_batik(
    nama: str = Form(...),
    motif_utama: str = Form(...),
    jenis_acara: str = Form(...),
    jenis_batik: str = Form(...),
    filosofi: str = Form(...),
    file: UploadFile = File(...),
    shopee_link: Optional[str] = Form(None),
    tokopedia_link: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin) # Proteksi Admin
):
    try:
        ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Store relative path for web access
        web_path = f"uploads/{unique_filename}"
        
        batik = models.Batik(
            nama=nama,
            motif_utama=motif_utama,
            jenis_acara=jenis_acara,
            jenis_batik=jenis_batik,
            filosofi=filosofi,
            gambar=web_path,
            shopee_link=shopee_link,
            tokopedia_link=tokopedia_link
        )

        db.add(batik)
        db.commit()
        db.refresh(batik)

        return {
            "message": "Batik berhasil ditambahkan oleh Admin",
            "id": batik.id,
            "nama": batik.nama,
            "gambar": batik.gambar,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# CREATE (Mitra Only)
@router.post("/mitra/batik")
def create_batik_mitra(
    nama: str = Form(...),
    motif_utama: str = Form(...),
    jenis_acara: str = Form(...),
    jenis_batik: str = Form(...),
    filosofi: str = Form(...),
    file: UploadFile = File(...),
    shopee_link: Optional[str] = Form(None),
    tokopedia_link: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    mitra: models.User = Depends(get_current_mitra) # Proteksi Mitra
):
    try:
        ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Store relative path for web access
        web_path = f"uploads/{unique_filename}"
        
        batik = models.Batik(
            nama=nama,
            motif_utama=motif_utama,
            jenis_acara=jenis_acara,
            jenis_batik=jenis_batik,
            filosofi=filosofi,
            gambar=web_path,
            shopee_link=shopee_link,
            tokopedia_link=tokopedia_link,
            mitra_id=mitra.id
        )

        db.add(batik)
        db.commit()
        db.refresh(batik)

        return {
            "message": "Batik berhasil diunggah oleh Mitra",
            "id": batik.id,
            "nama": batik.nama,
            "gambar": batik.gambar,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# READ (Katalog - Public)

@router.get("/batik", response_model=List[BatikResponse])
def get_batik(db: Session = Depends(get_db)):
    data = db.query(models.Batik).all()
    # Attach store name from uploader if available
    result = []
    for b in data:
        result.append({
            "id": b.id,
            "nama": b.nama,
            "motif_utama": b.motif_utama,
            "jenis_acara": b.jenis_acara,
            "jenis_batik": b.jenis_batik,
            "filosofi": b.filosofi,
            "gambar": b.gambar,
            "shopee_link": b.shopee_link,
            "tokopedia_link": b.tokopedia_link,
            "mitra_id": b.mitra_id,
            "nama_toko": b.uploader.nama_toko if b.uploader else None,
        })
    return result


# READ (Mitra - Only their own uploaded batik)

@router.get("/mitra/my-batik", response_model=List[BatikResponse])
def get_mitra_batik(
    db: Session = Depends(get_db),
    mitra: models.User = Depends(get_current_mitra)
):
    data = db.query(models.Batik).filter(models.Batik.mitra_id == mitra.id).all()
    result = []
    for b in data:
        result.append({
            "id": b.id,
            "nama": b.nama,
            "motif_utama": b.motif_utama,
            "jenis_acara": b.jenis_acara,
            "jenis_batik": b.jenis_batik,
            "filosofi": b.filosofi,
            "gambar": b.gambar,
            "shopee_link": b.shopee_link,
            "tokopedia_link": b.tokopedia_link,
            "mitra_id": b.mitra_id,
            "nama_toko": b.uploader.nama_toko if b.uploader else None,
        })
    return result


# READ by ID (Public)
@router.get("/batik/{batik_id}")
def get_batik_by_id(batik_id: int, db: Session = Depends(get_db)):
    batik = db.query(models.Batik).filter(models.Batik.id == batik_id).first()
    if batik is None:
        raise HTTPException(status_code=404, detail="Batik tidak ditemukan")
    return batik


# DELETE (Admin Only)
@router.delete("/admin/batik/{batik_id}")
def delete_batik(
    batik_id: int, 
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin) # Proteksi Admin
):
    try:
        batik = db.query(models.Batik).filter(models.Batik.id == batik_id).first()
        if batik is None:
            raise HTTPException(status_code=404, detail="Batik tidak ditemukan")

        if batik.gambar and os.path.exists(batik.gambar):
            try:
                os.remove(batik.gambar)
            except:
                pass

        db.delete(batik)
        db.commit()
        return {"message": "Batik berhasil dihapus oleh Admin"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# DELETE (Mitra Only)
@router.delete("/mitra/batik/{batik_id}")
def delete_batik_mitra(
    batik_id: int,
    db: Session = Depends(get_db),
    mitra: models.User = Depends(get_current_mitra)
):
    try:
        batik = db.query(models.Batik).filter(
            models.Batik.id == batik_id,
            models.Batik.mitra_id == mitra.id
        ).first()
        if batik is None:
            raise HTTPException(status_code=404, detail="Batik tidak ditemukan atau bukan milik Anda")

        if batik.gambar and os.path.exists(batik.gambar):
            try:
                os.remove(batik.gambar)
            except:
                pass

        db.delete(batik)
        db.commit()
        return {"message": "Batik berhasil dihapus oleh Mitra"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# UPDATE (Admin Only)
@router.put("/admin/batik/{batik_id}")
def update_batik(
    batik_id: int,
    nama: str = Form(...),
    motif_utama: str = Form(...),
    jenis_acara: str = Form(...),
    jenis_batik: str = Form(...),
    filosofi: str = Form(...),
    file: Optional[UploadFile] = File(None),
    shopee_link: Optional[str] = Form(None),
    tokopedia_link: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    try:
        batik = db.query(models.Batik).filter(models.Batik.id == batik_id).first()
        if batik is None:
            raise HTTPException(status_code=404, detail="Batik tidak ditemukan")
        
        batik.nama = nama
        batik.motif_utama = motif_utama
        batik.jenis_acara = jenis_acara
        batik.jenis_batik = jenis_batik
        batik.filosofi = filosofi
        batik.shopee_link = shopee_link
        batik.tokopedia_link = tokopedia_link
        
        if file:
            # Hapus gambar lama jika ada
            if batik.gambar and os.path.exists(batik.gambar):
                try:
                    os.remove(batik.gambar)
                except:
                    pass
                
            # Simpan gambar baru
            ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            batik.gambar = f"uploads/{unique_filename}"
            
        db.commit()
        db.refresh(batik)
        
        return {
            "message": "Batik berhasil diupdate oleh Admin",
            "id": batik.id,
            "nama": batik.nama,
            "gambar": batik.gambar
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# UPDATE (Mitra Only)
@router.put("/mitra/batik/{batik_id}")
def update_batik_mitra(
    batik_id: int,
    nama: str = Form(...),
    motif_utama: str = Form(...),
    jenis_acara: str = Form(...),
    jenis_batik: str = Form(...),
    filosofi: str = Form(...),
    file: Optional[UploadFile] = File(None),
    shopee_link: Optional[str] = Form(None),
    tokopedia_link: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    mitra: models.User = Depends(get_current_mitra)
):
    try:
        batik = db.query(models.Batik).filter(
            models.Batik.id == batik_id,
            models.Batik.mitra_id == mitra.id
        ).first()
        if batik is None:
            raise HTTPException(status_code=404, detail="Batik tidak ditemukan atau bukan milik Anda")
        
        batik.nama = nama
        batik.motif_utama = motif_utama
        batik.jenis_acara = jenis_acara
        batik.jenis_batik = jenis_batik
        batik.filosofi = filosofi
        batik.shopee_link = shopee_link
        batik.tokopedia_link = tokopedia_link
        
        if file:
            # Hapus gambar lama jika ada
            if batik.gambar and os.path.exists(batik.gambar):
                try:
                    os.remove(batik.gambar)
                except:
                    pass
                
            # Simpan gambar baru
            ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            batik.gambar = f"uploads/{unique_filename}"
            
        db.commit()
        db.refresh(batik)
        
        return {
            "message": "Batik berhasil diupdate oleh Mitra",
            "id": batik.id,
            "nama": batik.nama,
            "gambar": batik.gambar
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))