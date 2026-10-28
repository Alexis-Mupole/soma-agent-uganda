'use client';

import React, { useEffect } from 'react';
import Icon, { IconName } from './Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: IconName;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  accent?: 'light' | 'gold' | 'green';
  closeOnBackdrop?: boolean;
}

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

const accents = {
  light: 'bg-uni-blue text-white',
  gold: 'bg-gradient-to-br from-crane-yellow-300 to-crane-yellow text-uni-blue',
  green: 'bg-gradient-to-br from-leaf-green-500 to-leaf-green-700 text-white',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = 'md',
  accent = 'light',
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-uni-blue-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl animate-scale-in sm:rounded-[28px] ${sizes[size]}`}
      >
        {(title || icon) && (
          <div className={`flex shrink-0 items-start gap-4 px-6 py-5 sm:px-7 ${accents[accent]}`}>
            {icon && (
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Icon name={icon} size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              {title && <h2 className="font-display text-lg font-bold leading-tight sm:text-xl">{title}</h2>}
              {subtitle && <p className="mt-1 text-xs font-medium opacity-70">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 scrollbar-slim sm:px-7">{children}</div>
        {footer && <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-7">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
