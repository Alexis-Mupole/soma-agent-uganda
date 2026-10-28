'use client';

import React from 'react';
import Icon, { IconName } from './Icon';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, description, actions }) => (
  <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      {eyebrow && (
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-crane-yellow" />
          <p className="eyebrow text-slate-400">{eyebrow}</p>
        </div>
      )}
      <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-uni-blue sm:text-[32px]">
        {title}
      </h1>
      {description && <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
  </div>
);

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, actions }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="font-display text-lg font-bold tracking-tight text-uni-blue">{title}</h2>
      {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'layers', title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-300">
      <Icon name={icon} size={24} />
    </div>
    <p className="mt-4 font-display text-sm font-bold text-uni-blue">{title}</p>
    {description && <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default PageHeader;
