from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas, auth_utils
from datetime import timedelta
from jose import JWTError, jwt
import os
import shutil
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GET CURRENT USER DEPENDENCY
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# MUST BE ADMIN DEPENDENCY
async def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Penyusup! Anda bukan admin!"
        )
    return current_user

# MUST BE MITRA DEPENDENCY
async def get_current_mitra(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "mitra" or current_user.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak! Akun Mitra belum disetujui."
        )
    return current_user

# --- ROUTES ---

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username sudah dipakai")
    
    hashed_pwd = auth_utils.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_pwd)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/register/mitra", response_model=schemas.UserResponse)
def register_mitra(
    username: str = Form(...),
    password: str = Form(...),
    nik: str = Form(...),
    nama: str = Form(...),
    nama_toko: str = Form(...),
    bukti_kepemilikan: UploadFile = File(...),
    ktp: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Cek username
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username sudah dipakai")

    # Upload bukti_kepemilikan
    ext_bukti = os.path.splitext(bukti_kepemilikan.filename)[1]
    name_bukti = f"mitra_bukti_{uuid.uuid4().hex}{ext_bukti}"
    path_bukti = os.path.join(UPLOAD_DIR, name_bukti)
    with open(path_bukti, "wb") as buffer:
        shutil.copyfileobj(bukti_kepemilikan.file, buffer)
    web_bukti = f"uploads/{name_bukti}"

    # Upload KTP
    ext_ktp = os.path.splitext(ktp.filename)[1]
    name_ktp = f"mitra_ktp_{uuid.uuid4().hex}{ext_ktp}"
    path_ktp = os.path.join(UPLOAD_DIR, name_ktp)
    with open(path_ktp, "wb") as buffer:
        shutil.copyfileobj(ktp.file, buffer)
    web_ktp = f"uploads/{name_ktp}"

    hashed_pwd = auth_utils.get_password_hash(password)
    new_mitra = models.User(
        username=username,
        hashed_password=hashed_pwd,
        role="mitra",
        status="pending",
        nik=nik,
        nama=nama,
        nama_toko=nama_toko,
        bukti_kepemilikan=web_bukti,
        ktp=web_ktp
    )

    db.add(new_mitra)
    db.commit()
    db.refresh(new_mitra)
    return new_mitra

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau Password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.role == "mitra" and user.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pendaftaran Mitra Anda masih pending atau ditolak. Hubungi Admin.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "status": user.status}
