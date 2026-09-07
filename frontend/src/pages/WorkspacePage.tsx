import React, { useState } from 'react';
import {
  Sparkles, ArrowRight, Plus, UploadCloud, Target,
  Shield, Layers, Clock, FileText, CheckCircle2,
  RefreshCw, ChevronRight, Swords, SlidersHorizontal, Scale, BookOpen
} from 'lucide-react';
import { Decision, DecisionOption, DecisionListItem } from '../types';
import { DecisionCanvas } from '../components/DecisionCanvas';
import { AgentPanel } from '../components/AgentPanel';
import { ChallengeModal } from '../components/ChallengeModal';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { ComparisonView } from '../components/ComparisonView';
import { EvidenceDrawer } from '../components/EvidenceDrawer';
import { DocumentUploader } from '../components/DocumentUploader';
import { api } from '../services/api';

interface WorkspacePageProps {
  currentDecision: Decision | null;
  recentDecisions: DecisionListItem[];
  onSelectDecision: (id: number) => void;
  onDecisionCreated: (decision: Decision) => void;
  onRefreshDecision: (decision: Decision) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  currentDecision,
  recentDecisions,
  onSelectDecision,
  onDecisionCreated,
  onRefreshDecision,
}) => {
  // New Decision Input state
  const [promptText, setPromptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'canvas' | 'agents'>('canvas');

  // Additional structured elements state (if user adds them)
  const [showOptionsInput, setShowOptionsInput] = useState(false);
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [newOptionText, setNewOptionText] = useState('');

  // Modals state
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isDocUploaderOpen, setIsDocUploaderOpen] = useState(false);
  const [selectedOptionForDetail, setSelectedOptionForDetail] = useState<DecisionOption | null>(null);

  // Quick prompt handler
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    try {
      setIsAnalyzing(true);
      const decision = await api.createQuickDecision(promptText);
      onDecisionCreated(decision);
      setPromptText('');
    } catch (err: any) {
      alert(err.message || 'Failed to analyze decision');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddOptionChip = () => {
    if (newOptionText.trim()) {
      setCustomOptions([...customOptions, newOptionText.trim()]);
      setNewOptionText('');
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: CLEAN FOCUSED INPUT WORKSPACE (When no decision active)
  // -------------------------------------------------------------
  if (!currentDecision) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-6 max-w-4xl mx-auto animate-in fade-in duration-200">
        <div className="flex-1 flex flex-col justify-center my-auto">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-space-900 border border-space-800 text-xs text-brand-primary mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Agent Decision Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
              What are you deciding?
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
              Transform unstructured thoughts, offers, and trade-offs into an interactive, explainable decision space.
            </p>
          </div>

          {/* Focused contextual input box */}
          <form onSubmit={handleQuickSubmit} className="relative w-full mb-6">
            <div className="relative bg-space-900/90 border border-space-750 focus-within:border-brand-primary/70 focus-within:ring-1 focus-within:ring-brand-primary/50 rounded-2xl p-4 shadow-modal-depth transition-all">
              <textarea
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Tell me what's on your mind... e.g. 'Should I accept Job A at a high-growth startup, Job B at BigTech, or pursue higher studies?'"
                className="w-full bg-transparent text-sm md:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleQuickSubmit(e);
                  }
                }}
              />

              {/* Custom Options Chips if added */}
              {customOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-space-800 mt-2">
                  {customOptions.map((opt, i) => (
                    <span
                      key={i}
                      className="text-xs bg-space-800 text-slate-300 px-2 py-0.5 rounded-md border border-space-700 flex items-center space-x-1"
                    >
                      <span>{opt}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-space-800/80 mt-2">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowOptionsInput(!showOptionsInput)}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 bg-space-850 hover:bg-space-800 border border-space-750 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3 text-brand-primary" />
                    <span>Options</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDocUploaderOpen(true)}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 bg-space-850 hover:bg-space-800 border border-space-750 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <UploadCloud className="w-3 h-3 text-emerald-400" />
                    <span>Documents</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPromptText(prev => prev + " [Constraint: must preserve work-life balance]");
                    }}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 bg-space-850 hover:bg-space-800 border border-space-750 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>Constraints</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPromptText(prev => prev + " [Goal: optimize for career velocity]");
                    }}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 bg-space-850 hover:bg-space-800 border border-space-750 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Target className="w-3 h-3 text-sky-400" />
                    <span>Goals</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!promptText.trim() || isAnalyzing}
                  className="flex items-center space-x-1.5 bg-brand-primary hover:bg-sky-400 text-space-950 px-4 py-1.5 rounded-xl font-medium text-xs shadow-md transition-all disabled:opacity-40"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Decision</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sub-input for adding options */}
            {showOptionsInput && (
              <div className="mt-3 p-3 bg-space-900 border border-space-800 rounded-xl flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type an option name (e.g. 'Senior Engineer at Stripe') and press Add..."
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOptionChip(); } }}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddOptionChip}
                  className="px-3 py-1 bg-brand-primary text-space-950 font-medium rounded-lg text-xs"
                >
                  Add Option
                </button>
              </div>
            )}
          </form>

          {/* Example Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 mb-10">
            <span className="font-mono text-[11px] text-slate-600">TRY:</span>
            {[
              "Job Offer A (Series B) vs Job Offer B (Public Tech) vs Masters Degree",
              "Relocate to San Francisco vs Stay in New York Remote",
              "Bootstrap SaaS with personal savings vs Raise Seed Round from VC"
            ].map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPromptText(ex)}
                className="bg-space-900/60 hover:bg-space-850 hover:text-slate-300 border border-space-800 px-3 py-1 rounded-full transition-colors text-left truncate max-w-xs md:max-w-none"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Subtle Recent Decisions Drawer Below */}
        {recentDecisions.length > 0 && (
          <div className="pt-6 border-t border-space-800/80">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">
              <span>Recent Decision Models</span>
              <span>{recentDecisions.length} Saved</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentDecisions.slice(0, 3).map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDecision(d.id)}
                  className="p-3 rounded-xl bg-space-900/60 hover:bg-space-850 border border-space-800 hover:border-space-700 text-left transition-all group"
                >
                  <div className="text-xs font-medium text-slate-200 group-hover:text-brand-primary truncate mb-1">
                    {d.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="truncate">{d.recommendation || 'Analyzing'}</span>
                    <span className="text-brand-primary">{d.confidence_score}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Document Uploader Modal */}
        <DocumentUploader
          isOpen={isDocUploaderOpen}
          onClose={() => setIsDocUploaderOpen(false)}
          onSuccess={() => {}}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: ACTIVE DECISION SPACE WORKSPACE
  // -------------------------------------------------------------
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-space-950 overflow-hidden">
      {/* Sub-header navigation tabs */}
      <div className="h-10 px-4 border-b border-space-800 bg-space-950 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'canvas'
                ? 'bg-space-850 text-brand-primary border border-space-750'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Decision Space Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'agents'
                ? 'bg-space-850 text-brand-primary border border-space-750'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent Council ({currentDecision.agent_runs.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDocUploaderOpen(true)}
            className="text-[11px] font-mono text-slate-400 hover:text-white bg-space-900 border border-space-800 px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1"
          >
            <UploadCloud className="w-3 h-3 text-emerald-400" />
            <span>Attach Evidence</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'canvas' ? (
          <DecisionCanvas
            decision={currentDecision}
            onOpenChallenge={() => setIsChallengeOpen(true)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenComparison={() => setIsComparisonOpen(true)}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onSelectOption={(opt) => setSelectedOptionForDetail(opt)}
          />
        ) : (
          <div className="p-6 h-full overflow-y-auto max-w-5xl mx-auto">
            <AgentPanel agents={currentDecision.agent_runs} />
          </div>
        )}
      </div>

      {/* Interactive Modals */}
      <ChallengeModal
        decision={currentDecision}
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        onSuccess={onRefreshDecision}
      />

      <WhatIfSimulator
        decision={currentDecision}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSuccess={onRefreshDecision}
      />

      <ComparisonView
        decision={currentDecision}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onSelectOption={(opt) => setSelectedOptionForDetail(opt)}
      />

      <EvidenceDrawer
        evidence={currentDecision.evidence_items}
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        onUploadNew={() => setIsDocUploaderOpen(true)}
      />

      <DocumentUploader
        decisionId={currentDecision.id}
        isOpen={isDocUploaderOpen}
        onClose={() => setIsDocUploaderOpen(false)}
        onSuccess={async () => {
          const fresh = await api.getDecision(currentDecision.id);
          onRefreshDecision(fresh);
        }}
      />
    </div>
  );
};
