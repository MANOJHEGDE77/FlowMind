import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FlowProvider, useFlow } from './context/FlowContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppNavigationRail, AppView } from './components/AppNavigationRail';
import { AppTopBar } from './components/AppTopBar';
import { ContextualAIInspector } from './components/ContextualAIInspector';
import { AIGenerationModal } from './components/AIGenerationModal';
import { AskAIModal } from './components/AskAIModal';
import { OmniCommand } from './components/OmniCommand';

import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { SignatureFlowCanvas } from './pages/SignatureFlowCanvas';
import { MyFlowPage } from './pages/MyFlowPage';
import { TasksPage } from './pages/TasksPage';
import { FocusPage } from './pages/FocusPage';
import { AIThinkPage } from './pages/AIThinkPage';
import { InsightsPage } from './pages/InsightsPage';
import { LibraryPage } from './pages/LibraryPage';

// Settings & Notification Modals
import { Settings, User, X, Bell, Sparkles, Sliders } from 'lucide-react';
import { soundService } from './services/sound';

const getViewFromHash = (): AppView => {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const validViews: AppView[] = ['landing', 'home', 'canvas', 'ai-think', 'tasks', 'focus', 'insights', 'library', 'flows'];
  if (validViews.includes(hash as AppView)) {
    return hash as AppView;
  }
  if (hash === 'flow') return 'canvas';
  if (hash === 'think') return 'ai-think';
  if (hash === 'act') return 'tasks';
  if (hash === 'directory') return 'flows';
  if (hash === 'workspace') return 'home';
  return 'landing';
};

