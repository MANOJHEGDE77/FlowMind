# FlowMind — AI-Powered Thinking & Mind Flow Platform

<div align="center">

**Turn thoughts into structured flow.**

*An AI-powered thinking, learning, planning, and productivity platform visually communicating the flow of a human mind — connected, expandable, dynamic, intelligent, and alive.*

[![GitHub Repository](https://img.shields.io/badge/GitHub-MANOJHEGDE77%2FFlowMind-181717?style=flat&logo=github&logoColor=white)](https://github.com/MANOJHEGDE77/FlowMind)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 1. Executive Summary

Traditional productivity apps force thoughts into flat lists, isolated cards, or generic SaaS dashboards. LLM chatbots generate unstructured text bubbles that get lost in infinite chat histories.

**FlowMind** is a new category of **visual thinking and cognitive productivity workspace**. It turns raw thoughts into structured, living graphs where:
- **Core Thoughts** anchor strategic direction
- **Ideas & Sub-branches** expand and connect across domains
- **Decisions** evaluate trade-offs and bifurcations
- **Tasks** emerge directly connected to their parent thoughts
- **Progress** flows back into the living mind map

---

## 2. Core Capabilities

### 🌌 1. Command Center & Thought Capture
- **Universal Thought Capture**: Enter unstructured thoughts, goals, or problems via keyboard or voice.
- **Quick Capture Chips**: One-click generation for common workflows:
  - *"Plan my project"*
  - *"Study Computer Networks"*
  - *"Prepare for interview"*
  - *"Build my portfolio"*
  - *"Organize my week"*
- **Cognitive Ecosystem Overview**: High-level telemetry of all connected flows, completion sync rates, and high-leverage focus candidates.

### 🗺️ 2. The Signature Flow Canvas
- **Infinite Interactive Canvas**: Smooth pan, zoom (`40%` to `220%`), and real-time node dragging.
- **Curved Bezier Filaments**: Elegant connections with **animated particles traveling along active paths**.
- **Visual Node Hierarchy**:
  - **Core Thought**: Dominant central anchor with cyan aura and multi-layer depth.
  - **Ideas**: Translucent frosted cards with indigo accents.
  - **Decisions**: Amber-faceted cards representing strategic trade-offs.
  - **Tasks**: Action nodes with direct focus launching.
  - **Results**: High-contrast emerald outcome badges.
- **Living Graph Lighting**: Hovering over any node softly illuminates connected thoughts while fading unrelated nodes.
- **Integrated Minimap & Floating Controls**: Real-time canvas orientation and viewport controls.

### ✦ 3. 4-Stage Progressive AI Generation
Capturing any thought triggers an animated 4-stage neural transition:
1. **Thought Captured**
2. **AI Understanding & Semantic Mapping**
3. **Building Neural Connections**
4. **Flow Generated** with an interactive tree projection preview.

### 📋 4. Thought-Connected Tasks
- **Zero Orphan Tasks**: Every task explicitly displays its parent thought origin:
  `↳ from Java & Distributed Systems Interview`
- **Focus Launch**: One-click transition into deep work directly from any task.
- **Bi-directional Sync**: Completing a task ripples completion status back into the graph.

### ⏳ 5. Distraction-Free Focus Mode
- Full-screen takeover removing all navigation rails and inspector panels.
- Giant futuristic `25:00` countdown timer with ambient breathing halo.
- **Thought Chain Lineage**: Always displays where your current action fits in the bigger picture:
  `Java Interview → Strategic Pillar → Current Action`

### 🧠 6. AI Intelligence & Pattern Observations
- **Structured Intelligence Panels**: Structured intelligence cards instead of endless message bubbles.
- **Autonomous Observations**: Detects thinking patterns, bottlenecks, and cross-flow cognitive linkages.
- **Direct Graph Actions**: `Build Flow`, `Expand Sub-branches`, `Synthesize Strategy`.

### 📚 7. Personal Knowledge Graph (Library)
- Organizes notes, documents, links, and AI summaries linked directly to active flows.
- Visual citation cards connecting verified documentation to real projects and goals.

---

## 3. Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| `1` | Navigate to **Home** (Command Center) |
| `2` | Navigate to **My Flow** (Ecosystem Overview) |
| `3` | Navigate to **Mind Canvas** (Interactive Infinite Canvas) |
| `4` | Navigate to **AI Think** (FlowMind Intelligence) |
| `5` | Navigate to **Tasks** (Thought-Connected Tasks) |
| `6` | Navigate to **Focus** (Distraction-Free 25:00 Session) |
| `7` | Navigate to **Library** (Knowledge Graph) |
| `⌘ + K` / `Ctrl + K` | Global Search & Omni Thought Capture |

---

## 4. Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Clone Repository
```bash
git clone https://github.com/MANOJHEGDE77/FlowMind.git
cd FlowMind
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` to launch FlowMind.

### Backend Setup (Optional API Services)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 5. Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, TailwindCSS 4, Framer Motion, Lucide Icons.
- **Audio Synthesizer**: Custom Web Audio API frequency tone generator for real-time tactical acoustic feedback.
- **State & Persistence**: LocalStorage sync with seamless state hydration in `FlowContext`.
- **Backend**: FastAPI, Pydantic, SQLAlchemy, LangChain / Gemini 1.5 Pro, FAISS vector search.

---

## 6. License

MIT License — see [LICENSE](LICENSE) for details.
