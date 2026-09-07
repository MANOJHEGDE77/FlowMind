import asyncio
import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
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
        """Parses free-form prompt like 'Should I accept Job A, Job B, or pursue higher studies?' into structured decision."""
        title = prompt.strip()
        if len(title) > 80:
            title = prompt[:77] + "..."
        
        # Extract potential options using regex or commas/'or'
        options = []
        cleaned = re.sub(r"^(should i|shall i|what if i|i need to decide between|deciding between)\s+", "", prompt, flags=re.IGNORECASE).rstrip("?")
        parts = re.split(r",\s*|\s+or\s+", cleaned, flags=re.IGNORECASE)
        for p in parts:
            cand = p.strip().strip('"').strip("'")
            if len(cand) > 2 and cand.lower() not in ["accept", "choose", "between", "the", "and"]:
                options.append(cand.title())
        
        if not options:
            options = ["Option A: Accept Offer", "Option B: Continue Search", "Option C: Alternative Path"]
        elif len(options) == 1:
            options.append("Alternative Route")

        return {
            "title": title,
            "context": prompt,
            "options": [{"title": opt, "description": f"Pathway evaluating {opt}"} for opt in options],
            "factors": [
                {"name": "Career Growth & Velocity", "category": "career", "weight": 1.2},
                {"name": "Financial Compensation & Equity", "category": "financial", "weight": 1.0},
                {"name": "Autonomy & Work Culture", "category": "personal", "weight": 0.9},
                {"name": "Downside Risk & Volatility", "category": "risk", "weight": 0.8}
            ],
            "goals": [
                {"description": "Maximize long-term compounding career capital", "priority": "high", "weight": 1.2},
                {"description": "Maintain financial resilience and liquidity", "priority": "medium", "weight": 1.0}
            ],
            "constraints": [
                {"description": "Decision must be finalized within 2 weeks", "severity": "hard"},
                {"description": "Must preserve work-life balance sustainability", "severity": "soft"}
            ]
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
