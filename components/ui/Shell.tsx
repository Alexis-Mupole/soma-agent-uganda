'use client';

import React from 'react';
import { SchoolInfo, UserProfile } from '@/types';
import Icon, { IconName } from './Icon';
import Logo from './Logo';

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  short?: string;
}

interface AppShellProps {
  roleLabel: string;
  nav: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  user: UserProfile;
  school: SchoolInfo;
  onLogout: () => void;
  children: React.ReactNode;
  aside?: React.ReactNode;
  assistant?: React.ReactNode;
  accent?: 'gold' | 'green' | 'blue';
}

const accents = {
  gold: 'from-crane-yellow-300 to-crane-yellow text-uni-blue',
  green: 'from-leaf-green-400 to-leaf-green-600 text-white',
  blue: 'from-uni-blue-500 to-uni-blue-700 text-white',
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const AppShell: React.FC<AppShellProps> = ({
  roleLabel,
  nav,
  active,
  onNavigate,
  user,
  school,
  onLogout,
  children,
  aside,
  assistant,
  accent = 'gold',
}) => {
  const activeItem = nav.find((item) => item.id === active);

  return (
    <div className="min-h-dvh bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col overflow-hidden bg-uni-blue-950 text-slate-300 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-70" />
        <div className="relative flex h-full flex-col px-5 py-6">
          <div className="px-2">
            <Logo variant="dark" subtitle={school.name} />
          </div>

          <div className="mt-8 flex items-center gap-2 px-2">
            <span className="badge-dark">{roleLabel}</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-green shadow-[0_0_8px_rgba(18,183,106,0.9)]" />
              Live
            </span>
          </div>

          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pb-4 scrollbar-slim">
            {nav.map((item) => {
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={18} className={isActive ? 'text-crane-yellow' : 'text-slate-500'} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <Icon name="chevron-right" size={14} className="text-white/40" />}
                </button>
              );
            })}
          </nav>

          {aside}

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-[13px] font-extrabold ${accents[accent]}`}
              >
                {initials(user.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">{user.fullName}</p>
                <p className="truncate text-[10px] font-medium text-slate-500">{user.email || roleLabel}</p>
              </div>
              <button
                onClick={onLogout}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-red-300"
                aria-label="Sign out"
                title="Sign out"
              >
                <Icon name="logout" size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo size="sm" subtitle={activeItem?.label || roleLabel} />
        <div className="flex items-center gap-2">
          <button onClick={onLogout} className="icon-btn h-9 w-9" aria-label="Sign out">
            <Icon name="logout" size={16} />
          </button>
          <div
            className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-[11px] font-extrabold ${accents[accent]}`}
          >
            {initials(user.fullName)}
          </div>
        </div>
      </header>

      <main className="lg:pl-[268px]">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-12 md:pt-9">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-stretch justify-around px-2 py-1.5">
          {nav.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors ${
                  isActive ? 'text-uni-blue' : 'text-slate-400'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={item.icon} size={20} filled={isActive} />
                <span className="text-[9px] font-bold uppercase tracking-[0.08em]">
                  {item.short || item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {assistant}
    </div>
  );
};

export default AppShell;
