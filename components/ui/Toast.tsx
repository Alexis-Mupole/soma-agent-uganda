'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from './Icon';

type ToastTone = 'success' | 'error' | 'info' | 'gold';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastApi {
  toast: (title: string, options?: { description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => undefined });

const toneStyles: Record<ToastTone, { ring: string; icon: string; bg: string; iconName: 'check-circle' | 'alert' | 'info' | 'sparkles' }> = {
  success: { ring: 'ring-leaf-green/20', icon: 'text-leaf-green bg-leaf-green/10', bg: 'bg-white', iconName: 'check-circle' },
  error: { ring: 'ring-red-200', icon: 'text-red-500 bg-red-50', bg: 'bg-white', iconName: 'alert' },
  info: { ring: 'ring-uni-blue/15', icon: 'text-uni-blue bg-uni-blue/10', bg: 'bg-white', iconName: 'info' },
  gold: { ring: 'ring-crane-yellow/30', icon: 'text-crane-yellow-700 bg-crane-yellow/20', bg: 'bg-white', iconName: 'sparkles' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback<ToastApi['toast']>((title, options) => {
    const id = ++counter.current;
    const item: ToastItem = {
      id,
      title,
      description: options?.description,
      tone: options?.tone || 'success',
    };
    setItems((prev) => [...prev.slice(-3), item]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0">
        {items.map((t) => {
          const s = toneStyles[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-100 p-4 shadow-lift ring-1 ${s.ring} ${s.bg} animate-fade-up`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${s.icon}`}>
                <Icon name={s.iconName} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t.description}</p>}
              </div>
              <button
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-slate-300 transition-colors hover:text-slate-500"
                aria-label="Dismiss notification"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export default ToastProvider;
