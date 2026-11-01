import pytest
import os
import sys

# Ensure backend directory is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import init_db

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Analyst" in data["agents"]

def test_auth_flow():
    email = "testuser@flowmind.ai"
    password = "supersecretpassword123"
    
    # 1. Register
    reg_resp = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test Strategist"
    })
    # Either 200 (created) or 400 (already exists from earlier test)
    assert reg_resp.status_code in [200, 400]

    # 2. Login
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

def test_create_and_orchestrate_quick_decision():
    prompt = "Should I accept Senior Offer at Startup vs Lead Offer at BigTech vs Self-Funded Venture?"
    resp = client.post("/api/decisions/quick", json={"prompt": prompt})
    assert resp.status_code == 200
    data = resp.json()

    assert data["id"] is not None
    assert len(data["options"]) >= 2
    assert data["status"] == "completed"
    assert data["recommendation"] is not None
    assert data["confidence_score"] > 0
    assert len(data["agent_runs"]) >= 7  # All 7 council agents including Synthesizer
    assert len(data["evidence_items"]) >= 1
    # Verify evidence source_type provenance
    assert data["evidence_items"][0]["source_type"] in ["USER_ASSUMPTION", "FACT_FROM_DOCUMENT", "AI_INFERENCE"]
    # Verify structured agent findings
    assert "keyFindings" in data["agent_runs"][0]["findings"]

    decision_id = data["id"]

    # Test Challenge Feature with Structured Red Team Contract
    challenge_resp = client.post(f"/api/decisions/{decision_id}/challenge", json={
        "target_recommendation": data["recommendation"],
        "focus_area": "risk severity"
    })
    assert challenge_resp.status_code == 200
    c_data = challenge_resp.json()
    assert c_data["recalculated_confidence"] < c_data["original_confidence"]
    assert len(c_data["vulnerabilities"]) > 0
    assert c_data["devil_advocate_critique"] is not None
    assert c_data["attackedOption"] == data["recommendation"]
    assert len(c_data["criticalAssumptions"]) >= 1
    assert len(c_data["failureScenarios"]) >= 1
    assert len(c_data["questionsToValidate"]) >= 1

    # Test What-If Simulator with 1,000-run Monte Carlo Sensitivity Engine
    sim_resp = client.post(f"/api/decisions/{decision_id}/simulate", json={
        "scenario_title": "Startup 25% Equity & Compensation Bump",
        "modifications": {
            "salary_change_pct": 25,
            "prioritize_remote": True,
            "tenure_horizon_years": 3
        }
    })
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert "updated_option_scores" in sim_data
    assert sim_data["diff_explanation"] is not None
    assert sim_data["monte_carlo_runs"] == 1000
    assert "p50" in sim_data["outcome_distribution"]
    assert sim_data["volatility"] >= 0
    assert "sensitivity analysis" in sim_data["disclaimer"].lower()

    # Test Outcome Recording with Calibration Memory
    outcome_resp = client.post(f"/api/decisions/{decision_id}/outcomes", json={
        "chosen_option_title": data["recommendation"],
        "actual_outcome_notes": "Accepted offer. Accelerated learning exceeded expectations in first 6 months.",
        "expected_outcome": "Expected high autonomy and steep learning curve.",
        "what_went_right": ["Autonomous execution", "Rapid technical mastery"],
        "what_went_wrong": ["Initial friction with cross-functional dependencies"],
        "incorrect_assumptions": ["Assumed 40hr weeks without overtime"],
        "lessons_learned": "Clarify cross-team expectations before onboarding.",
        "satisfaction_score": 9,
        "ai_accuracy_rating": 9
    })
    assert outcome_resp.status_code == 200
    o_data = outcome_resp.json()
    assert o_data["satisfaction_score"] == 9
    assert o_data["expected_outcome"] == "Expected high autonomy and steep learning curve."
    assert len(o_data["what_went_right"]) == 2

    # Verify decision is marked resolved and contains outcomes
    dec_check = client.get(f"/api/decisions/{decision_id}").json()
    assert dec_check["status"] == "resolved"
    assert len(dec_check["outcomes"]) >= 1

def test_upload_document_rag():
    # Test document upload and RAG text extraction with decision link
    file_content = b"Candidate Offer: Senior Architect. Base salary: $260,000 USD. Equity: 40,000 ISOs. Remote work: approved."
    files = {"file": ("test_offer.txt", file_content, "text/plain")}
    resp = client.post("/api/documents/upload", files=files, data={"decision_id": 1})
    assert resp.status_code == 200
    doc_data = resp.json()
    assert doc_data["id"] is not None
    assert doc_data["filename"] == "test_offer.txt"
    assert doc_data["chunk_count"] >= 1

