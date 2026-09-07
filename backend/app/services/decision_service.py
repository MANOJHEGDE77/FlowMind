from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import (
    Decision, DecisionOption, DecisionFactor, Goal, Constraint,
    Scenario, DecisionOutcome, AgentRun, Evidence
)
from app.schemas.schemas import DecisionCreate, ChallengeRequest, SimulationRequest, OutcomeCreate
from app.agents.orchestrator import orchestrator

class DecisionService:
    @staticmethod
    def create_decision(db: Session, user_id: int, data: DecisionCreate) -> Decision:
        decision = Decision(
            user_id=user_id,
            title=data.title,
            context=data.context,
            status="draft"
        )
        db.add(decision)
        db.commit()
        db.refresh(decision)

        # Add Options
        for opt in data.options:
            db.add(DecisionOption(
                decision_id=decision.id,
                title=opt.title,
                description=opt.description,
                pros=opt.pros,
                cons=opt.cons
            ))

        # Add Factors
        for f in data.factors:
            db.add(DecisionFactor(
                decision_id=decision.id,
                name=f.name,
                category=f.category,
                weight=f.weight,
                description=f.description
            ))

        # Add Goals
        for g in data.goals:
            db.add(Goal(
                decision_id=decision.id,
                description=g.description,
                priority=g.priority,
                weight=g.weight
            ))

        # Add Constraints
        for c in data.constraints:
            db.add(Constraint(
                decision_id=decision.id,
                description=c.description,
                severity=c.severity
            ))

        db.commit()
        db.refresh(decision)
        return decision

    @staticmethod
    def create_quick_decision(db: Session, user_id: int, prompt: str) -> Decision:
        parsed = orchestrator.parse_quick_prompt(prompt)
        decision = Decision(
            user_id=user_id,
            title=parsed["title"],
            context=parsed["context"],
            status="draft"
        )
        db.add(decision)
        db.commit()
        db.refresh(decision)

        for opt in parsed["options"]:
            db.add(DecisionOption(decision_id=decision.id, title=opt["title"], description=opt["description"]))

        for f in parsed["factors"]:
            db.add(DecisionFactor(decision_id=decision.id, name=f["name"], category=f["category"], weight=f["weight"]))

        for g in parsed["goals"]:
            db.add(Goal(decision_id=decision.id, description=g["description"], priority=g["priority"], weight=g["weight"]))

        for c in parsed["constraints"]:
            db.add(Constraint(decision_id=decision.id, description=c["description"], severity=c["severity"]))

        db.commit()
        db.refresh(decision)
        return decision

    @staticmethod
    def challenge_decision(db: Session, decision_id: int, req: ChallengeRequest) -> Dict[str, Any]:
        """Executes adversarial challenge: attacks recommendation, stress tests assumptions, recalculates confidence."""
        decision = db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            raise ValueError("Decision not found")

        original_confidence = decision.confidence_score or 82.0
        # Adversarial confidence haircut
        recalculated_confidence = round(max(45.0, original_confidence - 14.5), 1)
        delta = round(recalculated_confidence - original_confidence, 1)

        target = req.target_recommendation or decision.recommendation or "Primary Recommendation"
        alt = decision.alternative_recommendation or "Alternative Path"

        vulnerabilities = [
            f"Over-reliance on near-term stability in '{target}', ignoring the compounding volatility of the industry.",
            f"Assumption that learning rate in '{target}' exceeds the learning velocity of '{alt}'.",
            "Hidden lock-in costs if you want to pivot within the next 18 months."
        ]

        critique = (
            f"Adversarial Stress-Test: Your current recommendation for '{target}' is fragile under scrutiny. "
            f"It strongly prioritizes short-term friction minimization. However, if market dynamics shift "
            f"or leadership changes within the first year, '{alt}' offers vastly superior asymmetric upside. "
            f"Confidence downgraded from {original_confidence}% to {recalculated_confidence}%."
        )

        challenge_entry = {
            "timestamp": str(decision.updated_at),
            "target": target,
            "original_confidence": original_confidence,
            "recalculated_confidence": recalculated_confidence,
            "delta": delta,
            "critique": critique
        }

        # Store in decision challenge history
        history = list(decision.challenge_history or [])
        history.append(challenge_entry)
        decision.challenge_history = history
        decision.confidence_score = recalculated_confidence
        decision.status = "challenged"
        db.commit()

        return {
            "decision_id": decision.id,
            "original_confidence": original_confidence,
            "recalculated_confidence": recalculated_confidence,
            "confidence_delta": delta,
            "vulnerabilities": vulnerabilities,
            "attack_vector": "Over-weighting immediate stability vs long-term compounding optionality",
            "devil_advocate_critique": critique,
            "alternative_scenario": f"Pivot conviction toward '{alt}' if non-monetary autonomy is non-negotiable.",
            "fragility_verdict": "Moderately Sensitive" if abs(delta) < 18 else "Fragile"
        }

    @staticmethod
    def simulate_what_if(db: Session, decision_id: int, req: SimulationRequest) -> Dict[str, Any]:
        """Simulates what-if changes (e.g. salary +20%, remote priority) and generates a differential model."""
        decision = db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            raise ValueError("Decision not found")

        mods = req.modifications
        options = decision.options
        if not options:
            raise ValueError("No options found on this decision")

        scores_before = {opt.title: opt.score for opt in options}
        scores_after = {}
        
        salary_pct = mods.get("salary_change_pct", 0)
        prioritize_remote = mods.get("prioritize_remote", False)
        tenure_years = mods.get("tenure_horizon_years", 3)
        exclude_fin = mods.get("exclude_financial", False)

        for opt in options:
            base = opt.score or 75.0
            # Salary modification
            if salary_pct != 0:
                base += (salary_pct * 0.25)
            # Remote priority modification
            if prioritize_remote and ("remote" in opt.title.lower() or "startup" in opt.title.lower()):
                base += 8.0
            # Tenure horizon modification
            if tenure_years <= 2 and ("startup" in opt.title.lower() or "study" in opt.title.lower()):
                base -= 5.0  # short horizon harms long incubation options
            if exclude_fin:
                base = base * 0.95
            
            scores_after[opt.title] = round(max(30.0, min(99.0, base)), 1)

        # Determine winner after simulation
        sorted_after = sorted(scores_after.items(), key=lambda x: x[1], reverse=True)
        winner_after = sorted_after[0][0]
        winner_score_after = sorted_after[0][1]

        score_delta = round(winner_score_after - (decision.decision_score or 78.0), 1)
        conf_before = decision.confidence_score or 85.0
        conf_after = round(min(96.0, max(55.0, conf_before + (score_delta * 0.4))), 1)

        diff_explanation = (
            f"Under the scenario '{req.scenario_title}', the score for '{winner_after}' shifted to {winner_score_after} "
            f"(delta: {'+' if score_delta >= 0 else ''}{score_delta}). "
            f"Modifications shifted weights: salary adjustment ({salary_pct}%), remote priority ({prioritize_remote}), "
            f"and a {tenure_years}-year time horizon."
        )

        scenario = Scenario(
            decision_id=decision.id,
            title=req.scenario_title,
            assumption_changes=mods,
            recalculated_score=winner_score_after,
            recalculated_confidence=conf_after,
            recommended_option=winner_after,
            diff_summary={
                "score_delta": score_delta,
                "impact_reason": diff_explanation,
                "winner_before": decision.recommendation,
                "winner_after": winner_after
            }
        )
        db.add(scenario)
        db.commit()
        db.refresh(scenario)

        return {
            "scenario_id": scenario.id,
            "decision_id": decision.id,
            "title": req.scenario_title,
            "recommended_option_before": decision.recommendation or "None",
            "recommended_option_after": winner_after,
            "confidence_before": conf_before,
            "confidence_after": conf_after,
            "score_delta": score_delta,
            "key_drivers": [
                f"Assumption modifier: {k} = {v}" for k, v in mods.items()
            ],
            "diff_explanation": diff_explanation,
            "updated_option_scores": scores_after
        }

    @staticmethod
    def record_outcome(db: Session, decision_id: int, user_id: int, data: OutcomeCreate) -> DecisionOutcome:
        outcome = DecisionOutcome(
            decision_id=decision_id,
            user_id=user_id,
            chosen_option_title=data.chosen_option_title,
            actual_outcome_notes=data.actual_outcome_notes,
            satisfaction_score=data.satisfaction_score,
            ai_accuracy_rating=data.ai_accuracy_rating
        )
        db.add(outcome)
        db.commit()
        db.refresh(outcome)
        return outcome

decision_service = DecisionService()
