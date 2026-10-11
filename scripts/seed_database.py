import os
from pathlib import Path

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is required. Set it to your "
        "sentinelaidb_college database connection URL."
    )

if "sentinelaidb" in DATABASE_URL and "sentinelaidb_college" not in DATABASE_URL:
    raise RuntimeError(
        "This script must use the sentinelaidb_college database."
    )

engine = create_engine(DATABASE_URL)

schema_path = (
    Path(__file__).resolve().parents[1]
    / "database"
    / "schema.sql"
)

with engine.begin() as conn:
    conn.execute(text(schema_path.read_text(encoding="utf-8")))

print("Database schema initialized")