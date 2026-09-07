import httpx
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
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

        # Add Options (if none provided, parse real-time options from context/title)
        if not data.options:
            parsed = orchestrator.parse_quick_prompt(data.context or data.title)
            for opt in parsed.get("options", []):
                db.add(DecisionOption(
                    decision_id=decision.id,
                    title=opt["title"],
                    description=opt.get("description", "")
                ))
            if not data.factors and parsed.get("factors"):
                for f in parsed["factors"]:
                    db.add(DecisionFactor(
                        decision_id=decision.id,
                        name=f["name"],
                        category=f["category"],
                        weight=f["weight"]
                    ))
            if not data.goals and parsed.get("goals"):
                for g in parsed["goals"]:
                    db.add(Goal(
                        decision_id=decision.id,
                        description=g["description"],
                        priority=g["priority"],
                        weight=g["weight"]
                    ))
            if not data.constraints and parsed.get("constraints"):
                for c in parsed["constraints"]:
                    db.add(Constraint(
                        decision_id=decision.id,
                        description=c["description"],
                        severity=c["severity"]
                    ))
        else:
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
    async def challenge_decision(db: Session, decision_id: int, req: ChallengeRequest) -> Dict[str, Any]:
        """Executes adversarial challenge: attacks recommendation, stress tests assumptions, recalculates confidence."""
        decision = db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            raise ValueError("Decision not found")

        original_confidence = decision.confidence_score or 82.0
        target = req.target_recommendation or decision.recommendation or (
            decision.options[0].title if decision.options else "Primary Recommendation"
        )
        focus = req.focus_area or "Worst-Case Downside Risk & Fragility"
        alt = decision.alternative_recommendation or (
            next((o.title for o in decision.options if o.title != target), "Alternative Pathway")
        )

        goals_text = ", ".join([f"{g.description} ({g.priority})" for g in decision.goals]) if decision.goals else "General optimization"
        constraints_text = ", ".join([f"{c.description} [{c.severity}]" for c in decision.constraints]) if decision.constraints else "None defined"

        # Context-aware default values
        recalculated_confidence = round(max(40.0, original_confidence - 14.5), 1)
        delta = round(recalculated_confidence - original_confidence, 1)
        attack_vector = focus
        fragility_verdict = "Moderately Sensitive"

        vulnerabilities = [
            f"Over-reliance on near-term stability in '{target}', discounting unexpected market or execution shocks.",
            f"Unproven assumption that '{target}' provides superior compounding advantage over '{alt}'.",
            f"High friction and lock-in switching costs if circumstances force a reversal within 12 months."
        ]

        critique = (
            f"Adversarial Stress-Test ({focus}): Committing to '{target}' leaves you exposed if baseline conditions shift. "
            f"While '{target}' scores highest under current optimism, it underweights critical friction points and downside volatility. "
            f"If execution bottlenecks arise, '{alt}' offers significantly higher asymmetric resilience and lower catastrophic downside. "
            f"Confidence downgraded from {original_confidence}% to {recalculated_confidence}%."
        )

        # Attempt Gemini 1.5 Flash adversarial reasoning
        if settings.GEMINI_API_KEY:
            try:
                adversarial_prompt = f"""You are the Red Team Devil's Advocate for FlowMind Decision Intelligence.
Your role is to rigorously stress-test and interrogate the user's favored recommendation with intellectual brutality, sharp clarity, and contrarian logic. Expose hidden confirmation bias and fragile assumptions.

Decision Context:
- Dilemma Title: {decision.title}
- Context: {decision.context}
- Target Recommendation Under Attack: {target}
- Secondary / Alternative Option: {alt}
- Stated Goals: {goals_text}
- Stated Constraints: {constraints_text}
- User's Chosen Attack Angle: {focus}

Requirements:
1. Attack the recommendation "{target}" directly on the chosen attack angle "{focus}".
2. Expose 3 specific, non-trivial vulnerable assumptions that could cause this decision to fail or produce regret.
3. Write a potent 2-3 sentence Devil's Advocate critique explaining why "{alt}" or another path might be safer or offer better asymmetric payoff if things go wrong.
4. Assess fragility verdict as one of: "Moderately Sensitive", "Fragile Under Stress", or "Critically Fragile".
5. Recommend a confidence haircut percentage between 10.0 and 22.0.

Respond strictly in valid JSON format:
{{
  "critique": "A sharp, persuasive counter-argument.",
  "vulnerabilities": [
    "First vulnerable assumption or hidden risk",
    "Second vulnerable assumption or hidden risk",
    "Third vulnerable assumption or hidden risk"
  ],
  "fragility_verdict": "Moderately Sensitive",
  "confidence_haircut": 14.0
}}"""

                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": adversarial_prompt}]}],
                    "generationConfig": {
                        "temperature": 0.45,
                        "maxOutputTokens": 800,
                        "responseMimeType": "application/json"
                    }
                }
                async with httpx.AsyncClient(timeout=14.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
                            parsed = json.loads(raw_text)
                            if "critique" in parsed and "vulnerabilities" in parsed:
                                critique = parsed["critique"]
                                vulnerabilities = parsed["vulnerabilities"][:4]
                                fragility_verdict = parsed.get("fragility_verdict", fragility_verdict)
                                haircut = float(parsed.get("confidence_haircut", 14.0))
                                recalculated_confidence = round(max(35.0, original_confidence - haircut), 1)
                                delta = round(recalculated_confidence - original_confidence, 1)
            except Exception as e:
                print(f"[DecisionService] Gemini challenge error: {e}")

        challenge_entry = {
            "timestamp": str(decision.updated_at),
            "target": target,
            "original_confidence": original_confidence,
            "recalculated_confidence": recalculated_confidence,
            "delta": delta,
            "critique": critique,
            "focus_area": focus
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
            "attack_vector": attack_vector,
            "devil_advocate_critique": critique,
            "alternative_scenario": f"Pivot conviction toward '{alt}' if downside risks of '{target}' materialize.",
            "fragility_verdict": fragility_verdict
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
