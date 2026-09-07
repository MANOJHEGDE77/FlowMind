import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { WorkspacePage } from './pages/WorkspacePage';
import { LandingPage } from './pages/LandingPage';
import { HistoryPage } from './pages/HistoryPage';
import { AuthModal } from './pages/AuthPage';
import { Decision, DecisionListItem, User } from './types';
import { api } from './services/api';

export function App() {
  const [activeView, setActiveView] = useState<'workspace' | 'landing' | 'history'>('landing');
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [recentDecisions, setRecentDecisions] = useState<DecisionListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initial load
  const loadData = async () => {
    try {
      const user = await api.getMe();
      setCurrentUser(user);

      const list = await api.listDecisions();
      setRecentDecisions(list);

      // If user has existing decisions, load the latest one as default for workspace
      if (list.length > 0 && !currentDecision) {
        const latest = await api.getDecision(list[0].id);
        setCurrentDecision(latest);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectDecision = async (id: number) => {
    try {
      const decision = await api.getDecision(id);
      setCurrentDecision(decision);
      setActiveView('workspace');
    } catch (err: any) {
      alert('Could not load decision: ' + err.message);
    }
  };

  const handleNewDecision = () => {
    setCurrentDecision(null);
    setActiveView('workspace');
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-brand-primary/30">
      {/* Header */}
      <Header
        currentDecision={currentDecision}
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={(v) => setActiveView(v)}
        onNewDecision={handleNewDecision}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingPage onGetStarted={() => setActiveView('workspace')} />
        )}

        {activeView === 'workspace' && (
          <WorkspacePage
            currentDecision={currentDecision}
            recentDecisions={recentDecisions}
            onSelectDecision={handleSelectDecision}
            onDecisionCreated={(dec) => {
              setCurrentDecision(dec);
              loadData();
            }}
            onRefreshDecision={(dec) => {
              setCurrentDecision(dec);
              loadData();
            }}
          />
        )}

        {activeView === 'history' && (
          <HistoryPage
            decisions={recentDecisions}
            onSelectDecision={handleSelectDecision}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewDecision={handleNewDecision}
        onChallenge={() => {
          // Trigger Challenge modal in workspace
          setActiveView('workspace');
        }}
        onSimulate={() => {
          setActiveView('workspace');
        }}
        onUploadDoc={() => {
          setActiveView('workspace');
        }}
        onNavigateHistory={() => setActiveView('history')}
        onSelectDecision={handleSelectDecision}
        recentDecisions={recentDecisions}
        hasActiveDecision={Boolean(currentDecision)}
      />

      {/* Auth Modal */}
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
    </div>
  );
}

export default App;