function FlowMindAppContent() {
  const { showToast } = useToast();
  const {
    activeFlow,
    setActiveFlowId,
    selectedNodeId,
    setSelectedNodeId,
    generateFlowFromPrompt,
    setActiveFocusTask,
  } = useFlow();

  const [activeView, setActiveView] = useState<AppView>(getViewFromHash());
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);
  const [askAIQuestion, setAskAIQuestion] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickPromptOpen, setIsQuickPromptOpen] = useState(false);

  // Sync hash changes (e.g. back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const current = window.location.hash.replace('#', '').toLowerCase();
      if (['modes', 'council', 'dilemmas', 'comparison', 'testimonials', 'faq'].includes(current)) {
        return;
      }
      const newView = getViewFromHash();
      setActiveView(newView);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync activeView to URL hash
  useEffect(() => {
    const current = window.location.hash.replace('#', '').toLowerCase();
    if (activeView === 'landing') {
      if (!['modes', 'council', 'dilemmas', 'comparison', 'testimonials', 'faq', 'landing'].includes(current)) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else {
      if (current !== activeView) {
        window.location.hash = activeView;
      }
    }
  }, [activeView]);

  // Auto-open inspector when a node is selected on canvas
  useEffect(() => {
    if (selectedNodeId && activeView === 'canvas') {
      setIsInspectorOpen(true);
    }
  }, [selectedNodeId, activeView]);

  // Global Keyboard shortcuts: 1..7 for views, ⌘K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickPromptOpen((prev) => !prev);
        return;
      }

      switch (e.key) {
        case '0':
          setActiveView('landing');
          break;
        case '1':
          setActiveView('canvas'); // FLOW
          break;
        case '2':
          setActiveView('ai-think'); // THINK
          break;
        case '3':
          setActiveView('tasks'); // ACT
          break;
        case 'h':
        case 'H':
          setActiveView('home');
          break;
        case 'i':
        case 'I':
          setActiveView('insights');
          break;
        case 'l':
        case 'L':
          setActiveView('library');
          break;
        case 'g':
        case 'G':
          setActiveView('flows');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenCanvasWithFlow = (flowId?: string) => {
    if (flowId) setActiveFlowId(flowId);
    setActiveView('canvas');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#08090D] text-[#F4F5F7] flex flex-col select-none font-sans">
      {/* 4-Stage AI Generation Modal */}
      <AIGenerationModal />

      {/* LANDING PAGE VIEW */}
      {activeView === 'landing' ? (
        <LandingPage
          onGetStarted={() => setActiveView('home')}
          onNavigateToMode={(mode) => setActiveView(mode)}
          onExplore={() => setActiveView('flows')}
          onOpenAskAI={(q) => {
            setAskAIQuestion(q || '');
            setIsAskAIOpen(true);
          }}
          onSelectStarterDilemma={(dilemma) => {
            generateFlowFromPrompt(dilemma.title).then((flow) => {
              if (flow) {
                setActiveFlowId(flow.id);
                setActiveView('canvas');
              }
            });
          }}
        />
      ) : activeView === 'focus' ? (
        /* FOCUS MODE TAKEOVER: full distraction-free screen */
        <FocusPage
          onExitFocus={() => setActiveView('tasks')}
          onOpenCanvas={handleOpenCanvasWithFlow}
        />
      ) : (
        /* STANDARD WORKSPACE SHELL */
        <div className="relative flex-1 flex overflow-hidden">
          {/* LEFT: Navigation Rail */}
          <AppNavigationRail
            activeView={activeView}
            onNavigate={(view) => {
              setActiveView(view);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />

          {/* MAIN COLUMN (TOP BAR + ACTIVE VIEW CONTAINER) */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#08090D]">
            {/* Top Bar */}
            <AppTopBar
              onOpenCommand={() => setIsQuickPromptOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onNewFlow={() => setIsQuickPromptOpen(true)}
              onOpenAIThink={() => setActiveView('ai-think')}
            />

            {/* View Switcher Container */}
            <div className="flex-1 flex min-w-0 h-[calc(100vh-3.25rem)] overflow-hidden relative">
              <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative"
                  >
                    {activeView === 'home' && (
                      <HomePage
                        onNavigateToCanvas={handleOpenCanvasWithFlow}
                        onNavigateToTasks={() => setActiveView('tasks')}
                        onNavigateToFocus={() => setActiveView('focus')}
                      />
                    )}

                    {activeView === 'canvas' && <SignatureFlowCanvas />}

                    {activeView === 'flows' && (
                      <MyFlowPage
                        onOpenCanvas={handleOpenCanvasWithFlow}
                        onNewFlowPrompt={() => setIsQuickPromptOpen(true)}
                      />
                    )}

                    {activeView === 'tasks' && (
                      <TasksPage
                        onStartFocus={(task) => {
                          setActiveFocusTask(task);
                          setActiveView('focus');
                        }}
                        onOpenCanvas={handleOpenCanvasWithFlow}
                      />
                    )}

                    {activeView === 'ai-think' && (
                      <AIThinkPage
                        onOpenCanvas={handleOpenCanvasWithFlow}
                        onGeneratePrompt={async (prompt) => {
                          await generateFlowFromPrompt(prompt);
                          setActiveView('canvas');
                        }}
                      />
                    )}

                    {activeView === 'insights' && (
                      <InsightsPage
                        onOpenCanvas={handleOpenCanvasWithFlow}
                        onNavigateToThink={() => setActiveView('ai-think')}
                      />
                    )}

                    {activeView === 'library' && (
                      <LibraryPage
                        onOpenFlow={(_flowTitle) => {
                          setActiveView('canvas');
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </main>

              {/* RIGHT: Contextual AI Intelligence Panel */}
              {isInspectorOpen && activeView === 'canvas' && (
                <ContextualAIInspector
                  isOpen={isInspectorOpen}
                  onClose={() => setIsInspectorOpen(false)}
                  onAskAI={(initialPrompt) => {
                    setAskAIQuestion(initialPrompt || '');
                    setIsAskAIOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMMAND PALETTE (⌘K) */}
      <AnimatePresence>
        {isQuickPromptOpen && (
          <OmniCommand
            isOpen={isQuickPromptOpen}
            onClose={() => setIsQuickPromptOpen(false)}
            onNavigate={(view) => setActiveView(view)}
            onOpenFlow={(flowId) => handleOpenCanvasWithFlow(flowId)}
            onOpenAskAI={(initialQ) => {
              setAskAIQuestion(initialQ || '');
              setIsAskAIOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* ASK AI MODAL */}
      <AskAIModal
        isOpen={isAskAIOpen}
        onClose={() => setIsAskAIOpen(false)}
        initialQuestion={askAIQuestion}
      />

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F1118] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Sliders size={16} className="text-[#5EE7FF]" />
                  <span>FlowMind Workspace Settings</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-[#686E7C] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="font-semibold text-white block">Interactive Audio Feedback</span>
                    <span className="text-[#686E7C] text-[11px]">Subtle chime and click tones during state changes</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#7C5CFF] w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="font-semibold text-white block">Flow Connection Energy Particles</span>
                    <span className="text-[#686E7C] text-[11px]">Subtle traveling flow dots on bezier lines</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#7C5CFF] w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="font-semibold text-white block">Autonomous Copilot Observer</span>
                    <span className="text-[#686E7C] text-[11px]">Continuous background cross-flow synthesis</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#7C5CFF] w-4 h-4" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold text-xs"
                >
                  Save &amp; Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0F1118] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#5EE7FF] p-0.5 shadow-xl shadow-[#7C5CFF]/20">
                <div className="w-full h-full rounded-full bg-[#08090D] flex items-center justify-center text-xl font-bold text-white">
                  FM
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Cognitive Architect</h3>
                <p className="text-xs text-[#5EE7FF] font-mono">architect@flowmind.ai</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-[#A7ACB8] text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#686E7C]">Workspace:</span>
                  <span className="text-[#45E0A8] font-medium">Active Enterprise</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686E7C]">Synced Mental Models:</span>
                  <span className="text-white">{activeFlow?.nodes.length || 0} Thoughts</span>
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NOTIFICATIONS DRAWER */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              className="w-80 h-full bg-[#0F1118] border-l border-white/[0.08] p-5 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-xs font-semibold text-white flex items-center gap-2">
                    <Bell size={14} className="text-[#5EE7FF]" />
                    <span>COGNITIVE SIGNALS</span>
                  </span>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[#686E7C] hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                    <span className="text-[10px] font-mono text-[#5EE7FF] block uppercase">
                      ✦ Cross-Flow Synergy
                    </span>
                    <p className="text-[#A7ACB8]">
                      Shared concurrency model detected between Java and Autonomous Agent graphs.
                    </p>
                    <span className="text-[10px] text-[#686E7C] font-mono block">10m ago</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                    <span className="text-[10px] font-mono text-[#45E0A8] block uppercase">
                      ✦ Action Resolved
                    </span>
                    <p className="text-[#A7ACB8]">
                      ConcurrentHashMap memory model review sprint finalized.
                    </p>
                    <span className="text-[10px] text-[#686E7C] font-mono block">1h ago</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#A7ACB8] hover:text-white"
              >
                Dismiss All
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <FlowProvider>
          <FlowMindAppContent />
        </FlowProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
