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

// Core Pages
import { HomePage } from './pages/HomePage';
import { SignatureFlowCanvas } from './pages/SignatureFlowCanvas';
import { MyFlowPage } from './pages/MyFlowPage';
import { TasksPage } from './pages/TasksPage';
import { FocusPage } from './pages/FocusPage';
import { AIThinkPage } from './pages/AIThinkPage';
import { LibraryPage } from './pages/LibraryPage';

// Settings & Notification Modals
import { Settings, User, X, Bell, Sparkles, CheckCircle2, Shield, Sliders } from 'lucide-react';
import { soundService } from './services/sound';

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

  const [activeView, setActiveView] = useState<AppView>('home');
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);
  const [askAIQuestion, setAskAIQuestion] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickPromptOpen, setIsQuickPromptOpen] = useState(false);
  const [quickPromptVal, setQuickPromptVal] = useState('');

  // Auto-open inspector when a node is selected on canvas
  useEffect(() => {
    if (selectedNodeId && activeView === 'canvas') {
      setIsInspectorOpen(true);
    }
  }, [selectedNodeId, activeView]);

  // Global Keyboard shortcuts: 1..7 for views, ⌘K for search/prompt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
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
        case '1':
          setActiveView('home');
          break;
        case '2':
          setActiveView('flows');
          break;
        case '3':
          setActiveView('canvas');
          break;
        case '4':
          setActiveView('ai-think');
          break;
        case '5':
          setActiveView('tasks');
          break;
        case '6':
          setActiveView('focus');
          break;
        case '7':
          setActiveView('library');
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

  const handleQuickPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPromptVal.trim()) return;
    const prompt = quickPromptVal.trim();
    setQuickPromptVal('');
    setIsQuickPromptOpen(false);
    const created = await generateFlowFromPrompt(prompt);
    if (created) {
      setActiveView('canvas');
      showToast(`Flow "${created.title}" generated!`, 'success');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06080F] text-slate-100 flex flex-col select-none font-sans">
      {/* 4-Stage AI Generation Modal */}
      <AIGenerationModal />

      {/* FOCUS MODE TAKEOVER: full distraction-free screen */}
      {activeView === 'focus' ? (
        <FocusPage
          onExitFocus={() => setActiveView('home')}
          onOpenCanvas={handleOpenCanvasWithFlow}
        />
      ) : (
        /* STANDARD 3-PANEL SHELL */
        <div className="relative flex-1 flex overflow-hidden">
          {/* LEFT: Compact Navigation Rail */}
          <AppNavigationRail
            activeView={activeView}
            onNavigate={(view) => {
              setActiveView(view);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />

          {/* MAIN COLUMN (TOP BAR + ACTIVE VIEW CANVAS) */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#070913]">
            {/* Top Bar */}
            <AppTopBar
              onOpenCommand={() => setIsQuickPromptOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onNewFlow={() => setIsQuickPromptOpen(true)}
              onOpenAIThink={() => setActiveView('ai-think')}
            />

            {/* View Switcher Container */}
            <div className="flex-1 flex min-w-0 h-[calc(100vh-3.5rem)] overflow-hidden relative">
              <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
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

                {activeView === 'library' && (
                  <LibraryPage
                    onOpenFlow={(flowTitle) => {
                      setActiveView('canvas');
                    }}
                  />
                )}
              </main>

              {/* RIGHT: Contextual AI Intelligence Panel */}
              {isInspectorOpen && (
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

      {/* QUICK CAPTURE / ⌘K MODAL */}
      <AnimatePresence>
        {isQuickPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-xl bg-[#0C101F] border border-cyan-500/30 rounded-2xl shadow-2xl p-5 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <Sparkles size={14} />
                  <span>FLOWMIND OMNI COMMAND (⌘K)</span>
                </div>
                <button
                  onClick={() => setIsQuickPromptOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleQuickPromptSubmit} className="space-y-4">
                <input
                  type="text"
                  value={quickPromptVal}
                  onChange={(e) => setQuickPromptVal(e.target.value)}
                  placeholder="Capture a thought, goal, project or problem..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                  autoFocus
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
                  <span>Press [Enter] to generate structured flow</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQuickPromptOpen(false)}
                      className="px-3 py-1.5 rounded-lg hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-semibold shadow-md shadow-cyan-400/20"
                    >
                      Create Flow →
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0D111E] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sliders size={16} className="text-cyan-400" />
                  <span>FlowMind Settings</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 block">Tactical Synthesizer Audio</span>
                    <span className="text-slate-400 text-[11px]">Real-time frequency tones during state transitions</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-cyan-400 w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 block">Living Particle Animation</span>
                    <span className="text-slate-400 text-[11px]">Animated pulses traveling along Bezier connections</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-cyan-400 w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 block">Autonomous Pattern Observation</span>
                    <span className="text-slate-400 text-[11px]">Continuous cognitive bottleneck detection</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-cyan-400 w-4 h-4" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold text-xs"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0D111E] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full rounded-full bg-[#070913] flex items-center justify-center text-xl font-mono font-bold text-white">
                  FM
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Cognitive Architect</h3>
                <p className="text-xs text-cyan-400 font-mono">architect@flowmind.ai</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier:</span>
                  <span className="text-emerald-400 font-semibold">Pro Enterprise Sovereign</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nodes Synced:</span>
                  <span className="text-white">Active</span>
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
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
              className="w-80 h-full bg-[#0A0D1A] border-l border-slate-800 p-5 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <Bell size={14} className="text-cyan-400" />
                    <span>COGNITIVE SIGNALS</span>
                  </span>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 block uppercase">
                      ✦ Autonomous Linking
                    </span>
                    <p className="text-slate-200">
                      Cross-flow connection detected between Java and Agent platforms.
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block">10m ago</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 block uppercase">
                      ✦ Milestone Completed
                    </span>
                    <p className="text-slate-200">
                      ConcurrentHashMap CAS inspection task finalized.
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block">1h ago</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white"
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
