import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Railway Postgres URL starts with postgres://
# SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL) if DATABASE_URL else None
SessionLocal = sessionmaker(bind=engine) if engine else None


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all website tables if they don't exist."""
    if engine is None:
        raise RuntimeError("DATABASE_URL is not set")

    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS web_candidates (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                cv_file_path VARCHAR(500),
                raw_cv_text TEXT,
                status VARCHAR(50) DEFAULT 'web_submission',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS web_jobs (
                id INTEGER PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                salary_range VARCHAR(255),
                closing_date VARCHAR(50),
                urgent BOOLEAN DEFAULT FALSE,
                min_requirements TEXT,
                raw_text TEXT,
                status VARCHAR(50) DEFAULT 'open',
                synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS web_submissions (
                id SERIAL PRIMARY KEY,
                candidate_id INTEGER REFERENCES web_candidates(id),
                job_id INTEGER REFERENCES web_jobs(id),
                stage1_score INTEGER,
                stage1_analysis TEXT,
                stage1_questions TEXT,
                gate1_passed BOOLEAN DEFAULT TRUE,
                stage2_score INTEGER,
                combined_score INTEGER,
                status VARCHAR(50) DEFAULT 'active',
                email_sent BOOLEAN DEFAULT FALSE,
                source VARCHAR(50) DEFAULT 'website',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS web_interview_answers (
                id SERIAL PRIMARY KEY,
                submission_id INTEGER REFERENCES web_submissions(id),
                answers_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
