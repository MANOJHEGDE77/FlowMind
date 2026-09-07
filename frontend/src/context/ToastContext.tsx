import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 shadow-[0_4px_20px_rgba(16,185,129,0.15)]';
      case 'error':
        return 'border-rose-500/40 shadow-[0_4px_20px_rgba(244,63,94,0.15)]';
      case 'warning':
        return 'border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.15)]';
      default:
        return 'border-cyan-500/40 shadow-[0_4px_20px_rgba(6,182,212,0.15)]';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Glassmorphic Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full select-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between space-x-3 p-3.5 rounded-2xl bg-zinc-950/90 backdrop-blur-2xl border ${getBorderColor(
              toast.type
            )} text-xs font-sans text-slate-200 transition-all animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            <div className="flex items-start space-x-2.5 pt-0.5">
              {getToastIcon(toast.type)}
              <span className="leading-snug text-slate-100">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
