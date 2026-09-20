import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    preferences = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    decisions = relationship("Decision", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    context = Column(Text, nullable=False)
    status = Column(String(50), default="draft")  # draft, analyzing, completed, challenged
    
    # Synthesis results
    recommendation = Column(Text, nullable=True)
    alternative_recommendation = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.0)
    decision_score = Column(Float, default=0.0)
    reasoning_summary = Column(Text, nullable=True)
    what_could_change = Column(JSON, default=list)
    contradictions = Column(JSON, default=list)
    challenge_history = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="decisions")
    options = relationship("DecisionOption", back_populates="decision", cascade="all, delete-orphan")
    factors = relationship("DecisionFactor", back_populates="decision", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="decision", cascade="all, delete-orphan")
    constraints = relationship("Constraint", back_populates="decision", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="decision")
    evidence_items = relationship("Evidence", back_populates="decision", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="decision", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="decision", cascade="all, delete-orphan")
    outcomes = relationship("DecisionOutcome", back_populates="decision", cascade="all, delete-orphan")

class DecisionOption(Base):
    __tablename__ = "decision_options"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    pros = Column(JSON, default=list)
    cons = Column(JSON, default=list)
    score = Column(Float, default=0.0)
    alignment_scores = Column(JSON, default=dict)  # {"goal": 85, "cost": 70, "risk": 40, "growth": 90, "flexibility": 75}
    is_recommended = Column(Boolean, default=False)

    decision = relationship("Decision", back_populates="options")

class DecisionFactor(Base):
    __tablename__ = "decision_factors"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="general")  # career, financial, risk, personal, strategic
    weight = Column(Float, default=1.0)
    description = Column(Text, nullable=True)

    decision = relationship("Decision", back_populates="factors")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="medium")  # high, medium, low
    weight = Column(Float, default=1.0)

    decision = relationship("Decision", back_populates="goals")

class Constraint(Base):
    __tablename__ = "constraints"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="hard")  # hard, soft

    decision = relationship("Decision", back_populates="constraints")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="SET NULL"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, default=0)
    content_text = Column(Text, nullable=True)
    status = Column(String(50), default="processed")  # uploaded, processed, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="documents")
    decision = relationship("Decision", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)
    metadata_info = Column(JSON, default=dict)

    document = relationship("Document", back_populates="chunks")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    claim = Column(Text, nullable=False)
    source_type = Column(String(50), default="FACT_FROM_DOCUMENT")  # FACT_FROM_DOCUMENT, AI_INFERENCE, USER_ASSUMPTION
    source_document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    chunk_id = Column(Integer, nullable=True)
    source_title = Column(String(255), default="Direct User Context")
    page_or_section = Column(String(100), nullable=True)
    quote = Column(Text, nullable=False)
    relevance_explanation = Column(Text, nullable=False)
    agent_name = Column(String(100), default="Analyst")

    decision = relationship("Decision", back_populates="evidence_items")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)  # Analyst, Optimist, Skeptic, Financial, Long-Term, Devil's Advocate, Synthesizer
    agent_role = Column(String(255), nullable=False)
    status = Column(String(50), default="completed")  # running, completed, failed
    viewpoint = Column(Text, nullable=False)
    findings = Column(JSON, default=dict)  # structured key takeaways, scores, risks, opportunities
    confidence = Column(Float, default=0.85)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    decision = relationship("Decision", back_populates="agent_runs")

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    assumption_changes = Column(JSON, default=dict)  # e.g., {"salary_change": 20, "remote_priority": "high"}
    recalculated_score = Column(Float, default=0.0)
    recalculated_confidence = Column(Float, default=0.0)
    recommended_option = Column(String(255), nullable=False)
    diff_summary = Column(JSON, default=dict)  # {"score_delta": +8.5, "impact_reason": "..."}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    decision = relationship("Decision", back_populates="scenarios")

class DecisionOutcome(Base):
    __tablename__ = "decision_outcomes"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    chosen_option_title = Column(String(255), nullable=False)
    actual_outcome_notes = Column(Text, nullable=True)
    expected_outcome = Column(Text, nullable=True)
    what_went_right = Column(JSON, default=list)
    what_went_wrong = Column(JSON, default=list)
    incorrect_assumptions = Column(JSON, default=list)
    lessons_learned = Column(Text, nullable=True)
    satisfaction_score = Column(Integer, default=5)  # 1 to 10
    ai_accuracy_rating = Column(Integer, default=5)  # 1 to 10
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    decision = relationship("Decision", back_populates="outcomes")
