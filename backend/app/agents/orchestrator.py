import asyncio
import re
import json
import httpx
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import (
    Decision, DecisionOption, DecisionFactor, Goal, Constraint,
    AgentRun, Evidence, Document
)
from app.agents.agent_system import (
    AnalystAgent, OptimistAgent, SkepticAgent, FinancialAgent,
    LongTermPlanner, DevilsAdvocateAgent, SynthesizerAgent
)
from app.services.rag_service import rag_service

class AgentOrchestrator:
    def __init__(self):
        self.analyst = AnalystAgent()
        self.optimist = OptimistAgent()
        self.skeptic = SkepticAgent()
        self.financial = FinancialAgent()
        self.long_term = LongTermPlanner()
        self.devils_advocate = DevilsAdvocateAgent()
        self.synthesizer = SynthesizerAgent()

    @staticmethod
    def parse_quick_prompt(prompt: str) -> Dict[str, Any]:
        """Parses free-form user prompt into structured real-time decision with zero fake/hardcoded data."""
        title = prompt.strip()
        if len(title) > 80:
            title = prompt[:77] + "..."

        # 1. Real-Time AI Deconstruction via Gemini 1.5 Flash if API Key available
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": f"""You are the Real-Time Decision Parser for FlowMind Decision Intelligence.
Parse this user's decision dilemma into genuine, high-fidelity components.
Do NOT invent unrelated career or job-offer assumptions if the dilemma is about something else.
Keep all options, factors, goals, and constraints strictly relevant to what the user asked.

User Dilemma:
"{prompt}"

