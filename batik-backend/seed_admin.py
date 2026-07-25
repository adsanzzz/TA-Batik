from database import SessionLocal, engine, Base
import models
import auth_utils

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if admin_user:
            print("Akun Admin 'admin' sudah ada di database.")
            return

        hashed_pwd = auth_utils.get_password_hash("admin123")
        new_admin = models.User(
            username="admin",
            hashed_password=hashed_pwd,
            role="admin",
            status="approved",
            nama="Administrator"
        )
        db.add(new_admin)
        db.commit()
        print("✅ AKUN ADMIN BERHASIL DIBUAT!")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Role    : admin")
    except Exception as e:
        db.rollback()
        print(f"❌ Gagal membuat akun admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
