from pydantic import BaseModel
from typing import Optional

class BatikBase(BaseModel):
    nama: str
    motif_utama: str
    jenis_acara: str
    jenis_batik: str
    filosofi: str
    shopee_link: Optional[str] = None
    tokopedia_link: Optional[str] = None

class BatikResponse(BatikBase):
    id: int
    gambar: str
    mitra_id: Optional[int] = None
    nama_toko: Optional[str] = None

    class Config:
        from_attributes = True

# USER SCHEMAS
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    status: str
    nik: Optional[str] = None
    nama: Optional[str] = None
    nama_toko: Optional[str] = None
    bukti_kepemilikan: Optional[str] = None
    ktp: Optional[str] = None

    class Config:
        from_attributes = True

# AUTH SCHEMAS
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    status: Optional[str] = None

class TokenData(BaseModel):
    username: Optional[str] = None