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

        # 2. System Prompt: Simple, clear, human-friendly AI assistant & decision advisor
        system_prompt = f"""You are FlowMind AI, a helpful, clear, and friendly AI decision advisor.

CRITICAL INSTRUCTION - KEEP IT SIMPLE AND EASY TO UNDERSTAND:
- Write in plain, everyday English that anyone (whether a beginner, student, user, or administrator) can instantly understand.
- NEVER use dense academic jargon, philosophical buzzwords, or convoluted phrasing (avoid words like "dialectic cognitive synthesis", "asymmetric payoff boundary", "stochastic distributions", "epistemic closure", or "topological framing").
- Answer the user's question directly in the very first 1-2 sentences.
- Use simple bullet points with clear takeaways:
  1. What to do / Direct Answer
  2. Why this makes sense (simple pros and cons in plain words)
  3. Simple next steps (Step 1, Step 2, Step 3)
- If explaining concepts:
  - Instead of "Type 1 / Type 2 doors" -> Say "Decisions that are easy to undo vs. decisions that are hard to undo".
  - Instead of "Adversarial stress-testing" -> Say "Checking what could go wrong".
  - Instead of "Monte Carlo simulations" -> Say "Testing best-case and worst-case scenarios".
- Be warm, encouraging, realistic, and practical.

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

I'm **FlowMind AI**, your friendly decision assistant.

Here is what I can help you with in plain, simple terms:
- **Compare your choices**: Tell me your options (like *Job A vs. Job B*) and I'll break down the pros, cons, and risks.
- **Give you practical suggestions**: Need ideas or a roadmap? Tell me your goal and I'll give you a simple step-by-step plan.
- **Spot hidden catches**: I'll help you see what could go wrong before you spend time or money.
- **Explain the 7 AI Council roles**: Learn how different perspectives (finance, risks, growth) look at your dilemma.

What are you deciding on or thinking about right now?"""

        # 2. BOT IDENTITY & CAPABILITIES
        if any(w in q_lower for w in ["who are you", "what can you do", "what are you", "introduce yourself", "how can you help", "what do you do"]):
            return """### ✦ What is FlowMind AI?
I am your personal AI decision assistant. My job is to help you make smart, clear choices without getting overwhelmed or stuck.

---

#### How I Can Help You:
1. **Clear, Simple Comparisons**:
   - Compare two or more options side-by-side with real pros and cons anyone can understand.
   - Separate choices that are **easy to undo** (low risk) from choices that are **hard to undo** (high risk).
2. **Practical Ideas & Suggestions**:
   - Give you simple, realistic paths to achieve your goals (like learning a skill, switching jobs, or starting a project).
3. **Catch Hidden Problems**:
   - Flag potential risks, hidden costs, and stress factors before you make a commitment.
4. **Step-by-Step Plans**:
   - Turn big, confusing decisions into simple 14-day and 30-day action steps.

Feel free to ask any question or tell me what decision you're facing!"""

        # 2.5. SUGGESTIONS & BRAINSTORMING (Direct, Creative, Actionable)
        if any(w in q_lower for w in ["suggest", "give me suggestions", "give me ideas", "brainstorm", "recommend something", "what are some ideas", "what do you suggest", "suggest answers", "suggest options"]):
            if decision and is_specifically_about_decision:
                options_summary = "\n".join([f"- **{o}**" for o in options_titles[:4]]) if options_titles else f"- **{d_rec}**"
                return f"""### ✦ Simple Recommendations for: "{d_title}"

Here is the most practical way forward:

1. **Top Recommendation: Start with {d_rec}**
   - This option gives you the quickest results with the least amount of risk.
2. **Your Current Choices**:
{options_summary}
3. **What To Do Next (14-Day Test)**:
   - Try a simple 2-week trial or test run before making any big, permanent commitment.

Would you like to compare any of these choices directly, or look at the risks?"""
            else:
                return f"""### ✦ Practical Suggestions & Ideas

Regarding: **"{question}"**

---

Here are 3 simple, realistic options to consider:

1. **Option 1: The Quick Test (Low Risk)**
   - *What to do*: Try a simple 2-week experiment to see if you actually enjoy it and get results, without quitting anything or spending much money.
   - *Why it's good*: You get real facts quickly with almost zero downside.

2. **Option 2: The High-Growth Bet (Biggest Upside)**
   - *What to do*: Put focused effort into the path with the biggest long-term career or financial rewards.
   - *Why it's good*: Can lead to much bigger opportunities and valuable skills over 2–3 years.

3. **Option 3: The Safe Middle Ground (Step-by-Step)**
   - *What to do*: Keep your current routine or job safe, and spend 5–10 hours a week building the new direction.
   - *Why it's good*: Zero financial stress, and you can switch over once things are proven.

---

**Next Steps**:
Which of these 3 feels right for your situation? You can also give me 2 specific options and I'll compare them directly!"""

        # =========================================================================
        # FLOWMIND PLATFORM & WEBSITE ARCHITECTURE INTENTS
        # =========================================================================

        # Platform Intent 1: What is FlowMind & What problem does it solve?
        if any(w in q_lower for w in ["what is flowmind", "what is this website", "what does this website do", "about flowmind", "what problem does it solve", "what is this platform", "tell me about this website", "what does flowmind do"]):
            return """### ✦ What is FlowMind?

**FlowMind is your personal AI decision assistant.** It helps you make important life, career, and project choices without feeling confused, overwhelmed, or stuck.

---

#### What FlowMind Does For You:
1. **Lays Out Your Options Simply**: Put in what you're trying to decide, and FlowMind organizes your choices side-by-side.
2. **Evaluates from 7 Realistic Angles**: Instead of one quick opinion, 7 different AI perspectives look at your choices (costs, growth, risks, long-term impact, and facts).
3. **Catches Hidden Pitfalls**: Shows you what could go wrong before you commit time or money.
4. **Gives You a Clear Recommendation & Next Steps**: Tells you which choice is your strongest bet and gives you 2-3 simple steps to start.

---

**How to Start**:
Type your dilemma or question into the Thought Composer box on the canvas, or ask me any question right here!"""

        # Platform Intent 2: How FlowMind works / 5-Stage Cognitive Journey
        if any(w in q_lower for w in ["how does flowmind work", "how does this work", "how to use flowmind", "how to use this website", "how do i use", "5-stage", "5 stage", "workflow", "process"]):
            return """### ✦ How FlowMind Works (In 4 Simple Steps)

FlowMind helps you reach a confident decision in 4 clear, easy steps:

---

1. **Step 1: Write Down Your Dilemma**
   - Type what you're deciding in plain English (e.g., *"Should I take Job A or Job B?"* or *"Should I learn AI or Web Development?"*).

2. **Step 2: Compare Your Options**
   - FlowMind lists your choices and shows their pros, cons, and scores based on what matters to you.

3. **Step 3: Get 7 AI Council Perspectives**
   - 7 specialized AI agents deliberate and review your dilemma from practical angles:
     - The **Analyst** checks the facts.
     - The **Optimist** looks at the upside.
     - The **Skeptic** flags the risks and catches.
     - The **Financial Analyst** checks the budget and pay.
     - The **Long-Term Planner** checks where you'll be in 3–5 years.
     - The **Devil's Advocate** tests your blind spots.
     - The **Synthesizer** combines everything into one clear recommendation.

4. **Step 4: Take Action**
   - Review your recommended choice, check the simple next steps, and start executing with confidence!

---

**Next Action**:
Press `[ESC]` to return to the canvas, or click any node to explore its details."""

        # Platform Intent 3: 7-Agent AI Council Explained
        if any(w in q_lower for w in ["council", "7 agent", "seven agent", "ai council", "who are the agents", "analyst agent", "skeptic agent", "optimist agent", "synthesizer agent", "devil's advocate agent", "financial agent"]):
            return """### ✦ The FlowMind 7-Agent Council (Explained Simply)

Instead of relying on a single, biased answer, FlowMind convenes a **Council of 7 AI agents** who each look at your dilemma from a different angle:

---

| AI Agent | Simple Role | What It Asks You |
| :--- | :--- | :--- |
| 🔍 **The Analyst** | Facts & Requirements | *"What are the actual facts, numbers, and prerequisites?"* |
| 🚀 **The Optimist** | Growth & Possibilities | *"What is the best-case outcome and biggest upside?"* |
| 🛡️ **The Skeptic** | Risks & Hidden Catches | *"What could go wrong, and what might cause burnout?"* |
| 💰 **Financial Analyst** | Costs & Pay | *"Can you afford this, and is the financial return worth it?"* |
| ⏳ **Long-Term Planner** | 3–5 Year Horizon | *"Will you still be happy with this choice years from now?"* |
| ⚔️ **Devil's Advocate** | Stress-Testing | *"Let's be honest: what if your favorite option fails?"* |
| ⚖️ **The Synthesizer** | Final Recommendation | *"Here is the best balanced choice and your first step."* |

---

**How to Inspect**:
Click the **AI Council** button in the dock to read each agent's individual comments and advice."""

        # Platform Intent 4: Adversarial Red Team Mode
        if any(w in q_lower for w in ["red team", "challenge my decision", "adversarial", "confirmation bias", "confidence haircut", "stress test", "attack my decision"]):
            return """### ✦ "Challenge My Decision" (Red Team Mode)

**Red Team Mode** is like having an honest friend who tells you the hard truth before you make a big mistake.

---

#### Why It Is Helpful:
When we like an idea, we tend to ignore the bad parts. The Red Team purposely looks for:
1. **Weak Assumptions**: Things you are hoping will work out, but have not proven yet.
2. **Worst-Case Scenarios**: What happens if sales are slow, learning takes twice as long, or the job is stressful.
3. **Safety Checks**: What backup plan should you have in place before jumping in?

---

**How to Use**:
Click **⚔️ Red Team** in the bottom dock to see what risks you should double-check."""

        # Platform Intent 5: What-If Lab & 1,000-Run Monte Carlo Simulation
        if any(w in q_lower for w in ["what-if", "what if", "monte carlo", "simulator", "simulation", "p10", "p50", "p90", "scenario levers", "sensitivity analysis"]):
            return """### ✦ What-If Scenario Lab: Testing Best & Worst Cases

The **What-If Lab** lets you test what happens to your decision when things change:

---

#### 1. Testing Scenarios:
FlowMind runs **1,000 simulated scenarios** to test:
- **Worst 10% Case (Stress Floor)**: If everything goes wrong (delays, unexpected costs), will you still be okay?
- **Expected Case (Median)**: The most likely, realistic outcome.
- **Best 10% Case (High Upside)**: If things go exceptionally well.

#### 2. Interactive Sliders:
Use the sliders to ask:
- *"What if this project takes 3 months longer?"*
- *"What if income is 20% lower than expected?"*
- *"What if market conditions change?"*

---

**How to Use**:
Click the **Sliders** icon in the bottom dock to adjust parameters and see real-time results."""

        # Platform Intent 6: 2D Strategic Trade-Off Matrix (Type 1 vs Type 2 Doors)
        if any(w in q_lower for w in ["matrix", "2d matrix", "quadrant", "exit agility", "reversibility", "type 1", "type 2", "one-way door", "two-way door", "cartesian"]):
            return """### ✦ The Decision Matrix: Easy to Undo vs. Hard to Undo

FlowMind groups all your options based on two simple questions:
1. **How easy is it to undo if you change your mind?** (Reversibility)
2. **How much upside does it offer?** (Growth & Rewards)

---

#### The 2 Types of Decisions:
- **🚪🔄 Easy to Undo (Two-Way Doors)**:
  - Low risk. If you don't like it after 30 days, you can easily switch back.
  - *Action*: Decide quickly! Don't spend weeks overthinking—try a small test today.
- **🚪🔒 Hard to Undo (One-Way Doors)**:
  - High risk. Once you sign the contract, quit your job, or take a loan, it's very expensive to undo.
  - *Action*: Slow down. Double check the facts and make sure you have a backup plan.

#### The Best Sweet Spot:
Look for options with **High Upside + Easy to Undo**. That gives you big potential rewards with very little downside risk!"""

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
                return f"""### ✦ Comparing: {opt_a.title()} vs. {opt_b.title()}

Here is a simple, head-to-head comparison to help you choose:

---

#### 1. {opt_a.title()}:
- **Good points (Pros)**: More freedom, lower day-to-day costs, and faster feedback. You stay in control.
- **Things to watch out for (Cons)**: Requires more self-discipline, and growth can take time.
- **Can you undo it?**: Yes, this is usually **easy to undo**. You can try it and switch later.

#### 2. {opt_b.title()}:
- **Good points (Pros)**: More resources, bigger brand name or pay, and established structure.
- **Things to watch out for (Cons)**: Less personal freedom, more meetings/rules, and harder to back out once you sign.
- **Can you undo it?**: Harder to undo once committed.

---

#### Simple Recommendation:
- If you want **freedom, fast learning, and low risk**, pick **{opt_a.title()}**.
- If you want **stability, bigger guaranteed resources, or brand pedigree**, pick **{opt_b.title()}**.

Which of these two matters more to you right now: freedom or stability?"""

            if decision and is_specifically_about_decision:
                alt_section = ""
                if d_alt:
                    alt_section = f"""
#### Why "{d_alt}" was ranked second:
While **{d_alt}** is a solid backup option, it takes longer to get results and is harder to undo if you change your mind later."""

                return f"""### ✦ Why "{d_rec}" is the Recommended Option

**Top Choice**: **{d_rec}** (Score: {int((decision.decision_score if decision else 82))} / 100)

---

#### 3 Simple Reasons Why This Option Won:
1. **Best Match for Your Goal**:
   - It directly moves you closer to *" {user_goal} "* with the highest score.
2. **Lower Risk & Fast to Start**:
   - You can start right away without needing institutional permission or taking on high financial debt.
3. **Easy to Undo (Low Switching Cost)**:
   - If you test this for 30–60 days and change your mind, you can easily pivot without losing your foundation.
{alt_section}

---

#### Simple Next Steps:
1. **Step 1 (Days 1–7)**: Take one small, concrete step in **{d_rec}** (e.g. build a small prototype or start a draft).
2. **Step 2 (Days 8–30)**: Review your progress. If it's working well, commit fully!"""
            else:
                return f"""### ✦ Simple Comparison & Trade-Offs

Regarding: **"{question}"**

---

#### How to Pick Between Your Options:
1. **Look at the downside first**: Ask yourself, *"If this fails completely, will I be okay?"* Always protect your emergency savings and peace of mind.
2. **Check how easy it is to undo**: Can you test this for 30 days and quit if you hate it? If yes, it's a safe bet to try.
3. **Pick the one with clear next steps**: The best option is usually the one you can start working on today.

What two options are you deciding between?"""

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
                return f"""### ✦ How to Unstick Your Decision on: "{d_title}"

Feeling stuck is completely normal. Usually it happens when we treat a simple choice as a huge, permanent life trap.

---

#### 3 Simple Rules to Stop Overthinking:
1. **You Don't Need to Decide Forever**:
   - Choosing **{d_rec}** isn't a 5-year prison sentence. It's just your focus for the next 2 to 4 weeks.
2. **Action Beats Overthinking**:
   - Thinking more won't give you new information. Taking one small action will immediately show you if you like it.
3. **Your 14-Day Micro-Test**:
   - Give yourself permission to test **{d_rec}** for just 14 days. If it feels right, keep going. If not, switch to **{d_alt or 'another option'}** with zero guilt.

What is one tiny step you can take today to test this?"""
            else:
                return f"""### ✦ How to Overcome Decision Paralysis

When you feel confused or stuck on: **"{question}"**

---

#### 3 Easy Rules to Get Unstuck:
1. **Ask: "Can I undo this?"**:
   - If you can change your mind in a month without losing everything, stop overthinking and just try it.
2. **The 70% Rule**:
   - If you wait until you are 100% sure, you will wait forever. Once you have ~70% of the facts, make the call.
3. **Run a 2-Week Trial**:
   - Don't commit to a whole year. Commit to 14 days. Reality will teach you faster than your head can.

What is the biggest thing you are worried might go wrong?"""

        # Intent 7.5: SPECIFIC DECISION INQUIRY (When user explicitly asks about the active dilemma)
        elif is_specifically_about_decision:
            options_summary = "\n".join([f"- **{o}**" for o in options_titles[:4]]) if options_titles else f"- **{d_rec}**"
            return f"""### ✦ Summary of Your Dilemma: "{d_title}"

Here is where your decision stands in plain, clear terms:

---

#### 1. What You Are Choosing Between:
{options_summary}

#### 2. The Current Winner: **{d_rec}**
- **Why it leads**: It has the highest match for your main goal with the least upfront friction.
- **Key advantage**: You can start testing it right now without taking on big permanent risks.

#### 3. Recommended Next Step:
Spend the next 7 days testing the first step of **{d_rec}**. Check your progress at the end of the week before making any big commitments.

---
*Tip: Click **AI Council** in the dock to see comments from all 7 advisors, or click **⚔️ Red Team** to check for blind spots.*"""

        # Intent 8: GENERAL COMPARISON (X vs Y)
        elif any(w in q_lower for w in [" vs ", " versus ", " or ", "compare ", "difference between"]):
            return f"""### ✦ Comparing Your Options Simply

Evaluating: **"{question}"**

---

#### How to Decide Between Option A and Option B:
1. **Option A (The Agile / Fast Path)**:
   - Best when you want immediate results, lower initial costs, and freedom to change your mind.
2. **Option B (The Established / Structured Path)**:
   - Best when you have plenty of time and budget, and want higher security or an established brand.

#### The Golden Rule:
Pick the option that gives you real results within 30 days while keeping your risks low.

Would you like to put these two options into FlowMind to compare them side-by-side?"""

        # Intent 9: ACTIONABLE ADVICE, ROADMAP & HOW-TO
        elif any(w in q_lower for w in ["how to", "how do i", "tips for", "advice on", "best way to", "guide", "steps to", "suggest"]):
            return f"""### ✦ Practical Advice & Next Steps

Regarding: **"{question}"**

---

#### 3 Simple Rules to Follow:
1. **Pick One Clear Priority**: Focus on the single most important goal right now (e.g. learning, income, or saving time).
2. **Start Small (Low Risk)**: Test your idea with a 14-day experiment before spending big money or quitting your current routine.
3. **Measure Real Results**: Check whether people actually use or pay for what you built, or whether your skills actually improved.

#### Simple 3-Step Action Plan:
- **Step 1**: Write down the exact first action you need to take today.
- **Step 2**: Block out 1 hour on your calendar to finish it.
- **Step 3**: Check your results and decide what to do next.

What specific goal do you want to tackle first?"""

        # Intent 10: GENERAL CHATBOT RESPONSE (Direct, Helpful, Conversational)
        else:
            return f"""### ✦ FlowMind AI

Regarding your question: **"{question}"**

---

Here is a straightforward, practical way to look at this:

1. **Keep it simple**: Focus on the 1 or 2 things that actually matter most to you, and ignore the rest of the noise.
2. **Check the downside**: Make sure the worst-case scenario is safe and manageable before you move forward.
3. **Take a small test step**: Don't try to solve the next 5 years today. Take one concrete step this week and see where it leads.

---

Feel free to ask a follow-up question, or tell me what choices you're comparing!"""

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
