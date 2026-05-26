'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: <CheckCircle size={15} className="text-[#0F6E56]" />,
  error: <AlertCircle size={15} className="text-[#991B1B]" />,
  info: <Info size={15} className="text-[#534AB7]" />,
};

const STYLES = {
  success: 'border-[#0F6E56]/20 bg-[#F0FDF4]',
  error: 'border-[#991B1B]/20 bg-[#FEF2F2]',
  info: 'border-[#534AB7]/20 bg-[#EEEDFE]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[10px] border shadow-sm text-sm text-[#1A1917] max-w-xs animate-slide-up ${STYLES[toast.type]}`}
          >
            {ICONS[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="text-[#78756F] hover:text-[#1A1917]">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
