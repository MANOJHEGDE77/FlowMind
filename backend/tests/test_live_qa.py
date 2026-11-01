import sys
import os
import pytest

# Ensure backend directory is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.services.ai_qa_service import ai_qa_service
from app.database.session import init_db, SessionLocal
from app.models.models import Decision, DecisionOption, Goal, User

@pytest.mark.asyncio
async def test_live_qa_greeting():
    res = await ai_qa_service.ask_question("Hello")
    assert "answer" in res
    assert len(res["answer"]) > 10
    assert "FlowMind" in res["answer"]
    assert "model_used" in res

@pytest.mark.asyncio
async def test_live_qa_council_explanation():
    res = await ai_qa_service.ask_question("How does the 7-agent council work?")
    assert "answer" in res
    assert len(res["answer"]) > 50
    assert any(w in res["answer"].lower() for w in ["council", "agent", "analyst", "deliberat"])

@pytest.mark.asyncio
async def test_live_qa_type1_door_framework():
    res = await ai_qa_service.ask_question("What is a Type 1 vs Type 2 door?")
    assert "answer" in res
    assert len(res["answer"]) > 50
    assert any(w in res["answer"].lower() for w in ["door", "irreversible", "reversible", "decision"])

@pytest.mark.asyncio
async def test_live_qa_decision_grounded():
    init_db()
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            user = User(email="test_live_qa@flowmind.ai", hashed_password="pw", full_name="Live QA Tester")
            db.add(user)
            db.commit()
            db.refresh(user)

        decision = Decision(
            user_id=user.id,
            title="Senior Offer at Series B vs Lead Offer at BigTech",
            context="Comparing compensation, equity upside, and career ownership.",
            recommendation="Senior Offer at Series B",
            confidence_score=0.88,
            reasoning_summary="Higher asymmetric learning velocity and equity upside."
        )
        db.add(decision)
        db.commit()
        db.refresh(decision)

        db.add(DecisionOption(decision_id=decision.id, title="Senior Offer at Series B", score=0.88, is_recommended=True))
        db.add(DecisionOption(decision_id=decision.id, title="Lead Offer at BigTech", score=0.72, is_recommended=False))
        db.add(Goal(decision_id=decision.id, description="Maximize learning and career leverage", priority="high", weight=1.0))
        db.commit()

        res = await ai_qa_service.ask_question(
            question="Why is the top option recommended over the alternative?",
            decision_id=decision.id,
            db=db
        )
        assert len(res["answer"]) > 50
        assert any(w in res["answer"].lower() for w in ["series b", "bigtech", "recommend", "option"])
    finally:
        db.close()
