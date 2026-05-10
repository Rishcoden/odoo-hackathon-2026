import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database.connection import engine

def alter_trips_table():
    with engine.connect() as conn:
        try:
            # Check if columns exist to avoid errors if run multiple times
            conn.execute(text("ALTER TABLE trips ADD COLUMN is_public BOOLEAN DEFAULT FALSE;"))
            print("Added is_public column.")
        except Exception as e:
            print("is_public column might already exist:", e)

        try:
            conn.execute(text("ALTER TABLE trips ADD COLUMN public_share_token VARCHAR UNIQUE;"))
            conn.execute(text("CREATE INDEX ix_trips_public_share_token ON trips (public_share_token);"))
            print("Added public_share_token column and index.")
        except Exception as e:
            print("public_share_token column might already exist:", e)

        conn.commit()

if __name__ == "__main__":
    alter_trips_table()
