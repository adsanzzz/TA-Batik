from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import auth_utils

# Create tables
print(" Membuat tabel di database...")
Base.metadata.create_all(bind=engine)

# Add Default Admin
def create_initial_admin():
    db = SessionLocal()
    try:
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        hashed_pwd = auth_utils.get_password_hash("admin123")
        
        if not admin_user:
            print(" Membuat akun admin default...")
            new_admin = models.User(
                username="admin", 
                hashed_password=hashed_pwd, 
                role="admin"
            )
            db.add(new_admin)
            print(" Admin created! Username: admin | Password: admin123")
        else:
            print(" Resetting admin password and role...")
            admin_user.hashed_password = hashed_pwd
            admin_user.role = "admin"
            print(" Admin reset! Username: admin | Password: admin123")
        
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_admin()
    print(" Selesai!")