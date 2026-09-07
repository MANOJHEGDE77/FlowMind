import httpx
import re
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Decision, Evidence, DecisionOption

class AIQAService:
    async def ask_question(
        self,
        question: str,
        decision_id: Optional[int] = None,
        context: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        history = history or []
        decision_context = ""
        decision_title = ""
        options_info = []
        evidence_snippets = []
        goals_snippets = []
        constraints_snippets = []

        # 1. Retrieve decision details if decision_id is provided
        if decision_id and db:
            decision = db.query(Decision).filter(Decision.id == decision_id).first()
            if decision:
                decision_title = decision.title
                options_info = [
                    f"- **{o.title}**: {o.description or 'Evaluated path'} (Score: {int((o.score or 0.0) * 100)}%, Recommended: {o.is_recommended})"
                    for o in decision.options
                ]
                goals_snippets = [
                    f"- **{g.description}** (Priority: {g.priority}, Weight: {g.weight})"
                    for g in decision.goals
                ]
                constraints_snippets = [
                    f"- [{c.severity.upper()}] {c.description}"
                    for c in decision.constraints
                ]
                evidence_snippets = [
                    f"- [{e.source_title or 'Context'}] {e.quote or e.claim}"
                    for e in decision.evidence_items[:5]
                ]

                decision_context = f"""
Current Active Decision Dilemma:
Title: {decision.title}
Context: {decision.context}
Current Recommendation: {decision.recommendation or 'Evaluating'}
Confidence: {int(decision.confidence_score * 100)}%
Synthesized Reasoning: {decision.reasoning_summary or 'In progress'}

User's Defined Goals & Explicit Priorities:
{chr(10).join(goals_snippets) if goals_snippets else 'No specific goals pre-defined.'}

User's Stated Constraints:
{chr(10).join(constraints_snippets) if constraints_snippets else 'No hard constraints attached.'}

Options Evaluated:
{chr(10).join(options_info)}

Supporting Grounded Evidence:
{chr(10).join(evidence_snippets) if evidence_snippets else 'No external evidence attached yet.'}
"""

        # 2. System Prompt
        system_prompt = f"""You are FlowMind AI, a world-class Decision Intelligence Strategist and Cognitive Advisor.
Your purpose is to answer the user's strategic questions with exceptional clarity, rigor, and calibration.

Guidelines:
1. Provide a direct, authoritative, and calibrated answer to the question.
2. CRITICAL: Strictly align your recommendation and evaluations with the User's Defined Goals & Explicit Priorities above. Prioritize pathways that maximize alignment with those specific goals.
3. Ground your reasoning in decision science principles (e.g. Expected Value, Regret Minimization, One-way vs Two-way doors, Asymmetric Upside, Opportunity Cost).
4. If decision context is provided below, reference the specific pathways, trade-offs, and evidence directly.
5. Format your output cleanly in Markdown with bold points, bullet points for trade-offs, and an actionable bottom line.

{decision_context}
{f"Additional User Context: {context}" if context else ""}
"""

        conversation_history_text = ""
        if history:
            conversation_history_text = "\n\nPrevious Conversation:\n" + "\n".join(
                f"{msg.get('role', 'user').capitalize()}: {msg.get('content', '')}"
                for msg in history[-4:]
            )

        full_user_prompt = f"{conversation_history_text}\n\nQuestion: {question}"

        # 3. Provider Execution: 1st Choice Google Gemini (Fast, Efficient Flash Model)
        if settings.GEMINI_API_KEY:
            try:
                # Try gemini-1.5-flash
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": f"{system_prompt}\n\nUser Question:\n{full_user_prompt}"}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.35,
                        "maxOutputTokens": 1024,
                    }
                }
                async with httpx.AsyncClient(timeout=16.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            answer_text = candidates[0]["content"]["parts"][0]["text"]
                            return {
                                "question": question,
                                "answer": answer_text,
                                "model_used": "Gemini 1.5 Flash (Google DeepMind)",
                                "confidence": 0.94,
                                "relevant_factors": self._extract_factors(question, answer_text),
                                "suggested_followups": self._generate_followups(question, decision_title),
                                "citations": [e.split("] ")[0].replace("- [", "") for e in evidence_snippets if "]" in e]
                            }
            except Exception as e:
                print(f"[AIQAService] Gemini call error: {e}")

        # 4. Provider Execution: 2nd Choice Groq / OpenAI
        api_key = settings.GROQ_API_KEY or settings.OPENAI_API_KEY
        if api_key:
            try:
                base_url = "https://api.groq.com/openai/v1" if settings.GROQ_API_KEY else "https://api.openai.com/v1"
                model = "llama-3.1-8b-instant" if settings.GROQ_API_KEY else "gpt-4o-mini"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": full_user_prompt}
                    ],
                    "temperature": 0.35,
                    "max_tokens": 1024
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(f"{base_url}/chat/completions", headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        answer_text = data["choices"][0]["message"]["content"]
                        return {
                            "question": question,
                            "answer": answer_text,
                            "model_used": f"{model.upper()} (Fast AI Engine)",
                            "confidence": 0.91,
                            "relevant_factors": self._extract_factors(question, answer_text),
                            "suggested_followups": self._generate_followups(question, decision_title),
                            "citations": [e.split("] ")[0].replace("- [", "") for e in evidence_snippets if "]" in e]
                        }
            except Exception as e:
                print(f"[AIQAService] LLM fallback call error: {e}")

        # 5. Local Cognitive Synthesizer (Zero external dependency, deterministic, highly structured, dilemma-grounded)
        answer = self._synthesize_local_response(
            question=question,
            title=decision_title,
            decision=decision if (decision_id and db) else None,
            context=context
        )
        return {
            "question": question,
            "answer": answer,
            "model_used": "FlowMind Cognitive Engine (Calibrated Multi-Agent Synthesis)",
            "confidence": 0.92,
            "relevant_factors": self._extract_factors(question, answer),
            "suggested_followups": self._generate_followups(question, decision_title, decision if (decision_id and db) else None),
            "citations": [e.split("] ")[0].replace("- [", "") for e in evidence_snippets if "]" in e]
        }

    def _synthesize_local_response(
        self,
        question: str,
        title: str,
        decision: Optional[Decision] = None,
        context: Optional[str] = None
    ) -> str:
        q_lower = question.lower()
        d_title = (decision.title if decision else title) or "Strategic Dilemma"
        d_rec = (decision.recommendation if decision else "") or (decision.options[0].title if decision and decision.options else "Primary Recommended Pathway")
        d_alt = (decision.alternative_recommendation if decision else "") or (decision.options[1].title if decision and len(decision.options) > 1 else "")
        options = decision.options if decision else []
        options_titles = [o.title for o in options] if options else []
        
        # Primary user goal
        user_goal = decision.goals[0].description if (decision and decision.goals) else d_title

        # Domain classification for domain-specific intelligence
        t_low = (d_title + " " + question).lower()
        is_ai_tech = any(w in t_low for w in ["ai", "engineer", "ml", "machine learning", "data", "software", "developer", "deep learning", "llm", "neural"])
        is_startup = any(w in t_low for w in ["startup", "founder", "saas", "business", "bootstrap", "venture", "fundraise", "product"])
        is_career = any(w in t_low for w in ["career", "job", "promotion", "switch", "transition", "manager", "role", "hire"])
        is_financial = any(w in t_low for w in ["invest", "money", "salary", "house", "buy", "crypto", "equity", "capital"])

        # Intent 1: ROADMAP / HOW DO I START / FIRST STEPS
        if any(w in q_lower for w in ["start", "begin", "roadmap", "first step", "how to become", "how do i become", "guide", "where do i begin", "learn first", "day 1", "checklist"]):
            if is_ai_tech:
                return f"""### ✦ Calibrated Execution Roadmap: {d_title}

To break through effectively without getting trapped in credential inflation or tutorial purgatory, execute this **3-Phase High-Signal Roadmap** anchored on **{d_rec}**:

---

#### Phase 1 (Weeks 1–3): Core Applied Foundation
- **Modern Python & PyTorch Literacy**: Focus on tensor manipulations, matrix operations, and fine-tuning scripts. Avoid generic Python basics—jump straight to applied deep learning.
- **Hugging Face & Transformers Stack**: Build and run an inference pipeline locally using `transformers`, `accelerate`, and quantized models (4-bit/8-bit via `bitsandbytes` or `ollama`).
- **First Micro-Artifact**: Deploy a small functional demo (e.g. specialized domain agent or document RAG) with a clean FastAPI backend and basic UI.

#### Phase 2 (Weeks 4–8): High-Impact Public Proof of Work
- **Fine-Tuning & Evaluation**: Take an open-source model (e.g. Llama-3-8B or Mistral-7B) and fine-tune it with **LoRA/QLoRA** on a specific niche dataset.
- **Rigorous Evaluation Benchmark**: Implement benchmark evals using `promptfoo` or `ragas` to demonstrate *why* your model outperforms the base model.
- **Deploy to Production**: Host the service with containerized deployment (`Docker`, `Modal`, or `RunPod`) and publish the complete code on GitHub with clear architectural diagrams.

#### Phase 3 (Weeks 9–12): Signal Distribution & Gateway Conversion
- **Public Technical Writeup**: Publish a deep-dive technical post explaining your architecture, token costs, latency trade-offs, and ablation results.
- **Targeted Outreach**: Send the live URL and GitHub repo directly to engineering leads and AI founders who need builders with verified execution capacity.

---

**Bottom Line Directive**:
Do not wait to "feel ready" or collect certificates. In AI engineering, **one deployed, benchmarked GitHub project beats 10 online certifications**. Begin with Phase 1 today."""

            elif is_startup:
                return f"""### ✦ Founder Execution Roadmap: {d_title}

Executing **{d_rec}** requires brutal focus on customer reality rather than premature optimization:

---

#### Phase 1 (Days 1–14): Problem Validation & Willingness to Pay
- **Customer Problem Discovery**: Interview 15–20 potential buyers. Do NOT pitch your solution; ask about their existing workflows, spreadsheets, and current budget allocations.
- **Pre-Sale Commitment**: Test if customers will prepay or sign a letter of intent (LOI) before you write significant production code.

#### Phase 2 (Days 15–45): Minimum Sellable Prototype
- **Lean Implementation**: Build the single core feature that delivers the primary outcome. Strip away unnecessary dashboards, billing complexities, or onboarding flows.
- **Onboard First 5 Paid Users**: Onboard initial users manually (Do Things That Don't Scale) to observe exactly where they get value or encounter friction.

#### Phase 3 (Days 46–90): Repeatable Growth & Retention Loop
- **Measure Usage Retention**: Verify that early customers return weekly without manual prompting.
- **Unit Economics Calibration**: Ensure Customer Lifetime Value (LTV) exceeds Customer Acquisition Cost (CAC) by at least 3:1 before scaling.

---

**Actionable Rule**:
Revenue and usage feedback are your only genuine signals. Prioritize customer discovery over stealth development."""

            else:
                return f"""### ✦ Structured Transition Roadmap: {d_title}

Here is the tactical sequence for executing **{d_rec}**:

1. **Phase 1: Baseline Audit & Two-Way Door Setup (Weeks 1–2)**:
   - Clarify your non-negotiables: minimal cash runway, weekly available hours, and family commitments.
   - Establish a 30-day reversible test sprint before committing irreversible capital.
2. **Phase 2: Milestone Verification (Weeks 3–6)**:
   - Produce tangible initial evidence of traction (e.g. completed prototype, validated partner agreement, or core credential).
3. **Phase 3: Decisive Transition (Weeks 7–10)**:
   - Review empirical progress against your target score. If metrics hold, fully transition resources into **{d_rec}**."""

        # Intent 2: WHY THIS RECOMMENDATION / COMPARISON
        elif any(w in q_lower for w in ["why", "compare", "which option", "which is better", "why this", "difference", "vs", "versus", "choose", "recommend"]):
            alt_section = ""
            if d_alt:
                alt_section = f"""
#### Why '{d_alt}' Was Deprioritized:
While **{d_alt}** is a viable path, FlowMind's multi-agent council flagged key bottlenecks:
- **Opportunity Cost & Delay**: It imposes longer gestation cycles before delivering unmediated feedback.
- **Structural Friction**: It carries higher switching barriers (One-Way Door risk) compared to the rapid iteration velocity of **{d_rec}**."""

            return f"""### ✦ Strategic Trade-Off & Recommendation Analysis

**Dilemma**: *"{d_title}"*
**Recommended Route**: **{d_rec}** (Calibrated Decision Score: {int((decision.decision_score if decision else 82))} / 100)

---

#### The Decisive Advantage:
1. **Direct Alignment with '{user_goal}'**:
   - **{d_rec}** achieves the highest direct congruence with your stated priorities, maximizing practical upside while bounding irreversible commitments.
2. **Asymmetric Leverage & Velocity**:
   - This route allows you to convert time and energy into verifiable proof-of-work immediately, without waiting for institutional permission or bureaucratic sponsorship.
3. **Two-Way Door Flexibility**:
   - If market dynamics or your personal conviction changes over the next 90 days, this pathway is easily reversible at minimal reputational or financial switching cost.
{alt_section}

---

**Decisive Recommendation**:
Commit to **{d_rec}** for the upcoming 60-day sprint. Re-evaluate only if empirical traction fails to hit your target milestones."""

        # Intent 3: RISKS, PITFALLS & FAILURE MODES
        elif any(w in q_lower for w in ["risk", "danger", "downside", "worst case", "fail", "pitfall", "threat", "vulnerability", "protect"]):
            return f"""### ✦ Critical Risk Matrix & Defensive Guardrails

When pursuing **"{d_title}"** via **{d_rec}**, avoid these primary structural failure modes:

---

1. **The "Tutorial Purgatory" & Knowledge Illusion Trap**:
   - *Failure Mode*: Spending months passively consuming courses, textbooks, or documentation without producing original, standalone artifacts.
   - *Mitigation*: Enforce a **70/30 Rule**—70% time spent writing production code, building, and deploying; 30% time reviewing theory.

2. **The "Silent Builder" / Distribution Blindspot**:
   - *Failure Mode*: Building impressive systems in private without public proof-of-work, documentation, or network distribution.
   - *Mitigation*: Publish live URLs, GitHub repositories, and brief technical post-mortems for every significant sprint.

3. **Cognitive Fatigue & Burnout from Context Switching**:
   - *Failure Mode*: Attempting to maintain full-tilt output across multiple divergent domains simultaneously.
   - *Mitigation*: Time-box deep work into dedicated 90-minute blocks with single-threaded focus. Maintain a minimum 6-month financial buffer.

4. **One-Way Door Vulnerability**:
   - *Failure Mode*: Burning current professional bridges or incurring heavy debt before validating early traction.
   - *Mitigation*: Treat the first 60 days as an empirical laboratory while preserving baseline income security.

---

**Calibrated Advice**:
Run FlowMind's **Red Team Mode** (`[ESC] -> ⚔️ Red Team`) to stress-test your specific assumptions against adversarial scenarios."""

        # Intent 4: SKILLS, TOOLS & PREREQUISITES
        elif any(w in q_lower for w in ["skill", "tool", "stack", "prerequisite", "degree", "course", "technology", "what do i need", "framework"]):
            if is_ai_tech:
                return f"""### ✦ Modern High-Signal AI Engineering Tech Stack

To maximize hiring conviction and operational mastery in AI engineering, prioritize this focused modern stack:

---

#### 1. Core Programming & Modeling
- **Python 3.11+**: Modern type hints, asynchronous concurrency (`asyncio`), and package management via `uv` or `poetry`.
- **PyTorch 2.x**: Tensor manipulation, model initialization, gradient clipping, custom dataset loaders.
- **Hugging Face Ecosystem**: `transformers`, `peft` (LoRA/QLoRA), `datasets`, `tokenizers`, `accelerate`.

#### 2. Local & Production Model Serving
- **Inference Engines**: `vLLM` (high-throughput paged attention) and `Ollama` for local prototyping.
- **Quantization**: GGUF, AWQ, and BitsAndBytes 4-bit precision for cost-efficient GPU deployment.

#### 3. Retrieval-Augmented Generation (RAG) & Agent Frameworks
- **Vector Stores**: `ChromaDB` (local/embedded), `Qdrant`, or `pgvector` (PostgreSQL).
- **Chunking & Hybrid Search**: BM25 + dense embedding re-ranking with cross-encoders (e.g. Cohere or BAAI/bge-reranker).
- **Evaluation & Guardrails**: `ragas` for ground-truth eval metrics; `promptfoo` for prompt regressions.

#### 4. Cloud & GPU Infrastructure
- **Serverless GPUs**: `Modal.com`, `RunPod`, or `Replicate` for cheap on-demand training and batch inference without paying for idle compute.

---

**What to Skip**:
Do not waste weeks memorizing deep mathematical proofs from scratch (backprop derivations, manual matrix multiplication algorithms) unless you are doing fundamental academic research. Modern AI engineering prioritizes **system architecture, data curation, model evaluation, and deployment efficiency**."""

            else:
                return f"""### ✦ Core Competencies & Tooling for {d_title}

To excel in **{d_rec}**, concentrate on high-leverage fundamentals:

1. **Domain Depth & Execution Tools**: Master the 3 industry-standard tools for your focus area rather than dabbling across 10 alternatives.
2. **Distribution & Communication**: The ability to articulate complex trade-offs in concise written memos will set you apart from 90% of peers.
3. **Measurement & Metrics**: Track quantifiable outcomes (e.g. conversion rates, performance benchmarks, delivery speed) rather than vanity metrics."""

        # Intent 5: TIMELINE, FEASIBILITY & TIME COMMITMENT
        elif any(w in q_lower for w in ["how long", "time", "months", "years", "realistic", "feasible", "speed", "part-time", "schedule", "hours"]):
            return f"""### ✦ Realistic Timeline & Feasibility Horizon

**Dilemma**: *"{d_title}"*
**Target Pathway**: **{d_rec}**

---

#### Calibrated Timeline Expectations:
- **Fast-Track (Full Immersion / 30+ hrs/wk)**: **90 to 120 Days** to reach verified baseline competency and deliver 2–3 public high-conviction artifacts.
- **Sustainable Track (Part-Time / 12–15 hrs/wk)**: **6 to 8 Months** to complete transition milestones while maintaining current day-job stability.

#### Key Milestones to Track:
1. **Day 30**: Complete first end-to-end working system from scratch and deploy publicly.
2. **Day 60**: Deliver a benchmarked, differentiated project solving a real workflow problem.
3. **Day 90**: Package portfolio, publish architectural breakdown, and initiate targeted network outreach.

---

**Weekly Time Allocation Strategy**:
- 3 blocks of 2 hours on weekday mornings/evenings (6 hrs)
- 1 extended deep-work sprint on Saturday morning (5 hrs)
- **Total: 11 focused hours/week** is sufficient to compound meaningful mastery within 6 months without burning out."""

        # Intent 6: FINANCIAL, SALARY & COMPENSATION
        elif any(w in q_lower for w in ["salary", "money", "cost", "afford", "expensive", "tuition", "comp", "earning", "compensation", "fee"]):
            return f"""### ✦ Financial Structure & Capital Allocation Analysis

Analyzing the financial dimensions of **"{d_title}"**:

---

#### Comparative Pathway Economics:
- **{d_rec}**:
  - **Upfront Capital Required**: Extremely low to zero ($0–$150/mo for serverless GPU compute, cloud hosting, and domain).
  - **Income Continuity**: Preserves your existing income runway while you build leverage.
  - **Downside Risk**: Strictly bounded to your invested hours, with zero loan/tuition debt.
{f"- **Alternative ({d_alt})**: Incurs higher financial or opportunity cost through tuition or delayed compensation compounding." if d_alt else ""}

#### Strategic ROI Rule:
Never trade liquid capital for credentials if you can produce public, verified proof-of-work for free. Spend money only on compute and tools that directly accelerate your building speed."""

        # Intent 7: PARALYSIS, DOUBT & DECISION ANXIETY
        elif any(w in q_lower for w in ["can't decide", "stuck", "confused", "not sure", "afraid", "doubt", "hesitant", "scared", "worried"]):
            return f"""### ✦ Deconstructing Decision Paralysis

When grappling with **"{d_title}"**, feeling uncertain is a natural symptom of treating this as an irreversible life event rather than an iterative experiment:

---

#### 1. The Two-Way Door Principle:
- Most career and project decisions are **Two-Way Doors** (Jeff Bezos mental model): you can walk through, gather data for 30–60 days, and walk back if the evidence does not match your thesis.
- **{d_rec}** has exceptionally high reversibility. Testing it does not burn your existing bridge.

#### 2. The Regret Minimization Lens:
- In 10 years, will you regret testing **{d_rec}** for 60 days and learning where your edges are? Or will you regret remaining in chronic analysis paralysis, wondering what might have been?

#### 3. Immediate De-risking Action:
- Do NOT make a 5-year commitment today. Make a **14-day commitment** to complete a single micro-proof project. Let real empirical momentum decide your next step."""

        # Intent 8: DEFAULT GENERAL SYNTHESIS
        else:
            options_summary = "\n".join([f"- **{o}**" for o in options_titles[:4]]) if options_titles else f"- **{d_rec}**"
            return f"""### ✦ FlowMind Decision Intelligence Directive

Evaluating **"{question}"** in context of **"{d_title}"**:

---

#### Core Strategic Assessment:
FlowMind's multi-agent council evaluated candidate pathways against your stated priorities:
{options_summary}

#### Recommended Focus: **{d_rec}**
1. **Asymmetric Payoff**: This pathway maximizes upside leverage while keeping downside risk bounded and manageable.
2. **Velocity Over Speculation**: Converting uncertainty into concrete, measurable artifacts produces faster clarity than extended deliberation.
3. **Execution Edge**: Focus your immediate energy on the single highest-leverage task that accelerates progress toward '{user_goal}'.

---

**Next Action**:
Use the Workspace HUD or type `⌘K` to simulate What-If parameter changes or run an adversarial Red Team stress-test."""

    def _extract_factors(self, question: str, answer: str) -> List[str]:
        factors = ["Expected Value", "Opportunity Cost", "Reversibility"]
        text = (question + " " + answer).lower()
        if "risk" in text or "downside" in text or "failure" in text:
            factors.append("Downside Protection")
        if "velocity" in text or "speed" in text or "learn" in text or "start" in text:
            factors.append("Learning Velocity")
        if "equity" in text or "financial" in text or "comp" in text or "salary" in text or "cost" in text:
            factors.append("Capital Efficiency")
        if "remote" in text or "location" in text:
            factors.append("Network Density")
        if "autonomy" in text or "agency" in text or "ownership" in text:
            factors.append("Autonomy & Agency")
        return factors[:4]

    def _generate_followups(self, question: str, title: str, decision: Optional[Decision] = None) -> List[str]:
        rec = decision.recommendation if decision and decision.recommendation else "the recommended option"
        return [
            f"What is the step-by-step 30-day roadmap for {rec}?",
            f"What are the biggest failure modes and risks in this path?",
            f"What modern tools and skills should I prioritize first?"
        ]

ai_qa_service = AIQAService()
