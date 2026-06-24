from sqlalchemy import create_engine, text
import sys

try:
    print("Connecting to DB...")
    engine = create_engine("sqlite:///./interior.db")
    with engine.connect() as conn:
        print("Connected. Executing query...")
        result = conn.execute(text("SELECT 1"))
        print(f"Result: {result.fetchone()}")
        print("DB Verified.")
except Exception as e:
    print(f"DB Error: {e}")
    sys.exit(1)
