import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth & User Schemas -----------------

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    preferences: Dict[str, Any] = {}
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Decision Entities -----------------

class DecisionOptionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    pros: List[str] = []
    cons: List[str] = []

class DecisionOptionResponse(BaseModel):
    id: int
    decision_id: int
    title: str
    description: Optional[str] = None
    pros: List[str] = []
    cons: List[str] = []
    score: float = 0.0
    alignment_scores: Dict[str, float] = {}
    is_recommended: bool = False

    class Config:
        from_attributes = True

class DecisionFactorCreate(BaseModel):
    name: str
    category: str = "general"
    weight: float = 1.0
    description: Optional[str] = None

class DecisionFactorResponse(BaseModel):
    id: int
    name: str
    category: str
    weight: float
    description: Optional[str] = None

    class Config:
        from_attributes = True

class GoalCreate(BaseModel):
    description: str
    priority: str = "medium"
    weight: float = 1.0

class GoalResponse(BaseModel):
    id: int
    description: str
    priority: str
    weight: float

    class Config:
        from_attributes = True

class ConstraintCreate(BaseModel):
    description: str
    severity: str = "hard"

class ConstraintResponse(BaseModel):
    id: int
    description: str
    severity: str

    class Config:
        from_attributes = True

# ----------------- Evidence & Agents -----------------

class EvidenceResponse(BaseModel):
    id: int
    decision_id: int
    claim: str
    source_document_id: Optional[int] = None
    source_title: str
    page_or_section: Optional[str] = None
    quote: str
    relevance_explanation: str
    agent_name: str

    class Config:
        from_attributes = True

class AgentRunResponse(BaseModel):
    id: int
    decision_id: int
    agent_name: str
    agent_role: str
    status: str
    viewpoint: str
    findings: Dict[str, Any]
    confidence: float
    duration_ms: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Decision Request / Response -----------------

class DecisionCreate(BaseModel):
    title: str
    context: str
    options: List[DecisionOptionCreate] = []
    factors: List[DecisionFactorCreate] = []
    goals: List[GoalCreate] = []
    constraints: List[ConstraintCreate] = []

class DecisionQuickPrompt(BaseModel):
    prompt: str

class DecisionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    context: str
    status: str
    recommendation: Optional[str] = None
    alternative_recommendation: Optional[str] = None
    confidence_score: float = 0.0
    decision_score: float = 0.0
    reasoning_summary: Optional[str] = None
    what_could_change: List[str] = []
    contradictions: List[str] = []
    challenge_history: List[Dict[str, Any]] = []
    options: List[DecisionOptionResponse] = []
    factors: List[DecisionFactorResponse] = []
    goals: List[GoalResponse] = []
    constraints: List[ConstraintResponse] = []
    evidence_items: List[EvidenceResponse] = []
    agent_runs: List[AgentRunResponse] = []
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class DecisionListItem(BaseModel):
    id: int
    title: str
    status: str
    recommendation: Optional[str] = None
    confidence_score: float = 0.0
    decision_score: float = 0.0
    options_count: int = 0
    created_at: datetime.datetime

# ----------------- Challenge Feature -----------------

class ChallengeRequest(BaseModel):
    target_recommendation: Optional[str] = None
    focus_area: Optional[str] = None  # e.g., "financial assumptions", "growth potential", "risk severity"

class ChallengeResponse(BaseModel):
    decision_id: int
    original_confidence: float
    recalculated_confidence: float
    confidence_delta: float
    vulnerabilities: List[str]
    attack_vector: str
    devil_advocate_critique: str
    alternative_scenario: str
    fragility_verdict: str  # "Robust", "Moderately Sensitive", "Fragile"

# ----------------- What-If Simulator -----------------

class SimulationRequest(BaseModel):
    scenario_title: str
    modifications: Dict[str, Any]
    # e.g.:
    # {
    #    "salary_change_pct": 20,
    #    "prioritize_remote": True,
    #    "tenure_horizon_years": 2,
    #    "exclude_financial": False
    # }

class SimulationResponse(BaseModel):
    scenario_id: int
    decision_id: int
    title: str
    recommended_option_before: str
    recommended_option_after: str
    confidence_before: float
    confidence_after: float
    score_delta: float
    key_drivers: List[str]
    diff_explanation: str
    updated_option_scores: Dict[str, float]

# ----------------- Decision Outcome -----------------

class OutcomeCreate(BaseModel):
    chosen_option_title: str
    actual_outcome_notes: Optional[str] = None
    satisfaction_score: int = Field(5, ge=1, le=10)
    ai_accuracy_rating: int = Field(5, ge=1, le=10)

class OutcomeResponse(BaseModel):
    id: int
    decision_id: int
    chosen_option_title: str
    actual_outcome_notes: Optional[str] = None
    satisfaction_score: int
    ai_accuracy_rating: int
    recorded_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Document / RAG -----------------

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    status: str
    chunk_count: int = 0
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- AI Question Answering -----------------

class AskQuestionRequest(BaseModel):
    question: str
    decision_id: Optional[int] = None
    context: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []

class AskQuestionResponse(BaseModel):
    question: str
    answer: str
    model_used: str
    confidence: float = 0.85
    relevant_factors: List[str] = []
    suggested_followups: List[str] = []
    citations: List[str] = []

# ----------------- Real-Time Pathway & Option Suggestion -----------------

class SuggestedPathwayItem(BaseModel):
    title: str
    description: str = ""

class SuggestOptionsRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

class SuggestOptionsResponse(BaseModel):
    prompt: str
    suggested_title: str
    options: List[SuggestedPathwayItem]
    factors: List[Dict[str, Any]] = []
    goals: List[Dict[str, Any]] = []
    constraints: List[Dict[str, Any]] = []

