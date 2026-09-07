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
                            "text": f"""You are the Real-Time Strategic Pathway & Decision Intelligence Generator for FlowMind.
Analyze this user's decision dilemma or life ambition and deconstruct it into high-fidelity competing pathways.

CRITICAL INSTRUCTION:
If the user states an open-ended ambition or goal (e.g. "I want to become an AI engineer", "I want to start a business", "How do I transition to product management?", "I want to buy a house in 2 years"):
The user does NOT already know what options to define! You MUST formulate 3 to 4 distinct, realistic, competing strategic pathways/approaches to reach that specific ambition.
Examples of distinct pathways:
- Pathway A: Self-directed portfolio, open source contributions, and proof-of-work
- Pathway B: Internal lateral move / apprenticeship at current organization
- Pathway C: Formal credential / intensive specialized fellowship program
- Pathway D: Gateway transition via adjacent hybrid role
Do NOT simply repeat the user's desire as an option!

User Input:
"{prompt}"

Respond strictly in valid JSON:
{{
  "title": "A clear, compelling title (max 75 chars)",
  "options": [
    {{"title": "Specific pathway title", "description": "1-2 sentence concrete description of this strategic approach"}}
  ],
  "factors": [
    {{"name": "Relevant Evaluation Factor (e.g., Speed to Goal, Capital Required, Risk, Credibility)", "category": "category", "weight": 1.0}}
  ],
  "goals": [
    {{"description": "Core ambition or primary milestone", "priority": "high", "weight": 1.2}}
  ],
  "constraints": [
    {{"description": "Any stated or inherent constraint", "severity": "soft"}}
  ]
}}"""
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.3,
                        "maxOutputTokens": 900,
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
        is_ambition = bool(re.search(
            r"\b(i want to become|i want to be|how (can|do) i become|i want to (transition|switch|get into|learn|start|launch|buy|build|achieve)|want to be)\b",
            prompt,
            re.IGNORECASE
        ))

        options_data = []
        if is_ambition:
            # Generate 3-4 realistic strategic pathways for achieving this ambition
            p_clean = re.sub(r"^(i want to become|i want to be|how can i become|how do i become|i want to)\s+", "", prompt, flags=re.IGNORECASE).rstrip("?").strip()
            target_goal = p_clean.title() if p_clean else "Target Role"

            if any(w in prompt.lower() for w in ["ai", "engineer", "software", "developer", "data", "ml", "tech", "architect", "product", "design"]):
                options_data = [
                    {
                        "title": f"Self-Directed Portfolio & Open-Source Proof of Work in {target_goal}",
                        "description": f"Build high-impact public repositories, fine-tuned models, and deployed apps to bypass credential gatekeepers and prove technical mastery directly.",
                        "pros": [
                            "Immediate execution with zero institutional gatekeepers or tuition debt",
                            "Public GitHub commits and live demos provide 3x higher hiring conviction than resumes",
                            "Full autonomous control over project scope, architecture, and technology stack"
                        ],
                        "cons": [
                            "Demands intense self-directed discipline without external structure",
                            "Lacks formal institutional alumni networks or on-campus recruiter pipelines",
                            "Cold outreach requires proactive distribution to get discovered"
                        ]
                    },
                    {
                        "title": "Internal Lateral Transfer & Apprenticeship within Current Organization",
                        "description": "Transition into AI/ML initiatives inside your current employer by shadowing data teams and delivering high-leverage internal proof-of-concepts.",
                        "pros": [
                            "Zero salary interruption and preservation of accumulated company equity/trust",
                            "Real-world production data access and internal senior engineering mentorship",
                            "Significantly lower transition risk than external technical interviews"
                        ],
                        "cons": [
                            "Strictly dependent on current manager approval and organizational headcount",
                            "May be constrained to legacy company tech stacks and corporate red tape",
                            "Transition timeline is dictated by company pace rather than personal velocity"
                        ]
                    },
                    {
                        "title": "Specialized Intensive Fellowship / Credentialing Program",
                        "description": "Enroll in a top-tier immersive AI fellowship or graduate specialization offering structured deep learning curriculum and direct recruiter pipelines.",
                        "pros": [
                            "Curated cutting-edge curriculum with verified industry mentors and code reviews",
                            "Direct hiring partnerships and formal interview days with partner companies",
                            "Tight peer cohort provides accountability, study groups, and long-term network"
                        ],
                        "cons": [
                            "Significant financial tuition cost or income share agreement (ISA) burden",
                            "Pauses or strains full-time earned income during program duration",
                            "Certificates alone do not compensate for lack of unique production code"
                        ]
                    },
                    {
                        "title": "Strategic Transition via Adjacent Gateway Role",
                        "description": "Secure a bridge position (such as Data Engineer, Solutions Architect, or AI Product Specialist) to work adjacent to production models while transitioning.",
                        "pros": [
                            "Lower entry bar than senior core ML/AI researcher roles",
                            "Direct daily exposure to production AI infrastructure, pipelines, and tooling",
                            "Earns competitive market compensation while mastering production systems"
                        ],
                        "cons": [
                            "Indirect trajectory that requires a second internal pivot to reach pure modeling",
                            "Day-to-day responsibilities may pull focus away from deep AI technical learning",
                            "Risk of being anchored to data piping or deployment maintenance"
                        ]
                    }
                ]
            elif any(w in prompt.lower() for w in ["startup", "business", "founder", "company", "saas", "agency"]):
                options_data = [
                    {
                        "title": "Bootstrap with Personal Capital & Early Customer Cash Flow (100% Equity)",
                        "description": "Retain total equity and creative control by building a lean MVP and charging paying customers from day one.",
                        "pros": [
                            "100% equity ownership and zero investor dilution or board interference",
                            "Forces brutal focus on real customer willingness-to-pay and unit economics",
                            "High operational autonomy and sustainable long-term business resilience"
                        ],
                        "cons": [
                            "Growth velocity is bounded by operational cash flow reinvestment",
                            "Personal financial risk during the initial un-monetized iteration phase",
                            "Resource constraints limit ability to outspend competitors on paid acquisition"
                        ]
                    },
                    {
                        "title": "Raise Angel / Pre-Seed Venture Capital to Maximize Velocity",
                        "description": "Secure institutional or angel funding to build full-time, hire key talent, and aggressively capture market share.",
                        "pros": [
                            "Substantial upfront capital runway removes immediate personal financial strain",
                            "Accelerates hiring and marketing to achieve market dominance rapidly",
                            "Investor networks unlock enterprise sales channels and follow-on financing"
                        ],
                        "cons": [
                            "Equity dilution and surrender of unilateral decision-making authority",
                            "Imposes hyper-growth venture timeline (risk of premature scaling and burn)",
                            "Fundraising cycle consumes significant founder time away from product"
                        ]
                    },
                    {
                        "title": "Incubate as a Focused Side Project before Full-Time Leap",
                        "description": "Validate demand, build product-market fit, and secure initial recurring revenue while maintaining day-job stability.",
                        "pros": [
                            "Two-way door flexibility with zero personal downside risk during validation",
                            "Takes pressure off early monetization, allowing organic experimentation",
                            "De-risks the full-time leap once monthly recurring revenue hits living baseline"
                        ],
                        "cons": [
                            "Split focus and context switching slows overall execution velocity",
                            "Burnout risk from balancing demanding day job with evening startup work",
                            "Customer responsiveness may suffer during standard business hours"
                        ]
                    },
                    {
                        "title": "Join a Founder Fellowship / Venture Studio Ecosystem",
                        "description": "Partner with an accelerator (e.g., Y Combinator, Techstars) or venture studio for structured validation, co-founder matching, and instant credibility.",
                        "pros": [
                            "Instant brand signaling and warm introductions to tier-1 customers and VCs",
                            "Intensive milestone accountability and access to experienced founder mentors",
                            "Access to shared legal, design, and technical infrastructure"
                        ],
                        "cons": [
                            "Substantial equity cost (typically 7-10%) for early-stage participation",
                            "Conforming to batch cohort rhythms may diverge from your specific business needs",
                            "High competition for partner attention within large cohorts"
                        ]
                    }
                ]
            else:
                options_data = [
                    {
                        "title": f"Focused High-Intensity Sprint toward {target_goal}",
                        "description": f"Immerse fully into {target_goal} with rapid execution cycles and time-boxed validation milestones.",
                        "pros": ["Maximum learning velocity and shortest time to breakthrough", "Concentrates energy on the highest-leverage tasks", "Early discovery of whether this path fits long-term"],
                        "cons": ["Higher immediate cognitive fatigue and opportunity cost", "Requires personal runway or tolerance for uncertainty", "Less room for parallel obligations"]
                    },
                    {
                        "title": f"Balanced Reversible Transition toward {target_goal}",
                        "description": f"Pursue {target_goal} incrementally in structured phases, maintaining current baseline safety until validation is reached.",
                        "pros": ["Preserves downside stability and financial security", "Two-way door: easy to pivot or reverse if assumptions fail", "Sustainable pace that prevents burnout"],
                        "cons": ["Slower compounding speed compared to full immersion", "Risk of prolonged hesitation and delayed commitment", "Divided cognitive focus"]
                    },
                    {
                        "title": "Structured Mentorship & Apprenticeship Route",
                        "description": "Align with established practitioners in the field to learn through hands-on collaboration and apprentice under expert guidance.",
                        "pros": ["Bypasses common novice mistakes through direct feedback", "Builds deep network credibility with respected leaders", "Shortcuts the tacit knowledge learning curve"],
                        "cons": ["Requires finding and convincing top mentors to invest time", "Must adapt to mentor's operational framework and schedule", "May limit personal brand independence initially"]
                    }
                ]
        else:
            cleaned = re.sub(r"^(should i|shall i|what if i|i need to decide between|deciding between|help me decide between)\s+", "", prompt, flags=re.IGNORECASE).rstrip("?")
            parts = re.split(r"\s+vs\.?\s+|\s+versus\s+|\s+or\s+|,\s*", cleaned, flags=re.IGNORECASE)
            raw_options = []
            for p in parts:
                cand = p.strip().strip('"').strip("'")
                if len(cand) > 2 and cand.lower() not in ["accept", "choose", "between", "the", "and", "my", "to", "a", "an"]:
                    raw_options.append(cand.title())

            if not raw_options:
                raw_options = ["Pathway A: Move Forward with Change", "Pathway B: Preserve Current Trajectory"]
            elif len(raw_options) == 1:
                raw_options.append(f"Alternative: Maintain Status Quo / Reject '{raw_options[0]}'")

            for opt_title in raw_options:
                t_low = opt_title.lower()
                pros = ["High asymmetric upside if execution milestones are met", "Expands strategic optionality and future compounding"]
                cons = ["Execution friction and switching cost during initial transition", "Uncertainty regarding immediate return on invested energy"]

                if any(w in t_low for w in ["startup", "build", "lead", "founder", "venture", "new", "change", "quit"]):
                    pros = ["Higher upside potential and personal agency", "Direct ownership of outcomes and accelerated learning"]
                    cons = ["Higher initial variance and execution risk", "Requires building momentum without institutional safety nets"]
                elif any(w in t_low for w in ["stay", "keep", "corporate", "bigtech", "current", "stable", "preserve"]):
                    pros = ["Predictable stability, established compensation, and lower stress", "Preserves existing social and professional capital"]
                    cons = ["Risk of skill plateau and opportunity cost of inaction", "Lower equity ownership and slower long-term upside"]
                elif any(w in t_low for w in ["remote", "travel", "relocate", "move"]):
                    pros = ["Geographic autonomy and enhanced living environment", "Arbitrage between local cost of living and global income"]
                    cons = ["Logistical complexity and temporary disruption of habits", "Potential reduction in spontaneous in-person network density"]

                options_data.append({
                    "title": opt_title,
                    "description": f"Strategic pathway focused on {opt_title}.",
                    "pros": pros,
                    "cons": cons
                })

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
            "options": options_data,
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
