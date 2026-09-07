from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Decision, Document, Evidence, AgentRun, DecisionOption
from app.schemas.schemas import (
    UserRegister, UserLogin, Token, UserResponse,
    DecisionCreate, DecisionQuickPrompt, DecisionResponse, DecisionListItem,
    ChallengeRequest, ChallengeResponse,
    SimulationRequest, SimulationResponse,
    OutcomeCreate, OutcomeResponse,
    EvidenceResponse, AgentRunResponse, DocumentResponse
)
from app.services.auth_service import auth_service, get_current_user
from app.services.decision_service import decision_service
from app.agents.orchestrator import orchestrator
from app.services.rag_service import rag_service

api_router = APIRouter()

# ----------------- Authentication -----------------

@api_router.post("/auth/register", response_model=UserResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    return auth_service.register(db, data)

@api_router.post("/auth/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    return auth_service.authenticate(db, data)

@api_router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ----------------- Decisions -----------------

@api_router.get("/decisions", response_model=List[DecisionListItem])
def list_decisions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decisions = (
        db.query(Decision)
        .filter(Decision.user_id == current_user.id)
        .order_by(Decision.created_at.desc())
        .all()
    )
    result = []
    for d in decisions:
        result.append(DecisionListItem(
            id=d.id,
            title=d.title,
            status=d.status,
            recommendation=d.recommendation,
            confidence_score=d.confidence_score,
            decision_score=d.decision_score,
            options_count=len(d.options),
            created_at=d.created_at
        ))
    return result

@api_router.post("/decisions", response_model=DecisionResponse)
async def create_decision(
    data: DecisionCreate,
    auto_analyze: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decision = decision_service.create_decision(db, current_user.id, data)
    if auto_analyze:
        decision = await orchestrator.run_orchestration(db, decision.id)
    return decision

@api_router.post("/decisions/quick", response_model=DecisionResponse)
async def create_quick_decision(
    data: DecisionQuickPrompt,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decision = decision_service.create_quick_decision(db, current_user.id, data.prompt)
    decision = await orchestrator.run_orchestration(db, decision.id)
    return decision

@api_router.get("/decisions/{decision_id}", response_model=DecisionResponse)
def get_decision(
    decision_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(Decision.id == decision_id, Decision.user_id == current_user.id)
        .first()
    )
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision

@api_router.delete("/decisions/{decision_id}")
def delete_decision(
    decision_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(Decision.id == decision_id, Decision.user_id == current_user.id)
        .first()
    )
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    db.delete(decision)
    db.commit()
    return {"status": "success", "message": "Decision deleted successfully"}

@api_router.post("/decisions/{decision_id}/analyze", response_model=DecisionResponse)
async def run_analysis(
    decision_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(Decision.id == decision_id, Decision.user_id == current_user.id)
        .first()
    )
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    updated = await orchestrator.run_orchestration(db, decision.id)
    return updated

@api_router.post("/decisions/{decision_id}/challenge", response_model=ChallengeResponse)
def challenge_decision_endpoint(
    decision_id: int,
    data: ChallengeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(Decision.id == decision_id, Decision.user_id == current_user.id)
        .first()
    )
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    return decision_service.challenge_decision(db, decision.id, data)

@api_router.post("/decisions/{decision_id}/simulate", response_model=SimulationResponse)
def simulate_what_if_endpoint(
    decision_id: int,
    data: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(Decision.id == decision_id, Decision.user_id == current_user.id)
        .first()
    )
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return decision_service.simulate_what_if(db, decision.id, data)

@api_router.post("/decisions/{decision_id}/outcomes", response_model=OutcomeResponse)
def record_outcome_endpoint(
    decision_id: int,
    data: OutcomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(Decision.id == decision_id, Decision.user_id == current_user.id)
        .first()
    )
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return decision_service.record_outcome(db, decision.id, current_user.id, data)

@api_router.get("/decisions/{decision_id}/evidence", response_model=List[EvidenceResponse])
def get_decision_evidence(
    decision_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    evidence = db.query(Evidence).filter(Evidence.decision_id == decision_id).all()
    return evidence

@api_router.get("/decisions/{decision_id}/agents", response_model=List[AgentRunResponse])
def get_decision_agents(
    decision_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    runs = db.query(AgentRun).filter(AgentRun.decision_id == decision_id).all()
    return runs

# ----------------- Document Intelligence & RAG -----------------

@api_router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    decision_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content_bytes = await file.read()
    if len(content_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds maximum size of 25MB")

    extracted = rag_service.extract_text(content_bytes, file.filename)

    document = Document(
        user_id=current_user.id,
        decision_id=decision_id,
        filename=file.filename,
        file_type=file.filename.split(".")[-1].lower(),
        file_size=len(content_bytes),
        content_text=extracted["full_text"],
        status="processed"
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Chunk and generate embeddings
    rag_service.chunk_and_store(db, document.id, extracted)

    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        file_type=document.file_type,
        file_size=document.file_size,
        status=document.status,
        chunk_count=len(extracted.get("pages", [])),
        created_at=document.created_at
    )