def test_ai_question_answering():
    # 1. Global question answering
    q_resp = client.post("/api/ai/ask", json={
        "question": "What are the core trade-offs between cash compensation and early-stage startup equity?"
    })
    assert q_resp.status_code == 200
    data = q_resp.json()
    assert data["question"] is not None
    assert len(data["answer"]) > 50
    assert data["confidence"] > 0
    assert len(data["relevant_factors"]) > 0

    # 2. Contextual decision-grounded question
    prompt = "Should I pursue an accelerated MS degree or take an immediate Staff Engineer offer?"
    dec_resp = client.post("/api/decisions/quick", json={"prompt": prompt})
    assert dec_resp.status_code == 200
    dec_id = dec_resp.json()["id"]

    q_dec_resp = client.post(f"/api/decisions/{dec_id}/ask", json={
        "question": "Why is the top option recommended over the alternative?",
        "decision_id": dec_id
    })
    assert q_dec_resp.status_code == 200
    dec_q_data = q_dec_resp.json()
    assert len(dec_q_data["answer"]) > 50
    assert dec_q_data["model_used"] is not None

def test_suggest_pathway_options():
    # Test open-ended ambition pathway generation
    resp = client.post("/api/ai/suggest-options", json={
        "prompt": "I want to become an AI engineer"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["options"]) >= 2
    assert "AI" in data["suggested_title"] or "Engineer" in data["suggested_title"]
    # Check that each option is a distinct pathway, not just the prompt
    for opt in data["options"]:
        assert len(opt["title"]) > 5
        assert opt["title"].lower() != "i want to become an ai engineer"

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "FlowMind" in data["message"]
    assert data["docs"] == "/docs"

def test_ai_config_endpoint():
    resp = client.get("/api/ai/config")
    assert resp.status_code == 200
    data = resp.json()
    assert "gemini_configured" in data
    assert data["provider"] == "Google DeepMind Gemini"

def test_manual_decision_lifecycle_and_evidence():
    # 1. Create a full decision manually
    create_payload = {
        "title": "Cloud Provider: AWS vs GCP for AI Microservices",
        "context": "Evaluating infrastructure for high-throughput embedding generation and low latency.",
        "options": [
            {"title": "AWS ECS + Bedrock", "description": "Managed container cluster with AWS infrastructure", "pros": ["Enterprise reliability"], "cons": ["High egress fees"]},
            {"title": "GCP Cloud Run + Vertex AI", "description": "Serverless container compute with Gemini models", "pros": ["Best AI native integration"], "cons": ["Less familiar tooling"]}
        ],
        "factors": [
            {"name": "Cost", "category": "financial", "weight": 1.2},
            {"name": "Developer Velocity", "category": "strategic", "weight": 1.0}
        ],
        "goals": [
            {"description": "Sub-100ms API response time", "priority": "high", "weight": 1.0}
        ],
        "constraints": [
            {"description": "Budget under $2,000/mo", "severity": "hard"}
        ]
    }
    create_resp = client.post("/api/decisions", json=create_payload)
    assert create_resp.status_code == 200
    dec_data = create_resp.json()
    dec_id = dec_data["id"]
    assert dec_id is not None
    assert len(dec_data["options"]) == 2

    # 2. List decisions
    list_resp = client.get("/api/decisions")
    assert list_resp.status_code == 200
    dec_list = list_resp.json()
    assert any(d["id"] == dec_id for d in dec_list)

    # 3. Get evidence items
    ev_resp = client.get(f"/api/decisions/{dec_id}/evidence")
    assert ev_resp.status_code == 200
    assert isinstance(ev_resp.json(), list)

    # 4. Get agent runs
    agent_resp = client.get(f"/api/decisions/{dec_id}/agents")
    assert agent_resp.status_code == 200
    assert len(agent_resp.json()) >= 7

    # 5. Re-run analysis
    analyze_resp = client.post(f"/api/decisions/{dec_id}/analyze")
    assert analyze_resp.status_code == 200
    assert analyze_resp.json()["status"] == "completed"

    # 6. Delete decision
    del_resp = client.delete(f"/api/decisions/{dec_id}")
    assert del_resp.status_code == 200

    # 7. Verify deletion
    get_del = client.get(f"/api/decisions/{dec_id}")
    assert get_del.status_code == 404



