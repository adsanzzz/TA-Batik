from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user") # "admin", "user", "mitra"
    status = Column(String, default="approved") # "approved", "pending", "rejected"
    nik = Column(String, nullable=True)
    nama = Column(String, nullable=True)
    nama_toko = Column(Text, nullable=True)
    bukti_kepemilikan = Column(String, nullable=True)
    ktp = Column(String, nullable=True)

    batiks = relationship("Batik", back_populates="uploader")

class Batik(Base):
    __tablename__ = "batik"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String)
    motif_utama = Column(String)
    jenis_acara = Column(String)
    jenis_batik = Column(String)
    filosofi = Column(Text)
    gambar = Column(String)
    shopee_link = Column(String, nullable=True)
    tokopedia_link = Column(String, nullable=True)
    mitra_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    uploader = relationship("User", back_populates="batiks")

class Frame(Base):
    __tablename__ = "frames"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String)
    gambar = Column(String)

class BatikAIInfo(Base):
    __tablename__ = "batik_ai_info"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, unique=True)
    deskripsi = Column(Text)

class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)