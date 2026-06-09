from database import engine
from sqlalchemy import text

def run_migration():
    print("Running migration to add Mitra columns...")
    queries = [
        # User columns
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'approved';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS nik VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS nama VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_toko TEXT;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS bukti_kepemilikan VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS ktp VARCHAR;",
        # Batik columns
        "ALTER TABLE batik ADD COLUMN IF NOT EXISTS shopee_link VARCHAR;",
        "ALTER TABLE batik ADD COLUMN IF NOT EXISTS tokopedia_link VARCHAR;",
        "ALTER TABLE batik ADD COLUMN IF NOT EXISTS mitra_id INTEGER REFERENCES users(id) ON DELETE SET NULL;"
    ]
    
    with engine.connect() as conn:
        for q in queries:
            try:
                conn.execute(text(q))
                print(f"Executed: {q}")
            except Exception as e:
                print(f"Error executing '{q}': {e}")
        conn.commit()
    print("Migration finished!")

if __name__ == "__main__":
    run_migration()