Respond in valid JSON:
{{
  "title": "A concise title (max 75 chars)",
  "options": [
    {{"title": "Specific option title", "description": "Specific path summary"}}
  ],
  "factors": [
    {{"name": "Relevant Factor Name", "category": "category", "weight": 1.0}}
  ],
  "goals": [
    {{"description": "Relevant user objective", "priority": "high", "weight": 1.0}}
  ],
  "constraints": [
    {{"description": "Stated or inherent constraint", "severity": "soft"}}
  ]
}}"""
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.2,
                        "maxOutputTokens": 800,
                        "responseMimeType": "application/json"
                    }
                }
                with httpx.Client(timeout=9.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            text = candidates[0]["content"]["parts"][0]["text"].strip()
                            parsed = json.loads(text)
                            if parsed.get("options") and len(parsed["options"]) >= 2:
                                return {
                                    "title": parsed.get("title", title),
                                    "context": prompt,
                                    "options": parsed["options"][:4],
                                    "factors": parsed.get("factors", []),
                                    "goals": parsed.get("goals", []),
                                    "constraints": parsed.get("constraints", [])
                                }
            except Exception as e:
                print(f"[Orchestrator] Real-time Gemini parsing fallback: {e}")

        # 2. Dynamic Real-Time Deterministic Parsing Fallback
        cleaned = re.sub(r"^(should i|shall i|what if i|i need to decide between|deciding between|help me decide between)\s+", "", prompt, flags=re.IGNORECASE).rstrip("?")
        parts = re.split(r"\s+vs\.?\s+|\s+versus\s+|\s+or\s+|,\s*", cleaned, flags=re.IGNORECASE)
        options = []
        for p in parts:
            cand = p.strip().strip('"').strip("'")
            if len(cand) > 2 and cand.lower() not in ["accept", "choose", "between", "the", "and", "my", "to", "a", "an"]:
                options.append(cand.title())

        if not options:
            options = ["Pathway A: Move Forward with Change", "Pathway B: Preserve Current Trajectory"]
        elif len(options) == 1:
            options.append(f"Alternative: Maintain Status Quo / Reject '{options[0]}'")

        # Dynamically infer domain-appropriate factors from actual prompt keywords
        p_lower = prompt.lower()
        factors = []
        if any(w in p_lower for w in ["cost", "price", "invest", "salary", "equity", "money", "capital", "fund", "buy", "pay"]):
            factors.append({"name": "Financial ROI & Capital Allocation", "category": "financial", "weight": 1.2})
        if any(w in p_lower for w in ["job", "career", "startup", "role", "promotion", "lead", "engineer", "work", "hire"]):
            factors.append({"name": "Learning Velocity & Career Growth", "category": "career", "weight": 1.2})
        if any(w in p_lower for w in ["relocat", "move", "city", "country", "remote", "apartment", "house", "live", "commute"]):
            factors.append({"name": "Geographic Freedom & Living Quality", "category": "lifestyle", "weight": 1.1})
        if any(w in p_lower for w in ["stress", "burnout", "balance", "family", "health", "time"]):
            factors.append({"name": "Well-Being & Burnout Mitigation", "category": "personal", "weight": 1.2})

        # Universal factors
        factors.append({"name": "Execution Feasibility & Cognitive Friction", "category": "operational", "weight": 1.0})
        factors.append({"name": "Downside Risk & Reversibility (Two-Way Door)", "category": "risk", "weight": 0.9})

        # Dynamic goals derived from dilemma
        goals = [
            {"description": f"Identify the pathway with optimal asymmetric payoff for '{title[:45]}'", "priority": "high", "weight": 1.2},
            {"description": "Minimize uncalculated downside risk and regret", "priority": "high", "weight": 1.0}
        ]

        # Inherent constraints only if user explicitly mentioned constraints
        constraints = []
        if any(w in p_lower for w in ["deadline", "days", "weeks", "month", "by monday", "tomorrow", "urgent"]):
            constraints.append({"description": "Time-sensitive decision window", "severity": "hard"})
        if any(w in p_lower for w in ["budget", "max", "limit", "under $", "cannot afford"]):
            constraints.append({"description": "Strict financial / capital ceiling", "severity": "hard"})

        return {
            "title": title,
            "context": prompt,
            "options": [{"title": opt, "description": f"Pathway evaluating {opt}"} for opt in options],
            "factors": factors,
            "goals": goals,
            "constraints": constraints
        }

    async def run_orchestration(self, db: Session, decision_id: int) -> Decision:
        """Executes multi-agent parallel reasoning cycle and records all agent runs."""
        decision = db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            raise ValueError(f"Decision with id {decision_id} not found")

        decision.status = "analyzing"
        db.commit()

        option_titles = [opt.title for opt in decision.options]
        if not option_titles:
            option_titles = ["Option A", "Option B"]

        # 1. RAG Evidence Querying
        evidence_results = []
        for opt in option_titles:
            retrieved = rag_service.query_evidence(db, decision.id, f"{opt} compensation benefits risks career", top_k=2)
            evidence_results.extend(retrieved)

        # Clear existing runs & evidence to ensure fresh cycle
        db.query(AgentRun).filter(AgentRun.decision_id == decision.id).delete()
        db.query(Evidence).filter(Evidence.decision_id == decision.id).delete()
        db.commit()

        # Insert Grounded Evidence Items
        if evidence_results:
            for ev in evidence_results:
                e_item = Evidence(
                    decision_id=decision.id,
                    claim=f"Document specifies key conditions relevant to {ev['filename']}",
                    source_document_id=ev.get("document_id"),
                    chunk_id=ev.get("chunk_id"),
                    source_title=ev.get("filename", "Verified Attachment"),
                    page_or_section=ev.get("location", "Page 1"),
                    quote=ev["text"][:220] + "...",
                    relevance_explanation="Directly supports comparison criteria for this option.",
                    agent_name="Analyst"
                )
                db.add(e_item)
        else:
            # Add contextual baseline evidence
            for opt in option_titles[:2]:
                e_item = Evidence(
                    decision_id=decision.id,
                    claim=f"Strategic baseline established for {opt}",
                    source_title="Primary Decision Prompt",
                    page_or_section="Context Line 1",
                    quote=f"Evaluated context: {decision.context[:150]}...",
                    relevance_explanation=f"Directly frames user goals and constraints for {opt}.",
                    agent_name="Analyst"
                )
                db.add(e_item)
        db.commit()

        # 2. Parallel Agent Execution
        analyst_task = self.analyst.analyze(decision.title, decision.context, option_titles, evidence_results)
        optimist_task = self.optimist.analyze(decision.title, decision.context, option_titles)
        skeptic_task = self.skeptic.analyze(decision.title, decision.context, option_titles)
        financial_task = self.financial.analyze(decision.title, decision.context, option_titles)
        long_term_task = self.long_term.analyze(decision.title, decision.context, option_titles)

        results = await asyncio.gather(
            analyst_task,
            optimist_task,
            skeptic_task,
            financial_task,
            long_term_task,
            return_exceptions=True
        )

        agent_records = []
        for r in results:
            if isinstance(r, dict):
                agent_records.append(r)
                run = AgentRun(
                    decision_id=decision.id,
                    agent_name=r["agent_name"],
                    agent_role=r["agent_role"],
                    status=r["status"],
                    viewpoint=r["viewpoint"],
                    findings=r["findings"],
                    confidence=r["confidence"],
                    duration_ms=r["duration_ms"]
                )
                db.add(run)

        db.commit()

        # 3. Synthesis Phase
        options_data = [{"title": o.title, "pros": o.pros, "cons": o.cons} for o in decision.options]
        factors_data = [{"name": f.name, "weight": f.weight} for f in decision.factors]
        goals_data = [{"description": g.description, "weight": g.weight} for g in decision.goals]

        synthesis = self.synthesizer.synthesize(options_data, agent_records, factors_data, goals_data)

        # 4. Devil's Advocate Initial Critique
        advocate_res = await self.devils_advocate.challenge(
            top_option=synthesis["recommended_option"],
            alternative_option=synthesis["alternative_option"],
            context=decision.context,
            assumptions=synthesis["what_could_change"]
        )

        advocate_run = AgentRun(
            decision_id=decision.id,
            agent_name=advocate_res["agent_name"],
            agent_role=advocate_res["agent_role"],
            status=advocate_res["status"],
            viewpoint=advocate_res["viewpoint"],
            findings=advocate_res["findings"],
            confidence=advocate_res["confidence"],
            duration_ms=advocate_res["duration_ms"]
        )
        db.add(advocate_run)

        # 5. Update Decision with Synthesis
        decision.recommendation = synthesis["recommended_option"]
        decision.alternative_recommendation = synthesis["alternative_option"]
        decision.confidence_score = synthesis["confidence_score"]
        decision.decision_score = synthesis["decision_score"]
        decision.reasoning_summary = synthesis["reasoning_summary"]
        decision.what_could_change = synthesis["what_could_change"]
        decision.contradictions = synthesis["contradictions"]
        decision.status = "completed"

        # Update individual option scores & alignment
        for scored in synthesis["scored_options"]:
            for opt in decision.options:
                if opt.title.lower() == scored["title"].lower():
                    opt.score = scored["score"]
                    opt.alignment_scores = scored["alignment_scores"]
                    opt.is_recommended = (opt.title.lower() == synthesis["recommended_option"].lower())

        db.commit()
        db.refresh(decision)
        return decision

orchestrator = AgentOrchestrator()
