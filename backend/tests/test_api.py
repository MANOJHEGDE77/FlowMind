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
    assert len(data["agent_runs"]) >= 5
    assert len(data["evidence_items"]) >= 1

    decision_id = data["id"]

    # Test Challenge Feature
    challenge_resp = client.post(f"/api/decisions/{decision_id}/challenge", json={
        "target_recommendation": data["recommendation"],
        "focus_area": "risk severity"
    })
    assert challenge_resp.status_code == 200
    c_data = challenge_resp.json()
    assert c_data["recalculated_confidence"] < c_data["original_confidence"]
    assert len(c_data["vulnerabilities"]) > 0
    assert c_data["devil_advocate_critique"] is not None

    # Test What-If Simulator
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

    # Test Outcome Recording
    outcome_resp = client.post(f"/api/decisions/{decision_id}/outcomes", json={
        "chosen_option_title": data["recommendation"],
        "actual_outcome_notes": "Accepted offer. Accelerated learning exceeded expectations in first 6 months.",
        "satisfaction_score": 9,
        "ai_accuracy_rating": 9
    })
    assert outcome_resp.status_code == 200
    o_data = outcome_resp.json()
    assert o_data["satisfaction_score"] == 9

def test_upload_document_rag():
    # Test document upload and RAG text extraction
    file_content = b"Candidate Offer: Senior Architect. Base salary: $260,000 USD. Equity: 40,000 ISOs. Remote work: approved."
    files = {"file": ("test_offer.txt", file_content, "text/plain")}
    resp = client.post("/api/documents/upload", files=files)
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


