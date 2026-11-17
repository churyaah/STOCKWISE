import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: Toast = { id, type, message, description };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-mono-950 text-mono-0 border border-mono-700 p-4 shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-3 flex items-start gap-3"
          >
            <div className="mt-0.5 flex-shrink-0 text-mono-200">
              {toast.type === 'success' && <CheckCircle2 size={18} strokeWidth={2.5} />}
              {toast.type === 'error' && <AlertCircle size={18} strokeWidth={2.5} />}
              {toast.type === 'info' && <Info size={18} strokeWidth={2.5} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold tracking-tight uppercase text-mono-0">
                {toast.message}
              </p>
              {toast.description && (
                <p className="text-xs text-mono-300 mt-1 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-mono-400 hover:text-mono-0 p-1 transition-colors"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
