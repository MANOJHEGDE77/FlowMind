import React, { useState, useEffect } from 'react';
import { ThinkingField } from './components/ThinkingField';
import { AIThinkingState } from './components/AIThinkingState';
import { FloatingNav } from './components/FloatingNav';
import { ThoughtComposer } from './components/ThoughtComposer';
import { SpatialWorkspace } from './components/SpatialWorkspace';
import { AICouncilOrbit } from './components/AICouncilOrbit';
import { SignalMoment } from './components/SignalMoment';
import { RedTeamMode } from './components/RedTeamMode';
import { WhatIfSliders } from './components/WhatIfSliders';
import { ContextInspector } from './components/ContextInspector';
import { DecisionArchive } from './components/DecisionArchive';
import { ExplorerPage } from './pages/ExplorerPage';
import { OmniCommand } from './components/OmniCommand';
import { HelpGuideModal } from './components/HelpGuideModal';
import { AskAIModal } from './components/AskAIModal';
import { AuthModal } from './pages/AuthPage';
import { EvidenceDropZone } from './components/EvidenceDropZone';
import { ExportDecisionModal } from './components/ExportDecisionModal';
import { LandingPage } from './pages/LandingPage';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Decision, DecisionListItem, User } from './types';
import { api } from './services/api';

export function AppRoot() {
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<'landing' | 'home' | 'workspace' | 'archive' | 'explore'>('landing');
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [recentDecisions, setRecentDecisions] = useState<DecisionListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Live thinking field reactive states
  const [activeInputText, setActiveInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Overlays and modals
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCouncilOpen, setIsCouncilOpen] = useState(false);
  const [isSignalOpen, setIsSignalOpen] = useState(false);
  const [isRedTeamOpen, setIsRedTeamOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);
  const [askAIQuestion, setAskAIQuestion] = useState('');
  const [inspectedNode, setInspectedNode] = useState<{ type: string; data: any } | null>(null);

  const loadData = async () => {
    try {
      const user = await api.getMe();
      setCurrentUser(user);

      const list = await api.listDecisions();
      setRecentDecisions(list);

      if (list.length > 0 && !currentDecision) {
        const latest = await api.getDecision(list[0].id);
        setCurrentDecision(latest);
      }
    } catch (e) {
      console.error('Data load error:', e);
    }
  };

  useEffect(() => {
    loadData();

    // Global keyboard shortcut: ⌘/ or Ctrl+/ to toggle Ask AI
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setAskAIQuestion('');
        setIsAskAIOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleCreateDecision = async (data: {
    title: string;
    context: string;
    options: Array<{ title: string; description?: string }>;
    goals?: Array<{ description: string; priority: string; weight: number }>;
    constraints?: Array<{ description: string; severity: string }>;
  }) => {
    try {
      setIsAnalyzing(true);
      let dec;
      if (!data.options || data.options.length === 0) {
        dec = await api.createQuickDecision(data.context || data.title);
      } else {
        dec = await api.createDecision(data);
      }
      setCurrentDecision(dec);
      await loadData();
      setIsAnalyzing(false);
      setActiveView('workspace');
      showToast('Synthesis complete. Welcome to your Decision Space.', 'success');
    } catch (err: any) {
      setIsAnalyzing(false);
      showToast(err.message || 'Analysis failed', 'error');
    }
  };

  const handleSelectDecision = async (id: number) => {
    try {
      const dec = await api.getDecision(id);
      setCurrentDecision(dec);
      setActiveView('workspace');
    } catch (err: any) {
      showToast('Could not load decision: ' + err.message, 'error');
    }
  };

  const handleCloneDilemma = async (prompt: string) => {
    try {
      setIsAnalyzing(true);
      const dec = await api.createQuickDecision(prompt);
      setCurrentDecision(dec);
      await loadData();
      setIsAnalyzing(false);
      setActiveView('workspace');
      showToast('Dilemma launched into workspace!', 'success');
    } catch (err: any) {
      setIsAnalyzing(false);
      showToast(err.message || 'Clone failed', 'error');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--canvas-bg)] text-[var(--text-vivid)] overflow-x-hidden">
      {/* 1. Subtle Animated Thinking Field Background with Living Constellation */}
      <ThinkingField
        inputText={activeInputText}
        isAnalyzing={isAnalyzing}
        isInputFocused={isInputFocused}
        selectedPriorities={selectedPriorities}
        hoveredConcept={hoveredConcept}
      />

      {/* 2. AI Cognitive Thinking State (Concentric rings & dynamic signal emergence) */}

      {/* 3. AI Cognitive Thinking State (Concentric rings & dynamic signal emergence) */}
      <AIThinkingState isAnalyzing={isAnalyzing} />

      {/* 4. Floating Minimal Top Controls & Bottom Command Dock */}
      <FloatingNav
        activeView={activeView}
        onNavigate={setActiveView}
        onNewDecision={() => {
          setCurrentDecision(null);
          setActiveView('home');
        }}
        onOpenCommandPalette={() => setIsCommandOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAskAI={() => {
          setAskAIQuestion('');
          setIsAskAIOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentDecision={currentDecision}
        currentUser={currentUser}
      />

      {/* 5. Main Views */}
      <main className="relative z-10 w-full min-h-screen">
        {/* LANDING: BEST-IN-CLASS ARCHITECTURE & SHOWCASE */}
        {activeView === 'landing' && (
          <LandingPage
            onGetStarted={() => setActiveView('home')}
            onExplore={() => setActiveView('explore')}
            onOpenAskAI={(q) => {
              setAskAIQuestion(q || '');
              setIsAskAIOpen(true);
            }}
            onSelectStarterDilemma={handleCreateDecision}
          />
        )}

        {/* HOME: BORDERLESS LIVING THOUGHT COMPOSER */}
        {activeView === 'home' && (
          <ThoughtComposer
            onSubmit={handleCreateDecision}
            isAnalyzing={isAnalyzing}
            onInputChange={setActiveInputText}
            onFocusChange={setIsInputFocused}
            onPrioritiesChange={setSelectedPriorities}
            recentDecisions={recentDecisions}
            onSelectDecision={handleSelectDecision}
          />
        )}

        {/* WORKSPACE: FULL VIEWPORT SPATIAL CANVAS */}
        {activeView === 'workspace' && currentDecision && (
          <SpatialWorkspace
            decision={currentDecision}
            onOpenChallenge={() => setIsRedTeamOpen(true)}
            onOpenSimulator={() => setIsWhatIfOpen(true)}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onOpenCouncil={() => setIsCouncilOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenAskAI={() => {
              setAskAIQuestion('');
              setIsAskAIOpen(true);
            }}
            onSelectNode={(type, data) => {
              if (type === 'signal') {
                setIsSignalOpen(true);
              } else {
                setInspectedNode({ type, data });
              }
            }}
          />
        )}

        {/* WORKSPACE FALLBACK IF NONE SELECTED */}
        {activeView === 'workspace' && !currentDecision && (
          <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
            <p className="text-xs font-mono text-[var(--text-faint)]">
              No active dilemma loaded.
            </p>
            <button
              onClick={() => setActiveView('home')}
              className="px-4 py-2 rounded-full bg-sky-400 text-slate-950 font-mono text-xs font-bold"
            >
              Start Thinking →
            </button>
          </div>
        )}

        {/* ARCHIVE: TREE TIMELINE OF HUMAN THINKING */}
        {activeView === 'archive' && (
          <DecisionArchive
            decisions={recentDecisions}
            onSelectDecision={handleSelectDecision}
            onRefresh={loadData}
          />
        )}

        {/* EXPLORE: CURATED DILEMMAS */}
        {activeView === 'explore' && (
          <div className="w-full">
            <ExplorerPage
              recentDecisions={recentDecisions}
              onLoadDilemma={handleCloneDilemma}
            />
          </div>
        )}
      </main>

      {/* 4. Full-Screen OmniCommand (⌘K) */}
      <OmniCommand
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNewDecision={() => {
          setCurrentDecision(null);
          setActiveView('home');
        }}
        onChallenge={() => {
          setIsRedTeamOpen(true);
          setActiveView('workspace');
        }}
        onSimulate={() => {
          setIsWhatIfOpen(true);
          setActiveView('workspace');
        }}
        onUploadDoc={() => {
          setIsEvidenceOpen(true);
          setActiveView('workspace');
        }}
        onNavigate={setActiveView}
        onSelectDecision={handleSelectDecision}
        onOpenAskAI={(q) => {
          setAskAIQuestion(q || '');
          setIsAskAIOpen(true);
        }}
        recentDecisions={recentDecisions}
        hasActiveDecision={Boolean(currentDecision)}
      />

      {/* 5. Living AI Council Orbit */}
      {currentDecision && (
        <AICouncilOrbit
          agents={currentDecision.agent_runs}
          contradictions={currentDecision.contradictions}
          isOpen={isCouncilOpen}
          onClose={() => setIsCouncilOpen(false)}
        />
      )}

      {/* 6. The Signal Moment (Climax Reveal) */}
      {currentDecision && (
        <SignalMoment
          decision={currentDecision}
          isOpen={isSignalOpen}
          onClose={() => setIsSignalOpen(false)}
          onChallenge={() => setIsRedTeamOpen(true)}
          onSimulate={() => setIsWhatIfOpen(true)}
          onOpenEvidence={() => setIsEvidenceOpen(true)}
          onExport={() => setIsExportOpen(true)}
          onOpenWhy={() => {
            setInspectedNode({
              type: 'signal',
              data: {
                title: currentDecision.recommendation,
                description: currentDecision.reasoning_summary,
                alignment_scores: currentDecision.options.find(o => o.is_recommended)?.alignment_scores,
              },
            });
          }}
        />
      )}

      {/* 7. ⚔️ Red Team Mode */}
      {currentDecision && (
        <RedTeamMode
          decision={currentDecision}
          isOpen={isRedTeamOpen}
          onClose={() => setIsRedTeamOpen(false)}
          onSuccess={(fresh) => {
            setCurrentDecision(fresh);
            loadData();
          }}
        />
      )}

      {/* 8. What-If Assumption Levers */}
      {currentDecision && (
        <WhatIfSliders
          decision={currentDecision}
          isOpen={isWhatIfOpen}
          onClose={() => setIsWhatIfOpen(false)}
          onSuccess={(fresh) => {
            setCurrentDecision(fresh);
            loadData();
          }}
        />
      )}

      {/* 9. Contextual Node Inspector (Sliding Edge Drawer) */}
      {currentDecision && inspectedNode && (
        <ContextInspector
          nodeType={inspectedNode.type}
          nodeData={inspectedNode.data}
          evidenceItems={currentDecision.evidence_items}
          isOpen={Boolean(inspectedNode)}
          onClose={() => setInspectedNode(null)}
        />
      )}

      {/* 10. Evidence Drop Ingestion */}
      {currentDecision && (
        <EvidenceDropZone
          decisionId={currentDecision.id}
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          onSuccess={async () => {
            const fresh = await api.getDecision(currentDecision.id);
            setCurrentDecision(fresh);
            loadData();
          }}
        />
      )}

      {/* 11. Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={currentUser}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setCurrentUser(u);
          loadData();
        }}
        onLogout={() => {
          api.logout();
          setCurrentUser(null);
          loadData();
        }}
      />

      {/* 12. How FlowMind Works Modal */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onStartDecision={() => {
          setCurrentDecision(null);
          setActiveView('home');
        }}
      />

      {/* 13. Interactive AI Question Answering (Gemini 1.5 Flash / Cognitive Core) */}
      <AskAIModal
        isOpen={isAskAIOpen}
        onClose={() => setIsAskAIOpen(false)}
        decision={currentDecision}
        initialQuestion={askAIQuestion}
      />

      {/* 14. Executive Decision Memo Exporter */}
      <ExportDecisionModal
        decision={currentDecision}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRoot />
      </ToastProvider>
    </ThemeProvider>
  );
}
