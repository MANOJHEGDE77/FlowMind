import React, { useState, useEffect } from 'react';
import {
  UploadCloud, X, FileText, CheckCircle2,
  RefreshCw, ArrowRight, BookOpen, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface EvidenceDropZoneProps {
  decisionId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EvidenceDropZone: React.FC<EvidenceDropZoneProps> = ({
  decisionId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'extracting' | 'chunking' | 'done'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;

    try {
      setStage('uploading');
      setStatusMessage('Ingesting file payload...');

      setTimeout(() => {
        setStage('extracting');
        setStatusMessage('Extracting text & formatting clauses...');
      }, 500);

      setTimeout(() => {
        setStage('chunking');
        setStatusMessage('Generating 384-dim semantic embeddings & vector nodes...');
      }, 1200);

      await api.uploadDocument(file, decisionId);

      setStage('done');
      setStatusMessage('Evidence grounded into decision topology!');
      showToast(`Grounding completed: ${file.name} attached as verified evidence!`, 'success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStage('idle');
        setFile(null);
      }, 1000);
    } catch (err: any) {
      showToast(err.message || 'Evidence ingestion failed', 'error');
      setStage('idle');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md select-none"
    >
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
              Evidence Ingestion Engine
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropzone & Transformation pipeline */}
        <div className="p-6 space-y-4">
          <label className="border-2 border-dashed border-[var(--border-subtle)] hover:border-emerald-500/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-elevated)]">
            <FileText className="w-9 h-9 text-[var(--text-muted)] mb-2" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {file ? file.name : 'Drop evidence document here'}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 text-center max-w-xs">
              PDF offer letters, contracts, compensation tables, or notes
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Visual Transformation Chain */}
          {stage !== 'idle' && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                <span className="flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusMessage}</span>
                </span>
                <span className="text-[10px] uppercase">{stage}</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleProcessFile}
              disabled={!file || stage !== 'idle'}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-space-950 font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 font-mono"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ground Document as Evidence Node</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
