from database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM frames LIMIT 1;"))
        print("Table 'frames' exists.")
except Exception as e:
    print(f"Error: {e}")
