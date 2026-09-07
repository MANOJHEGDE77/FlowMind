import React, { useState, useEffect } from 'react';
import { MinimalNav } from './components/MinimalNav';
import { RaycastCommandPalette } from './components/RaycastCommandPalette';
import { DecisionCoreVisual } from './components/DecisionCoreVisual';
import { ConversationalComposer } from './components/ConversationalComposer';
import { SpatialDecisionCanvas } from './components/SpatialDecisionCanvas';
import { AICouncilVisual } from './components/AICouncilVisual';
import { ChallengeWorkspace } from './components/ChallengeWorkspace';
import { WhatIfLab } from './components/WhatIfLab';
import { ReasoningDrawer } from './components/ReasoningDrawer';
import { EvidenceDropZone } from './components/EvidenceDropZone';
import { ComparisonView } from './components/ComparisonView';
import { AuthModal } from './pages/AuthPage';
import { DecisionLibrary } from './pages/DecisionLibrary';
import { ExplorerPage } from './pages/ExplorerPage';
import { ThemeProvider } from './context/ThemeContext';
import { Decision, DecisionListItem, User } from './types';
import { api } from './services/api';
import { Layers, Sparkles, Swords, SlidersHorizontal, BookOpen } from 'lucide-react';

export function AppContent() {
  const [activeView, setActiveView] = useState<'home' | 'workspace' | 'library' | 'explore'>('home');
  const [workspaceTab, setWorkspaceTab] = useState<'canvas' | 'council'>('canvas');
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [recentDecisions, setRecentDecisions] = useState<DecisionListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals & Panels state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isEvidenceDropOpen, setIsEvidenceDropOpen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<{ type: string; data: any } | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Initial load
  const loadInitialData = async () => {
    try {
      const user = await api.getMe();
      setCurrentUser(user);

      const list = await api.listDecisions();
      setRecentDecisions(list);

      if (list.length > 0 && !currentDecision) {
        const latest = await api.getDecision(list[0].id);
        setCurrentDecision(latest);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectDecision = async (id: number) => {
    try {
      const dec = await api.getDecision(id);
      setCurrentDecision(dec);
      setActiveView('workspace');
    } catch (err: any) {
      alert('Error loading decision: ' + err.message);
    }
  };

  const handleCreateDecision = async (data: {
    title: string;
    context: string;
    options: Array<{ title: string; description?: string }>;
    goals?: Array<{ description: string; priority: string; weight: number }>;
    constraints?: Array<{ description: string; severity: string }>;
  }) => {
    try {
      setIsSubmittingDecision(true);
      const dec = await api.createDecision(data);
      setCurrentDecision(dec);
      await loadInitialData();
      setActiveView('workspace');
    } catch (err: any) {
      alert(err.message || 'Decision synthesis failed');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleCloneFromExplorer = async (prompt: string) => {
    try {
      setIsSubmittingDecision(true);
      const dec = await api.createQuickDecision(prompt);
      setCurrentDecision(dec);
      await loadInitialData();
      setActiveView('workspace');
    } catch (err: any) {
      alert(err.message || 'Could not synthesize template');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased selection:bg-sky-500/30">
      {/* Minimal Header */}
      <MinimalNav
        activeView={activeView}
        onNavigate={setActiveView}
        onNewDecision={() => {
          setCurrentDecision(null);
          setActiveView('home');
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentDecision={currentDecision}
        currentUser={currentUser}
      />

      {/* View Content */}
      <main className="flex-1">
        {/* VIEW 1: HOME (CONVERSATIONAL COMPOSER + DECISION CORE TOPOLOGY) */}
        {activeView === 'home' && (
          <div className="py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-200">
            {/* Header intro */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-sky-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation AI Decision Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Think through any high-stakes choice.
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
                Transform fuzzy thoughts, contracts, and trade-offs into an interactive, stress-tested decision space.
              </p>
            </div>

            {/* Split Grid: Left = Living Composer, Right = Living Decision Core Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <ConversationalComposer
                  onSubmit={handleCreateDecision}
                  isSubmitting={isSubmittingDecision}
                />
              </div>

              <div className="lg:col-span-5">
                <DecisionCoreVisual />
              </div>
            </div>

            {/* Subtle Recent Decisions Strip */}
            {recentDecisions.length > 0 && (
              <div className="pt-6 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  <span>Saved Decision Models</span>
                  <span>{recentDecisions.length} Active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentDecisions.slice(0, 3).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDecision(d.id)}
                      className="p-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-sky-400/50 text-left transition-all group"
                    >
                      <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-sky-400 truncate mb-1">
                        {d.title}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                        <span className="truncate">{d.recommendation || 'In Progress'}</span>
                        <span className="text-emerald-400 font-semibold">{d.confidence_score}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: WORKSPACE (SPATIAL DECISION CANVAS / AI COUNCIL) */}
        {activeView === 'workspace' && currentDecision && (
          <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            {/* Workspace Sub-bar */}
            <div className="h-10 px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => setWorkspaceTab('canvas')}
                  className={`px-3 py-1 rounded-md font-mono text-xs transition-colors flex items-center space-x-1.5 ${
                    workspaceTab === 'canvas'
                      ? 'bg-[var(--bg-surface-elevated)] text-sky-400 font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Spatial Canvas</span>
                </button>

                <button
                  onClick={() => setWorkspaceTab('council')}
                  className={`px-3 py-1 rounded-md font-mono text-xs transition-colors flex items-center space-x-1.5 ${
                    workspaceTab === 'council'
                      ? 'bg-[var(--bg-surface-elevated)] text-purple-400 font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Council ({currentDecision.agent_runs.length})</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEvidenceDropOpen(true)}
                  className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1"
                >
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                  <span>Ground Evidence</span>
                </button>
              </div>
            </div>

            {/* Canvas or Council Area */}
            <div className="flex-1 overflow-hidden relative">
              {workspaceTab === 'canvas' ? (
                <SpatialDecisionCanvas
                  decision={currentDecision}
                  onOpenChallenge={() => setIsChallengeOpen(true)}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                  onOpenComparison={() => setIsComparisonOpen(true)}
                  onOpenEvidence={() => {
                    setSelectedNodeData({
                      type: 'evidence_list',
                      data: {
                        title: 'All Evidence Items',
                        description: 'Grounded document excerpts and verified contractual clauses.',
                      },
                    });
                  }}
                  onSelectNode={(type, data) => setSelectedNodeData({ type, data })}
                />
              ) : (
                <div className="p-6 md:p-8 h-full overflow-y-auto max-w-5xl mx-auto">
                  <AICouncilVisual
                    agents={currentDecision.agent_runs}
                    contradictions={currentDecision.contradictions}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback if on workspace but no decision loaded */}
        {activeView === 'workspace' && !currentDecision && (
          <div className="py-24 text-center space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              No active decision space selected.
            </h2>
            <button
              onClick={() => setActiveView('home')}
              className="px-4 py-2 rounded-xl bg-sky-400 text-space-950 font-medium text-xs shadow-md"
            >
              Compose a Decision Dilemma
            </button>
          </div>
        )}

        {/* VIEW 3: LIBRARY */}
        {activeView === 'library' && (
          <DecisionLibrary
            decisions={recentDecisions}
            onSelectDecision={handleSelectDecision}
            onRefresh={loadInitialData}
          />
        )}

        {/* VIEW 4: EXPLORER */}
        {activeView === 'explore' && (
          <ExplorerPage onLoadDilemma={handleCloneFromExplorer} />
        )}
      </main>

      {/* Global Command Palette */}
      <RaycastCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewDecision={() => {
          setCurrentDecision(null);
          setActiveView('home');
        }}
        onChallenge={() => {
          setIsChallengeOpen(true);
          setActiveView('workspace');
        }}
        onSimulate={() => {
          setIsSimulatorOpen(true);
          setActiveView('workspace');
        }}
        onUploadDoc={() => {
          setIsEvidenceDropOpen(true);
          setActiveView('workspace');
        }}
        onCompare={() => {
          setIsComparisonOpen(true);
          setActiveView('workspace');
        }}
        onNavigate={setActiveView}
        onSelectDecision={handleSelectDecision}
        recentDecisions={recentDecisions}
        hasActiveDecision={Boolean(currentDecision)}
      />

      {/* Contextual Reasoning Drawer */}
      {currentDecision && selectedNodeData && (
        <ReasoningDrawer
          nodeType={selectedNodeData.type}
          nodeData={selectedNodeData.data}
          evidenceItems={currentDecision.evidence_items}
          isOpen={Boolean(selectedNodeData)}
          onClose={() => setSelectedNodeData(null)}
        />
      )}

      {/* Challenge Workspace Modal */}
      {currentDecision && (
        <ChallengeWorkspace
          decision={currentDecision}
          isOpen={isChallengeOpen}
          onClose={() => setIsChallengeOpen(false)}
          onSuccess={(fresh) => {
            setCurrentDecision(fresh);
            loadInitialData();
          }}
        />
      )}

      {/* What-If Lab Modal */}
      {currentDecision && (
        <WhatIfLab
          decision={currentDecision}
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          onSuccess={(fresh) => {
            setCurrentDecision(fresh);
            loadInitialData();
          }}
        />
      )}

      {/* Benchmark Matrix Modal */}
      {currentDecision && (
        <ComparisonView
          decision={currentDecision}
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          onSelectOption={() => {}}
        />
      )}

      {/* Evidence Drop Zone Modal */}
      <EvidenceDropZone
        decisionId={currentDecision?.id}
        isOpen={isEvidenceDropOpen}
        onClose={() => setIsEvidenceDropOpen(false)}
        onSuccess={async () => {
          if (currentDecision) {
            const fresh = await api.getDecision(currentDecision.id);
            setCurrentDecision(fresh);
          }
          await loadInitialData();
        }}
      />

      {/* Auth Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={currentUser}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setCurrentUser(u);
          loadInitialData();
        }}
        onLogout={() => {
          api.logout();
          setCurrentUser(null);
          loadInitialData();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
