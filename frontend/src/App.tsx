import React, { useState, useEffect } from 'react';
import { ThinkingField } from './components/ThinkingField';
import { FloatingConceptLabels } from './components/FloatingConceptLabels';
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
import { AuthModal } from './pages/AuthPage';
import { EvidenceDropZone } from './components/EvidenceDropZone';
import { ThemeProvider } from './context/ThemeContext';
import { Decision, DecisionListItem, User } from './types';
import { api } from './services/api';

export function AppRoot() {
  const [activeView, setActiveView] = useState<'home' | 'workspace' | 'archive' | 'explore'>('home');
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [recentDecisions, setRecentDecisions] = useState<DecisionListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Live thinking field reactive states
  const [activeInputText, setActiveInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Career Velocity & Learning',
    'Long-Term Equity / Financial Upside',
  ]);
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
      const dec = await api.createDecision(data);
      setCurrentDecision(dec);
      await loadData();
      setIsAnalyzing(false);
      setActiveView('workspace');
    } catch (err: any) {
      setIsAnalyzing(false);
      alert(err.message || 'Analysis failed');
    }
  };

  const handleSelectDecision = async (id: number) => {
    try {
      const dec = await api.getDecision(id);
      setCurrentDecision(dec);
      setActiveView('workspace');
    } catch (err: any) {
      alert('Could not load decision: ' + err.message);
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
    } catch (err: any) {
      setIsAnalyzing(false);
      alert(err.message || 'Clone failed');
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[var(--canvas-bg)] text-[var(--text-vivid)] overflow-hidden">
      {/* 1. Subtle Animated Thinking Field Background with Living Constellation */}
      <ThinkingField
        inputText={activeInputText}
        isAnalyzing={isAnalyzing}
        isInputFocused={isInputFocused}
        selectedPriorities={selectedPriorities}
        hoveredConcept={hoveredConcept}
      />

      {/* 2. Floating Strategic Concept Labels (AMBITION, TRADE-OFFS, VELOCITY, LEVERAGE, OPTIONALITY) */}
      {activeView === 'home' && !isAnalyzing && (
        <FloatingConceptLabels
          onHoverConcept={setHoveredConcept}
          onSelectConcept={(conceptName) => {
            if (!selectedPriorities.includes(conceptName)) {
              setSelectedPriorities([...selectedPriorities, conceptName]);
            }
          }}
        />
      )}

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
        onOpenAuth={() => setIsAuthOpen(true)}
        currentDecision={currentDecision}
        currentUser={currentUser}
      />

      {/* 5. Main Views */}
      <main className="relative z-10 w-full h-full">
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
              className="px-4 py-2 rounded-full bg-sky-400 text-space-950 font-mono text-xs font-semibold"
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
          <div className="py-16">
            <ExplorerPage onLoadDilemma={handleCloneDilemma} />
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
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppRoot />
    </ThemeProvider>
  );
}
