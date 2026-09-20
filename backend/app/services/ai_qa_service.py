import os
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
        api_key: Optional[str] = None,
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
                    f"- [{e.source_title or 'Context'}] {e.quote or e.claim} (Provenance: {e.source_type})"
                    for e in decision.evidence_items[:5]
                ]

                decision_context = f"""
Current Active Decision Dilemma on FlowMind:
Title: {decision.title}
Context: {decision.context}
Current Recommendation: {decision.recommendation or 'Evaluating'}
Calibrated Confidence: {int(decision.confidence_score * 100)}%
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

        # 2. System Prompt: Natural, highly competent AI chatbot & strategic decision advisor
        system_prompt = f"""You are FlowMind AI, an intelligent, versatile, and articulate AI assistant and decision intelligence advisor.

CORE BEHAVIOR & CONVERSATIONAL TONE:
- Be helpful, conversational, natural, and perceptive — like a world-class AI chatbot (e.g. Gemini / ChatGPT / Claude).
- When a user greets you (e.g., "hi", "hello", "hey", "how are you"), greet them back warmly, introduce what you can help with, and invite their questions or dilemmas.
- Answer ANY question the user asks directly, thoughtfully, and clearly. Provide helpful suggestions, reasoned answers, alternative perspectives, and practical next steps.
- You specialize in decision intelligence, strategic thinking, career choices, venture strategy, technical trade-offs, and mental models (such as reversible vs irreversible doors, expected value, second-order effects).
- If there is an active decision context below, treat it as helpful background information. If the user asks about that decision, reference it specifically; if the user asks a general question or conversational query, answer their question directly without forcing it back onto the decision.
- Format responses cleanly with Markdown, clear headings (###), bullet points, and actionable takeaways when appropriate.
- Never give rigid refusal templates or claim you can only discuss FlowMind. Be a genuinely helpful AI assistant!

{decision_context}
{f"Additional Context: {context}" if context else ""}
"""

        conversation_history_text = ""
        if history:
            conversation_history_text = "\n\nPrevious Conversation:\n" + "\n".join(
                f"{msg.get('role', 'user').capitalize()}: {msg.get('content', '')}"
                for msg in history[-4:]
            )

        full_user_prompt = f"{conversation_history_text}\n\nQuestion: {question}"

        # 3. Provider Execution: 1st Choice Google Gemini (Fast, Free Tier / Production Key)
        active_gemini_key = (
            api_key or 
            settings.GEMINI_API_KEY or 
            os.getenv("GEMINI_API_KEY", "") or 
            os.getenv("GOOGLE_API_KEY", "")
        ).strip()

        if active_gemini_key:
            # Try gemini-1.5-flash first, then fallback to gemini-2.0-flash or gemini-1.5-pro
            candidate_models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
            for model_name in candidate_models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={active_gemini_key}"
                    payload = {
                        "system_instruction": {
                            "parts": [{"text": system_prompt}]
                        },
                        "contents": [
                            {
                                "role": "user",
                                "parts": [{"text": full_user_prompt}]
                            }
                        ],
                        "generationConfig": {
                            "temperature": 0.35,
                            "maxOutputTokens": 1200,
                        }
                    }
                    async with httpx.AsyncClient(timeout=15.0) as client:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidates = data.get("candidates", [])
                            if candidates and "content" in candidates[0]:
                                parts = candidates[0]["content"].get("parts", [])
                                if parts and "text" in parts[0]:
                                    answer_text = parts[0]["text"]
                                    return {
                                        "question": question,
                                        "answer": answer_text,
                                        "model_used": f"Gemini ({model_name.replace('gemini-', '').title()} - Google DeepMind)",
                                        "confidence": 0.95,
                                        "relevant_factors": self._extract_factors(question, answer_text),
                                        "suggested_followups": self._generate_followups(question, decision_title),
                                        "citations": [e.split("] ")[0].replace("- [", "") for e in evidence_snippets if "]" in e]
                                    }
                        else:
                            print(f"[AIQAService] Gemini {model_name} returned HTTP {resp.status_code}: {resp.text[:200]}")
                except Exception as e:
                    print(f"[AIQAService] Gemini model {model_name} call error: {e}")

        # 4. Provider Execution: 2nd Choice Groq / OpenAI
        api_key_other = settings.GROQ_API_KEY or settings.OPENAI_API_KEY
        if api_key_other:
            try:
                base_url = "https://api.groq.com/openai/v1" if settings.GROQ_API_KEY else "https://api.openai.com/v1"
                model = "llama-3.1-8b-instant" if settings.GROQ_API_KEY else "gpt-4o-mini"
                headers = {
                    "Authorization": f"Bearer {api_key_other}",
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
            "model_used": "FlowMind Cognitive Engine (Platform Advisor)",
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
        # Primary user goal
        user_goal = decision.goals[0].description if (decision and decision.goals) else d_title

        # Determine if the query is specifically inquiring about the loaded decision
        is_specifically_about_decision = False
        if decision:
            option_matches = any(o.lower() in q_lower for o in options_titles if len(o) > 2)
            stopwords = {"should", "would", "could", "what", "which", "where", "when", "about", "with", "from", "have", "make", "take", "need", "into", "over", "more", "most", "some", "time", "than", "that", "this", "then", "will", "your", "good", "best", "help", "like", "lead", "staff", "startup"}
            title_words = [w for w in re.findall(r'\b\w+\b', d_title.lower()) if len(w) >= 4 and w not in stopwords]
            title_matches = any(w in q_lower for w in title_words) if title_words else False
            explicit_decision_words = any(w in q_lower for w in [
                "this decision", "my decision", "the options", "which option", "which path",
                "the recommendation", "current dilemma", "should i choose", "what should i pick",
                "council vote", "the council", "current choice", "top option", "recommended over",
                "why is this recommended", "why this recommendation", "active dilemma"
            ])
            is_specifically_about_decision = option_matches or title_matches or explicit_decision_words

        # Domain classification for domain-specific intelligence
        t_low = (d_title + " " + question).lower() if is_specifically_about_decision else question.lower()
        is_ai_tech = any(w in t_low for w in ["ai", "engineer", "ml", "machine learning", "data", "software", "developer", "deep learning", "llm", "neural", "python"])
        is_startup = any(w in t_low for w in ["startup", "founder", "saas", "business", "bootstrap", "venture", "fundraise", "product", "mvp"])
        is_career = any(w in t_low for w in ["career", "job", "promotion", "switch", "transition", "manager", "role", "hire", "interview"])
        is_financial = any(w in t_low for w in ["invest", "money", "salary", "house", "buy", "crypto", "equity", "capital", "stocks"])

        # =========================================================================
        # 1. GREETINGS & CASUAL CONVERSATION (Natural Chatbot Flow)
        # =========================================================================
        q_clean = q_lower.strip().strip("!.?,:;")
        greetings = ["hi", "hello", "hey", "hola", "sup", "yo", "howdy", "greetings", "good morning", "good afternoon", "good evening"]
        is_greeting = (
            q_clean in greetings or 
            any(q_lower.startswith(g + " ") for g in greetings) or 
            any(q_clean.startswith(g) and len(q_clean.split()) <= 4 for g in ["hi ", "hello ", "hey ", "hi,"]) or
            (len(q_clean.split()) <= 4 and any(g in q_clean.split() for g in ["hi", "hello", "hey", "hola"]))
        )
        if is_greeting:
            return f"""Hello! 👋 How can I help you today?

I'm **FlowMind AI**, your assistant and strategic decision advisor.

Here are a few things I can help you with:
- **Answer Questions & Give Advice**: Ask about career moves, tech decisions, business strategy, or daily challenges.
- **Brainstorm & Suggest Answers**: Need ideas or options? Tell me what you're working on and I'll lay out high-leverage alternatives.
- **Compare Choices**: Give me 2 or more paths (e.g. *Option A vs. Option B*) to analyze trade-offs, reversibility, and risks.
- **Decision Intelligence**: Explore FlowMind's **7-Agent Council**, **Adversarial Red Team**, or **Monte Carlo simulations**.

What are you thinking through right now?"""

        # 2. BOT IDENTITY & CAPABILITIES
        if any(w in q_lower for w in ["who are you", "what can you do", "what are you", "introduce yourself", "how can you help", "what do you do"]):
            return """### ✦ I am FlowMind AI
I am your interactive AI assistant and decision intelligence advisor on the FlowMind platform.

---

#### What I Can Help You With:
1. **Decision Analysis & Structuring**:
   - Break down complex, high-stakes decisions into clear options, priorities, and constraints.
   - Separate **Type 1** irreversible one-way doors from **Type 2** flexible two-way doors.
2. **Brainstorming & Strategic Suggestions**:
   - Suggest creative alternative pathways you might have overlooked.
   - Provide realistic roadmaps, timelines, and financial models.
3. **Adversarial Stress-Testing**:
   - Play devil's advocate to identify fragile assumptions and failure modes before you commit.
4. **General Questions & Guidance**:
   - Answer questions across tech, career, startups, finance, and decision frameworks.
   - Explain FlowMind features (7-Agent Council, Red Team Mode, 1,000-scenario Monte Carlo simulations, RAG document evidence, and Decision Memory).

Feel free to ask a question, share a dilemma, or test an idea!"""

        # 2.5. SUGGESTIONS & BRAINSTORMING (Direct, Creative, Actionable)
        if any(w in q_lower for w in ["suggest", "give me suggestions", "give me ideas", "brainstorm", "recommend something", "what are some ideas", "what do you suggest", "suggest answers", "suggest options"]):
            if decision and is_specifically_about_decision:
                options_summary = "\n".join([f"- **{o}**" for o in options_titles[:4]]) if options_titles else f"- **{d_rec}**"
                return f"""### ✦ Strategic Recommendations: "{d_title}"

Here are targeted suggestions based on FlowMind's multi-agent council analysis:

1. **Prioritize {d_rec}**:
   - Focus on this pathway first to maximize early traction and preserve two-way door agility.
2. **Current Options Under Consideration**:
{options_summary}
3. **Recommended Immediate Experiment**:
   - Set up a 14-day test milestone to validate your core hypothesis before committing long-term resources.

Would you like to explore any of these specific options or stress-test them in Red Team Mode?"""
            else:
                return f"""### ✦ Suggestions & Strategic Ideas

Regarding: **"{question}"**

---

Here are structured recommendations and actionable pathways to consider:

1. **Option 1: The Low-Friction Test (Two-Way Door)**
   - *Approach*: Design a small, 14-day micro-experiment that generates direct real-world signal without irreversible commitments.
   - *Key Advantage*: You gather verifiable facts rather than relying on guesswork, with negligible downside risk.

2. **Option 2: The Asymmetric Growth Bet (Compounding Upside)**
   - *Approach*: Invest focused energy into the pathway with the highest long-term leverage, rare skills, or proprietary distribution.
   - *Key Advantage*: Generates compounding returns and creates strong competitive differentiation.

3. **Option 3: The Hedged / Phased Transition**
   - *Approach*: Maintain your existing baseline security while allocating 20% of your weekly bandwidth to the new pathway until key milestones are hit.
   - *Key Advantage*: Eliminates downside anxiety while steadily building forward momentum.

---

**Next Steps**:
Which of these directions resonates most with what you're trying to achieve? You can also give me 2 specific options to compare head-to-head!"""

        # =========================================================================
        # FLOWMIND PLATFORM & WEBSITE ARCHITECTURE INTENTS
        # =========================================================================

        # Platform Intent 1: What is FlowMind & What problem does it solve?
        if any(w in q_lower for w in ["what is flowmind", "what is this website", "what does this website do", "about flowmind", "what problem does it solve", "what is this platform", "tell me about this website", "what does flowmind do"]):
            return """### ✦ FlowMind: AI-Native Decision Intelligence Platform

**FlowMind** is an enterprise-grade Decision Intelligence Platform engineered to eliminate cognitive bias, stress-test high-stakes trade-offs, and ground strategic choices in empirical evidence.

---

#### 1. What Core Problems Does FlowMind Solve?
- **Cognitive Bias & Tunnel Vision**: Traditional decision-makers suffer from confirmation bias and premature closure. FlowMind's **Adversarial Red Team** and **7-Agent Dialectic Council** force objective confrontation with blindspots.
- **Superficial AI Hallucination**: Generic chatbots give generic, sycophantic advice. FlowMind uses structured **multi-agent arbitration**, **1,000-run Monte Carlo simulations**, and **RAG document grounding**.
- **Hindsight Bias & Forgotten Assumptions**: People rewrite history after decisions succeed or fail. FlowMind's **Decision Memory** captures baseline expectations to calibrate your judgment over time.
- **Irreversible Trap Risk**: FlowMind visualizes options on a **2D Strategic Matrix** separating Jeff Bezos' Type 1 (irreversible one-way doors) from Type 2 (rapid two-way doors).

---

#### 2. Key Architecture Pillars:
1. **Thought Composer**: Natural language cognitive ingestion that automatically parses ambiguities, priorities, and constraints.
2. **7-Agent AI Council**: Multi-perspective dialectic debate (Analyst, Optimist, Skeptic, Financial, Planner, Devil's Advocate, Synthesizer).
3. **Adversarial Red Team**: Automated stress-testing with calibrated confidence haircuts.
4. **1,000-Run What-If Simulator**: Monte Carlo sensitivity distributions (P10 stress floor, P50 median, P90 bull case).
5. **Grounded Evidence Engine**: Ingests PDF/DOCX offer letters and notes with 3-tier provenance tracking.
6. **Decision Memory**: Outcome logging for long-term cognitive calibration.

**Bottom Line Directive**:
Enter any dilemma into the Thought Composer to launch your multi-agent decision space immediately."""

        # Platform Intent 2: How FlowMind works / 5-Stage Cognitive Journey
        if any(w in q_lower for w in ["how does flowmind work", "how does this work", "how to use flowmind", "how to use this website", "how do i use", "5-stage", "5 stage", "workflow", "process"]):
            return """### ✦ How FlowMind Works: The 5-Stage Cognitive Journey

FlowMind guides you through an end-to-end cognitive workflow designed to produce calibrated certainty:

---

#### Stage 01: Think (Natural Ingestion)
- Type your dilemma in plain language into the **Thought Composer**.
- FlowMind instantly deconstructs messy thoughts into explicit goals, core factors, and non-negotiable constraints.

#### Stage 02: Structure (Topological Framing)
- Define candidate pathways or let FlowMind suggest realistic alternative routes.
- Assign relative priority weights (e.g. Compensation, Velocity, Autonomy, Risk).

#### Stage 03: Synthesize (7-Agent Council Arbitration)
- 7 specialized AI agents debate trade-offs from empirical, financial, operational, and long-term viewpoints.
- The Synthesizer harmonizes divergent arguments into an equilibrium recommendation score (0–100).

#### Stage 04: Challenge (Adversarial Interrogation)
- **Red Team Mode**: Attacks fragile assumptions and applies a calibrated confidence haircut.
- **What-If Lab**: Adjust financial and operational levers to simulate 1,000 stochastic futures.

#### Stage 05: Decide & Remember (Decision Memory)
- Commit to the chosen pathway with calibrated confidence.
- Record the lived outcome months later in **Decision Memory** to eliminate hindsight bias and calibrate your personal decision models.

---

**Next Action**:
Press `[ESC]` to return to the workspace or click **Help** in the dock to view the visual interactive guide."""

        # Platform Intent 3: 7-Agent AI Council Explained
        if any(w in q_lower for w in ["council", "7 agent", "seven agent", "ai council", "who are the agents", "analyst agent", "skeptic agent", "optimist agent", "synthesizer agent", "devil's advocate agent", "financial agent"]):
            return """### ✦ The FlowMind 7-Agent AI Reasoning Council

Rather than relying on a single fallible prompt, FlowMind convenes 7 specialized autonomous reasoning agents who debate from orthogonal strategic lenses:

---

| Agent | Strategic Lens | Core Focus |
| :--- | :--- | :--- |
| 🔍 **The Analyst** | Empirical Baseline | Validates baseline rates, historical data, and factual premises. |
| 🚀 **The Optimist** | Asymmetric Upside | Identifies compounding leverage, market tailwinds, and best-case optionality. |
| 🛡️ **The Skeptic** | Downside Protection | Flags operational friction, organizational drag, and execution vulnerabilities. |
| 💰 **The Financial Analyst** | Capital Efficiency | Analyzes burn rate, unit economics, compensation ROI, and runway sustainability. |
| ⏳ **The Long-Term Planner** | Compounding Horizon | Forecasts 3–5 year second-order compounding effects and career trajectory. |
| ⚔️ **The Devil's Advocate** | Bias Interrogation | Relentlessly attacks confirmation bias, sunk cost fallacies, and groupthink. |
| ⚖️ **The Synthesizer** | Equilibrium Signal | Harmonizes conflicting arguments into a unified decision score and calibrated signal. |

---

**How to Inspect**:
Click the **AI Council** button in the bottom dock or in the Spatial Canvas to view individual argument breakdowns, identified risks, and missing information for every agent."""

        # Platform Intent 4: Adversarial Red Team Mode
        if any(w in q_lower for w in ["red team", "challenge my decision", "adversarial", "confirmation bias", "confidence haircut", "stress test", "attack my decision"]):
            return """### ✦ Adversarial Red Team: "Challenge My Decision" Mode

**Red Team Mode** is an adversarial stress-test modeled after military intelligence and high-stakes hedge fund investment committees:

---

#### 1. Why Red Teaming Matters:
Human decision-makers instinctively search for evidence that confirms their preferred choice (confirmation bias). FlowMind's Red Team does the opposite: it **deliberately attacks your leading recommendation** to discover failure modes before you commit capital or time.

#### 2. What the Red Team Generates:
- **Attacked Option**: The leading pathway under adversarial assault.
- **Critical Assumptions**: Hidden hypotheses that must be true for the decision to succeed, but have zero empirical verification.
- **Catastrophic Failure Modes**: Concrete scenarios where the chosen path implodes (e.g. regulatory shock, execution burnout, market commoditization).
- **Dialectic Counter-Arguments**: The strongest possible case for why you should NOT pursue this pathway.
- **Calibrated Confidence Haircut**: An objective reduction applied to model confidence (e.g. -12%) to account for unverified assumptions.

---

**How to Trigger**:
Press `⌘K` -> Select *"Challenge My Decision"*, or click the **⚔️ Red Team** button in the bottom dock."""

        # Platform Intent 5: What-If Lab & 1,000-Run Monte Carlo Simulation
        if any(w in q_lower for w in ["what-if", "what if", "monte carlo", "simulator", "simulation", "p10", "p50", "p90", "scenario levers", "sensitivity analysis"]):
            return """### ✦ What-If Scenario Lab: 1,000-Run Monte Carlo Sensitivity Engine

The **What-If Lab** tests how fragile or antifragile your decision is when conditions deviate from your optimistic assumptions:

---

#### 1. Stochastic Monte Carlo Engine:
FlowMind executes **1,000 algorithmic simulation runs** incorporating randomized shocks across:
- Market demand and revenue swings
- Execution friction and delivery delays
- Sunk costs and inflation drag
- Talent retention and team bandwidth

#### 2. Calibrated Percentile Distribution:
- **P10 (Stress Floor)**: The worst 10% outcome floor. If you cannot survive the P10 case, the decision is too fragile.
- **P25 / P50 (Median)**: The expected equilibrium baseline.
- **P75 / P90 (Bull Case)**: The 90th-percentile compounding upside ceiling.
- **Volatility & Downside Risk**: Measures expected variance across stochastic futures.

#### 3. Interactive Levers:
Use the real-time sliders to test:
- *"What if execution takes 40% longer?"*
- *"What if initial compensation is 20% lower?"*
- *"What if remote flexibility changes?"*

---

**How to Trigger**:
Click the **Sliders** icon in the bottom dock or launch via `⌘K` -> *"Simulate What-If Scenarios"*."""

        # Platform Intent 6: 2D Strategic Trade-Off Matrix (Type 1 vs Type 2 Doors)
        if any(w in q_lower for w in ["matrix", "2d matrix", "quadrant", "exit agility", "reversibility", "type 1", "type 2", "one-way door", "two-way door", "cartesian"]):
            return """### ✦ The 2D Strategic Decision Matrix

FlowMind plots every evaluated pathway on a 2-dimensional Cartesian plane based on Jeff Bezos' famous decision framework:

---

#### The Coordinates:
- **X-Axis: Exit Agility & Reversibility** (0 to 100%):
  - **Type 1 One-Way Doors (Left)**: Decisions that are irreversible or carry catastrophic switching costs. Require deep deliberation, external validation, and bounded commitments.
  - **Type 2 Two-Way Doors (Right)**: Decisions that can be reversed quickly with negligible capital or reputational cost. Should be made rapidly with high experimentation velocity.
- **Y-Axis: Compounding Upside & Leverage** (0 to 100%):
  - Measures long-term career capital, equity compounding, network density, and asymmetric payoff.

#### The 4 Strategic Quadrants:
1. **Top-Right (The Asymmetric Sweet Spot)**: High Upside + High Reversibility. (Target this!)
2. **Top-Left (Calculated High-Stakes)**: High Upside + Irreversible One-Way Door. (Requires Red Teaming!)
3. **Bottom-Right (Iterative Sandbox)**: Low Upside + Reversible. (Good for prototyping).
4. **Bottom-Left (Trap / Quagmire)**: Low Upside + Irreversible. (Avoid at all costs).

---

**How to Use**:
Hover over any node in the Spatial Canvas to view its exact `(X, Y)` coordinates, confidence, major upside, and tail risk."""

        # Platform Intent 7: Document Grounding & Evidence (RAG)
        if any(w in q_lower for w in ["evidence", "document", "upload", "grounding", "provenance", "fact_from_document", "rag", "citation", "384-dim"]):
            return """### ✦ Document Grounding & 3-Tier Evidence Ingestion (RAG)

To prevent AI hallucinations, FlowMind grounds decision scores in real external documents:

---

#### 1. Ingestion Pipeline:
- Upload PDF, DOCX, CSV, or TXT documents (e.g. formal employment offer letters, term sheets, compensation tables, lease contracts).
- FlowMind parses clauses, generates **384-dimensional vector embeddings**, and attaches verified citations directly to the decision topology.

#### 2. The 3-Tier Provenance Trust Model:
- 🟢 **`FACT_FROM_DOCUMENT`**: Verified text extracted directly from uploaded files with verified page and section citations.
- 🟡 **`USER_ASSUMPTION`**: Explicit premises and constraints supplied by the user.
- 🟣 **`AI_INFERENCE`**: Logical deductions derived by the multi-agent council.

---

**How to Upload**:
Click **Attach Document** in the bottom dock or press `⌘K` -> *"Upload Evidence Document"*."""

        # Platform Intent 8: Decision Memory & Outcome Calibration
        if any(w in q_lower for w in ["decision memory", "memory", "calibration", "outcome", "hindsight", "log outcome", "lessons learned", "archive"]):
            return """### ✦ Decision Memory: Eradicating Hindsight Bias

Most professionals never improve their decision-making because of **Hindsight Bias**—once an outcome occurs, our brains rewrite memory to believe we "knew it all along."

---

#### How Decision Memory Works:
1. **Timestamped Baseline Snapshot**: FlowMind locks in your exact predicted outcome, stated risks, and calibrated confidence at the moment of commitment.
2. **30/90/180-Day Calibration Check**: Return to the **Decision Archive** (`Archive` tab in the navigation dock).
3. **Record Real-World Outcomes**: Log:
   - *What Actually Happened* vs *Expected Outcome*
   - *What Went Right* (Catalysts)
   - *What Went Wrong* (Frictions)
   - *Incorrect Assumptions* (Hypotheses that failed in reality)
   - *Strategic Lessons Learned*
4. **Calibration Metric**: Calculates model accuracy rating to improve future decision velocity.

---

**Accessing Memory**:
Click **Archive** in the top dock to review past decisions and log calibration outcomes."""

        # Platform Intent 9: Export Executive Memo
        if any(w in q_lower for w in ["export", "memo", "notion", "obsidian", "download memo", "markdown memo", "share"]):
            return """### ✦ Executive Decision Memo Export

FlowMind formats decisions into executive memos ready for leadership reviews, co-founders, boards, or personal journaling:

---

#### What the Memo Includes:
1. **Executive Summary**: The calibrated signal and decision score.
2. **Competing Pathways**: Evaluated options with pros, cons, and alignment scores.
3. **7-Agent Council Arbitration**: Viewpoints, debate disagreements, and identified friction points.
4. **Grounded Evidence Citations**: Document provenance and quotes.

#### Supported Destinations:
- **Markdown Memo (`.md`)**: Formatted for Notion, Obsidian, GitHub, and Slack.
- **Raw JSON Snapshot (`.json`)**: Machine-readable format for archival or API integrations.

---

**How to Export**:
Click the **Export** icon in the bottom dock or open via `⌘K` -> *"Export Decision Memo"*."""

        # Platform Intent 10: Keyboard Shortcuts & Productivity
        if any(w in q_lower for w in ["shortcut", "shortcuts", "keyboard", "omnicommand", "cmd+k", "ctrl+k", "hotkey", "dock"]):
            return """### ✦ FlowMind Keyboard Shortcuts & OmniCommand

FlowMind is built for keyboard-first strategic velocity:

---

| Shortcut | Action |
| :--- | :--- |
| `⌘K` / `Ctrl+K` | Open OmniCommand palette (search decisions, trigger actions). |
| `⌘/` / `Ctrl+/` | Toggle Ask FlowMind AI assistant modal anytime. |
| `ESC` | Close any modal, drawer, or inspector and return to the canvas. |
| `Enter` | Submit dilemma in Thought Composer or send prompt to Ask AI. |
| `Shift + Enter` | Create a newline in prompt textareas without submitting. |

---

**Theme Switching**:
Click the Sun/Moon icon in the top-right dock to seamlessly toggle between **Porcelain Light Mode** and **Obsidian Dark Mode**."""

        # =========================================================================
        # ACTIVE DECISION INTENTS (Grounded in current decision)
        # =========================================================================

        # Extract token words for precise semantic routing
        q_words = set(re.findall(r'\b\w+\b', q_lower))

        # Check if the query is a comparison between options or entities
        vs_match = re.search(r"([\w\s]{2,30})\s+(?:vs\.?|versus)\s+([\w\s]{2,30})", question, re.IGNORECASE)
        is_comparison_query = bool(vs_match) or any(w in q_words for w in ["compare", "comparison"]) or any(p in q_lower for p in ["which option", "which is better", "why this", "difference between", " vs "])

        # Check if query is about risks and failure modes
        is_risk_query = any(w in q_words for w in ["risk", "risks", "danger", "dangers", "downside", "downsides", "fail", "failure", "pitfall", "pitfalls", "threat", "threats", "vulnerability", "protect"])

        # Intent 1: ROADMAP / HOW DO I START / FIRST STEPS
        is_roadmap_query = (
            any(w in q_words for w in ["start", "begin", "roadmap", "checklist"]) or
            any(p in q_lower for p in ["first step", "how to become", "how do i become", "where do i begin", "learn first", "day 1", "getting started"])
        ) and not is_comparison_query and not is_risk_query

        if is_roadmap_query:
            if decision and is_specifically_about_decision:
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
            else:
                topic = question.rstrip("?.!")
                if is_ai_tech:
                    return f"""### ✦ High-Signal Applied AI Engineering Roadmap

To build serious technical conviction and land high-impact opportunities in AI engineering, execute this **3-Phase Applied Roadmap**:

---

#### Phase 1 (Weeks 1–3): Core Applied Foundation
- **Modern Python & PyTorch Literacy**: Master tensor manipulation, gradient clipping, custom dataset loaders, and asynchronous concurrency (`asyncio`).
- **Hugging Face & Quantization Stack**: Build and run local inference with `transformers`, `accelerate`, and quantized models (GGUF, 4-bit AWQ).
- **First Micro-Artifact**: Deploy an end-to-end working system (domain assistant or document RAG) with a clean backend and UI.

#### Phase 2 (Weeks 4–8): Public Benchmark & Fine-Tuning
- **Fine-Tuning & Evaluation**: Fine-tune an open-source LLM (Llama-3 or Mistral) using **LoRA / QLoRA** on domain-specific data.
- **Evaluation Harness**: Implement automated evals with `ragas` or `promptfoo` to quantify performance gains against baselines.
- **Production Deployment**: Containerize with Docker and deploy to serverless GPU compute (Modal, RunPod) with public GitHub code.

#### Phase 3 (Weeks 9–12): Technical Distribution
- **Technical Post-Mortem**: Publish an architectural breakdown covering latency, token economics, and ablation tradeoffs.
- **Direct Proof-of-Work Outreach**: Share the live product and repository directly with founders and engineering leaders.

---

**Bottom Line Directive**: One deployed, benchmarked GitHub project beats 10 online course certificates. Begin with Phase 1 today."""
                else:
                    return f"""### ✦ Actionable Roadmap & First Steps

Regarding: **"{topic}"**

---

Here is a practical 3-phase execution sequence to achieve tangible results:

#### Phase 1 (Weeks 1–2): Low-Risk Discovery & Setup
- Clarify your non-negotiables: time commitment, budget limit, and primary success metric.
- Run a 14-day reversible test sprint (Two-Way Door) to validate initial assumptions.

#### Phase 2 (Weeks 3–6): Verifiable Proof-of-Work & Traction
- Produce concrete output (a functional prototype, validated agreement, or measurable milestone).
- Gather real-world feedback from users or stakeholders rather than relying on theory.

#### Phase 3 (Weeks 7–10): Decisive Scaling & Compounding
- Review empirical data: if leading indicators are strong, allocate full resources and compound gains.
- If friction is high, pivot early while switching costs remain minimal.

What specific milestone would you like to plan first?"""

        # Intent 2: WHY THIS RECOMMENDATION / COMPARISON
        elif is_comparison_query or any(w in q_words for w in ["why", "choose", "recommend"]):
            # Check if user asked about their own options (e.g. "X vs Y" or "A versus B")
            if vs_match and (decision is None or not is_specifically_about_decision):
                opt_a = vs_match.group(1).strip()
                opt_b = vs_match.group(2).strip().split("?")[0].split(",")[0].strip()
                return f"""### ✦ Strategic Comparison: {opt_a.title()} vs. {opt_b.title()}

Analyzing the strategic trade-offs between **{opt_a.title()}** and **{opt_b.title()}**:

---

#### 1. Core Trade-Off Dynamics:
- **{opt_a.title()}**:
  - *Advantages*: Greater autonomy, lower fixed burn rate, and faster immediate feedback loops.
  - *Constraints*: Growth is gated by near-term revenue; requires personal endurance and disciplined resource allocation.
- **{opt_b.title()}**:
  - *Advantages*: High capital velocity, ability to invest aggressively upfront in talent/technology, and institutional distribution networks.
  - *Constraints*: Equity dilution, board governance overhead, and pressure to achieve venture-scale returns.

#### 2. Reversibility & Door Type:
- **Two-Way vs. One-Way Doors**:
  - **{opt_a.title()}** is typically a **Two-Way Door**: you maintain flexibility and can always pivot or raise capital later once traction is proven.
  - **{opt_b.title()}** is an irreversible **One-Way Door**: high fixed overhead and external obligations are difficult to unwind.

#### 3. Strategic Decision Rule:
If certainty is low and learning velocity is your top priority, lean toward **{opt_a.title()}**. If market timing requires rapid land-grab economics with heavy capital investment, consider **{opt_b.title()}**.

Would you like to structure this into a full FlowMind decision with 7-agent arbitration?"""

            if decision and is_specifically_about_decision:
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
            else:
                return f"""### ✦ Strategic Decision Analysis

Regarding: **"{question}"**

---

#### Key Trade-Off Dimensions:
1. **Asymmetric Leverage vs. Downside Risk**: When comparing alternatives, look for the option that bounds your catastrophic downside while preserving unlimited upside.
2. **Reversibility (One-Way vs. Two-Way Doors)**: Prefer choices that can be tested in 30 days without permanent switching costs.
3. **Empirical Traction**: Base choices on observed customer behavior and measurable metrics rather than speculative optimism.

What specific alternatives would you like to evaluate or compare?"""

        # Intent 3: RISKS, PITFALLS & FAILURE MODES
        elif is_risk_query:
            if decision and is_specifically_about_decision:
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
            else:
                return f"""### ✦ Critical Risk Analysis & Defensive Guardrails

Regarding: **"{question}"**

---

#### 1. Primary Risk Dimensions to Audit:
- **The Reversibility Trap (One-Way Door Lock-In)**: Committing irreversible resources, reputation, or contracts before validating initial hypotheses.
- **Opportunity Cost Blindspot**: Forgetting that committing to this path means turning down other compounding alternatives.
- **Sunk Cost Fallacy**: Continuing to double down on an underperforming initiative simply because of past investments.
- **Distribution / Feedback Blindspot**: Building in isolation without exposing early iterations to real user scrutiny.

#### 2. Defensive Countermeasures:
1. **Define Clear Invalidation Criteria**: What empirical data or lack of traction will prompt you to pause or pivot?
2. **Cap Downside Exposure**: Ensure the worst-case scenario does not jeopardize your primary runway or stability.
3. **Run 14-Day Micro-Tests**: Test high-uncertainty assumptions with small experiments before scaling.

Would you like to analyze a specific scenario or set of risks?"""

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
Do not waste weeks memorizing deep mathematical proofs from scratch unless you are doing fundamental academic research. Modern AI engineering prioritizes **system architecture, data curation, model evaluation, and deployment efficiency**."""
            elif decision and is_specifically_about_decision:
                return f"""### ✦ Core Competencies & Tooling for {d_title}

To excel in **{d_rec}**, concentrate on high-leverage fundamentals:

1. **Domain Depth & Execution Tools**: Master the 3 industry-standard tools for your focus area rather than dabbling across 10 alternatives.
2. **Distribution & Communication**: The ability to articulate complex trade-offs in concise written memos will set you apart from 90% of peers.
3. **Measurement & Metrics**: Track quantifiable outcomes (e.g. conversion rates, performance benchmarks, delivery speed) rather than vanity metrics."""
            else:
                return f"""### ✦ Essential Competencies & High-Leverage Tooling

Regarding: **"{question}"**

---

#### 1. High-Leverage Competencies:
- **Core Domain Fluency**: Master the 2–3 standard tools that 80% of top practitioners rely on.
- **Clear Written Synthesis**: The ability to articulate complex trade-offs and proposals clearly.
- **Empirical Measurement**: Establish feedback loops to evaluate whether your execution is actually succeeding.

#### 2. Tool Selection Principles:
- Apply the **80/20 Rule**: 20% of tools deliver 80% of the practical utility.
- Avoid tools with high setup overhead that don't directly accelerate your core output.

What specific area or technology would you like tool recommendations for?"""

        # Intent 5: TIMELINE, FEASIBILITY & TIME COMMITMENT
        elif any(w in q_lower for w in ["how long", "time", "months", "years", "realistic", "feasible", "speed", "part-time", "schedule", "hours"]):
            if decision and is_specifically_about_decision:
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
            else:
                return f"""### ✦ Realistic Timeline & Milestone Horizon

Regarding: **"{question}"**

---

#### Calibrated Timeline Expectations:
- **Phase 1: Discovery & Micro-Validation (Weeks 1–2)**: Define parameters and run a low-stakes 14-day test.
- **Phase 2: Tangible Prototype & Traction (Weeks 3–6)**: Achieve first verifiable outcome or deliverable.
- **Phase 3: Steady-State Compounding (Months 2–4)**: Establish sustainable weekly cadence (8–12 dedicated hours) to compound results.

#### Time Management Rules:
1. **Protect 90-Minute Focus Blocks**: Deep work compounds exponentially faster than fragmented 15-minute bursts.
2. **Focus on Output Over Hours**: Progress is measured by delivered results, not time spent browsing.
3. **Maintain Runway**: Never overcommit hours to the point of compromising personal stability."""

        # Intent 6: FINANCIAL, SALARY & COMPENSATION
        elif any(w in q_lower for w in ["salary", "money", "cost", "afford", "expensive", "tuition", "comp", "earning", "compensation", "fee"]):
            if decision and is_specifically_about_decision:
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
            else:
                return f"""### ✦ Financial & Capital Allocation Framework

Regarding: **"{question}"**

---

#### Key Financial Considerations:
1. **Runway & Safety Buffer**: Maintain at least 3–6 months of liquid expenses before undertaking major financial pivots.
2. **Opportunity Cost**: Quantify the lost income or growth from alternative uses of the same capital and time.
3. **Asymmetric Payoff**: Prioritize paths where catastrophic downside is capped and upside is unbounded.
4. **Tool ROI**: Invest in tooling and infrastructure only when they demonstrably save significant hours or unlock new revenue."""

        # Intent 7: PARALYSIS, DOUBT & DECISION ANXIETY
        elif any(w in q_lower for w in ["can't decide", "stuck", "confused", "not sure", "afraid", "doubt", "hesitant", "scared", "worried"]):
            if decision and is_specifically_about_decision:
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
            else:
                return f"""### ✦ Overcoming Decision Paralysis & Uncertainty

When feeling stuck or uncertain regarding **"{question}"**:

---

#### 1. The Two-Way Door Mental Model:
- Most decisions are **Two-Way Doors**: you can test a direction for 14–30 days, evaluate real evidence, and adjust course with minimal downside.
- Treat this as an **experiment**, not an irrevocable life sentence.

#### 2. Regret Minimization Framework:
- Fast forward 5 years: will you regret taking a calculated, reversible shot and learning from it, or staying trapped in analysis paralysis?

#### 3. The 14-Day Micro-Experiment:
- You don't need a multi-year masterplan. Commit to a simple, concrete 14-day test that produces real feedback. Action creates clarity faster than overthinking."""

        # Intent 7.5: SPECIFIC DECISION INQUIRY (When user explicitly asks about the active dilemma)
        elif is_specifically_about_decision:
            options_summary = "\n".join([f"- **{o}**" for o in options_titles[:4]]) if options_titles else f"- **{d_rec}**"
            return f"""### ✦ Strategic Analysis: "{d_title}"

Addressing: *"{question}"*

---

#### 1. Multi-Agent Council Consensus:
The 7-agent council arbitrated the candidate pathways against your stated priorities:
{options_summary}

#### 2. Calibrated Focus: **{d_rec}**
- **Asymmetric Payoff**: Delivers compounding upside while bounding exposure to irreversible traps.
- **Validation Checkpoint**: Establish a 30-day milestone to test critical assumptions before committing heavy resources.
- **Failure Mode Defense**: Prepare contingencies for execution friction and liquidity drag.

---
*Tip: You can stress-test this in **Red Team Mode** or run a **1,000-scenario Monte Carlo simulation** from the workspace.*"""

        # Intent 8: GENERAL COMPARISON (X vs Y)
        elif any(w in q_lower for w in [" vs ", " versus ", " or ", "compare ", "difference between"]):
            return f"""### ✦ Strategic Comparison & Trade-Off Analysis

Evaluating: **"{question}"**

---

#### 1. Fundamental Trade-Off Dynamics:
- **Option / Path A**: Often favors immediate agility, lower initial overhead, and faster validation feedback loops. Best when uncertainty is high and learning speed is critical.
- **Option / Path B**: Often favors compounding scale, structural defensibility, and long-term leverage. Best when you have sufficient runway and clear conviction.

#### 2. Decision Lens (Type 1 vs Type 2):
- **Is this decision reversible?**
  - **Two-Way Door (Reversible)**: Bias toward fast experimentation and rapid prototyping.
  - **One-Way Door (Irreversible)**: Audit worst-case scenarios, impose a 48-hour cooling period, and identify what would invalidate your thesis.

#### 3. Recommended Approach:
Start with the option that provides empirical data in 14–30 days while keeping switching costs low. Would you like me to model these specific options in FlowMind?"""

        # Intent 9: ACTIONABLE ADVICE, ROADMAP & HOW-TO
        elif any(w in q_lower for w in ["how to", "how do i", "tips for", "advice on", "best way to", "guide", "steps to", "suggest"]):
            return f"""### ✦ Actionable Framework & Suggestions

Regarding: **"{question}"**

---

#### 1. Core Principles:
- **Clarify the Single Priority**: Identify the one constraint or goal that matters most right now (e.g. runway, velocity, validation, or scale).
- **Separate Facts from Hypotheses**: Write down what is empirically verified versus what is merely an unproven assumption.
- **De-Risk Through Iteration**: Build a 14-day prototype or pilot before locking in irrevocable commitments.

#### 2. Tactical Execution Steps:
1. **Define Success Criteria**: What quantifiable benchmark confirms this is working?
2. **Launch a Low-Friction Test**: Run an experiment that costs minimal capital or time.
3. **Review & Calibrate**: Measure real-world feedback against your initial expectation.

What specific details would you like to explore or structure?"""

        # Intent 10: GENERAL CHATBOT RESPONSE (Direct, Helpful, Conversational)
        else:
            return f"""### ✦ FlowMind AI

Regarding your question: **"{question}"**

---

Here is a structured, practical way to look at this:

1. **Signal vs. Noise**: Focus on the 1–2 high-leverage factors that truly determine the outcome, rather than getting overwhelmed by minor variables.
2. **Evaluate Reversibility**: Ask whether choices here are easily reversible (Two-Way Doors) or carry high switching costs (One-Way Doors).
3. **Test with Evidence**: Wherever possible, rely on empirical precedents and small experiments rather than intuition alone.

---

Feel free to ask follow-up questions, share a specific dilemma to analyze, or ask about any of FlowMind's tools (Council, Red Team, Monte Carlo, or Matrix)!"""

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
        q_low = question.lower()
        if any(w in q_low for w in ["hi", "hello", "hey", "who are you", "help", "sup", "greetings", "good morning"]):
            return [
                "How do I choose between two strong career paths?",
                "How does the 7-Agent AI Council evaluate dilemmas?",
                "What is the difference between Type 1 and Type 2 decisions?"
            ]
        if decision and any(w in q_low for w in ["this decision", "current", "my decision", "option", "recommend"]):
            rec = decision.recommendation or (decision.options[0].title if decision.options else "the recommended option")
            return [
                f"What is the step-by-step 30-day roadmap for {rec}?",
                f"What are the biggest failure modes and risks in this path?",
                f"How would the Adversarial Red Team attack this choice?"
            ]
        return [
            "What are the key trade-offs to consider here?",
            "What is a low-risk, reversible way to test this?",
            "How would you evaluate this using regret minimization?"
        ]

    async def verify_gemini_key(self, key: str) -> bool:
        """Verifies whether a provided Gemini API key can successfully invoke Google Gemini models."""
        cleaned = key.strip()
        if not cleaned:
            return False
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={cleaned}"
            payload = {
                "contents": [{"parts": [{"text": "Ping"}]}],
                "generationConfig": {"maxOutputTokens": 5}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, json=payload)
                return resp.status_code == 200
        except Exception:
            return False

ai_qa_service = AIQAService()
