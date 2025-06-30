#!/usr/bin/env python3
"""Reset database by dropping all tables"""
import os
from sqlalchemy import create_engine, text

# Get database URL from environment
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set")

# Create engine
engine = create_engine(DATABASE_URL)

# Drop all tables
with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS user_ratings CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS user_progress CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS albums CASCADE"))
    conn.commit()
    print("All tables dropped successfully")

print("Database reset complete")