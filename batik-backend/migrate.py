from database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE batik ADD COLUMN jenis_acara VARCHAR;"))
        conn.commit()
    print("Column 'jenis_acara' added successfully.")
except Exception as e:
    print(f"Error: {e}")
