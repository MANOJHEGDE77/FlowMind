from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models import models
    Base.metadata.create_all(bind=engine)
    # Automatic backward-compatible column migration for SQLite
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            cols = [row[1] for row in conn.execute(text("PRAGMA table_info(evidence)")).fetchall()]
            if cols and "source_type" not in cols:
                conn.execute(text("ALTER TABLE evidence ADD COLUMN source_type VARCHAR(50) DEFAULT 'FACT_FROM_DOCUMENT'"))
                conn.commit()

            o_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(decision_outcomes)")).fetchall()]
            if o_cols:
                if "expected_outcome" not in o_cols:
                    conn.execute(text("ALTER TABLE decision_outcomes ADD COLUMN expected_outcome TEXT"))
                if "what_went_right" not in o_cols:
                    conn.execute(text("ALTER TABLE decision_outcomes ADD COLUMN what_went_right JSON DEFAULT '[]'"))
                if "what_went_wrong" not in o_cols:
                    conn.execute(text("ALTER TABLE decision_outcomes ADD COLUMN what_went_wrong JSON DEFAULT '[]'"))
                if "incorrect_assumptions" not in o_cols:
                    conn.execute(text("ALTER TABLE decision_outcomes ADD COLUMN incorrect_assumptions JSON DEFAULT '[]'"))
                if "lessons_learned" not in o_cols:
                    conn.execute(text("ALTER TABLE decision_outcomes ADD COLUMN lessons_learned TEXT"))
                conn.commit()
        except Exception as e:
            print(f"[DB Init] Column migration notice: {e}")
