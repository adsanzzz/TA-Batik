import sys
from database import engine
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        print("Koneksi ke database 'batik' BERHASIL!")
except SQLAlchemyError as e:
    print("Gagal terkoneksi ke database.")
    print("Error detail:", str(e))
except Exception as e:
    print("Terjadi error lain:")
    print(str(e))
