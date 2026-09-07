import React, { useState } from 'react';
import {
  UploadCloud, X, FileText, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

interface DocumentUploaderProps {
  decisionId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  decisionId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadStatus('Extracting text & generating semantic vector chunks...');
      await api.uploadDocument(file, decisionId);
      setUploadStatus('Document successfully processed and indexed into RAG memory!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-space-900 border border-emerald-500/30 rounded-2xl shadow-modal-depth overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Upload Grounding Document
              </h3>
              <p className="text-xs text-emerald-300/80">
                PDF, DOCX, TXT, or CSV for RAG evidence grounding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-space-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone & Form */}
        <div className="p-6 space-y-4">
          <label className="border-2 border-dashed border-space-700 hover:border-emerald-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-space-950/40">
            <FileText className="w-8 h-8 text-slate-500 mb-2" />
            <span className="text-xs font-medium text-slate-200">
              {file ? file.name : 'Click to select or drop document here'}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">
              Supports offer letters, contracts, thesis notes up to 25MB
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="bg-space-850/70 border border-space-750 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 truncate">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate text-slate-200 font-medium">{file.name}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px] shrink-0">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          {uploadStatus && (
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadStatus}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-space-950 font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Document Chunks...</span>
                </>
              ) : (
                <span>Ingest & Vectorize Document</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
