'use client';

import React from 'react';
import { MasteryStatus, SyllabusNode } from '@/types';
import Icon from './ui/Icon';

interface MasteryMapProps {
  nodes?: SyllabusNode[];
  onPractice?: (node: SyllabusNode) => void;
}

const statusMeta: Record<MasteryStatus, { label: string; badge: string; dot: string; icon: 'check' | 'bolt' | 'lock' }> = {
  [MasteryStatus.MASTERED]: {
    label: 'Secure',
    badge: 'bg-leaf-green/10 text-leaf-green-800',
    dot: 'bg-leaf-green text-white',
    icon: 'check',
  },
  [MasteryStatus.IN_PROGRESS]: {
    label: 'In progress',
    badge: 'bg-crane-yellow/20 text-crane-yellow-800',
    dot: 'bg-crane-yellow text-uni-blue',
    icon: 'bolt',
  },
  [MasteryStatus.LOCKED]: {
    label: 'Locked',
    badge: 'bg-slate-100 text-slate-400',
    dot: 'bg-white text-slate-300 ring-1 ring-slate-200',
    icon: 'lock',
  },
};

const FALLBACK: SyllabusNode[] = [
  { id: 'unit-1', title: 'Cell Biology', subject: 'Biology', status: MasteryStatus.MASTERED, order: 1, progress: 92, description: 'Organelles, cell specialisation and microscopy' },
  { id: 'unit-2', title: 'Plant Nutrition', subject: 'Biology', status: MasteryStatus.MASTERED, order: 2, progress: 86, description: 'Photosynthesis, limiting factors and leaf structure' },
  { id: 'unit-3', title: 'Human Transport', subject: 'Biology', status: MasteryStatus.IN_PROGRESS, order: 3, progress: 45, description: 'Blood, the heart and double circulation' },
  { id: 'unit-4', title: 'Coordination', subject: 'Biology', status: MasteryStatus.LOCKED, order: 4, progress: 0, description: 'Nervous system, reflexes and hormones' },
  { id: 'unit-5', title: 'Homeostasis', subject: 'Biology', status: MasteryStatus.LOCKED, order: 5, progress: 0, description: 'Temperature, glucose and water balance' },
];

export const MasteryMap: React.FC<MasteryMapProps> = ({ nodes, onPractice }) => {
  const list = nodes && nodes.length ? nodes : FALLBACK;

  return (
    <div className="relative">
      <span className="absolute bottom-6 left-[19px] top-6 w-px bg-slate-200" aria-hidden="true" />
      <div className="space-y-3">
        {list.map((node) => {
          const meta = statusMeta[node.status] ?? statusMeta[MasteryStatus.LOCKED];
          const locked = node.status === MasteryStatus.LOCKED;
          const progress = node.progress ?? (node.status === MasteryStatus.MASTERED ? 100 : 0);

          return (
            <div key={node.id} className="relative flex gap-4">
              <div className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full text-[11px] font-extrabold shadow-sm ${meta.dot}`}>
                {node.status === MasteryStatus.MASTERED ? <Icon name="check" size={15} /> : node.status === MasteryStatus.IN_PROGRESS ? <Icon name="bolt" size={15} /> : <span>{node.order}</span>}
              </div>

              <div
                className={`flex flex-1 flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 sm:flex-row sm:items-center ${
                  locked
                    ? 'border-slate-100 bg-slate-50/50'
                    : 'border-slate-200/80 bg-white hover:border-uni-blue/20 hover:shadow-soft'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-display text-[13.5px] font-bold ${locked ? 'text-slate-400' : 'text-uni-blue'}`}>
                      {node.title}
                    </h3>
                    <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{node.subject}</span>
                  </div>
                  {node.description && (
                    <p className={`mt-1 text-[11.5px] leading-relaxed ${locked ? 'text-slate-400' : 'text-slate-500'}`}>
                      {node.description}
                    </p>
                  )}
                  {!locked && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="progress-track h-1.5 max-w-[220px] flex-1">
                        <div
                          className={node.status === MasteryStatus.MASTERED ? 'progress-fill-green' : 'progress-fill-gold'}
                          style={{ width: `${Math.max(4, progress)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{progress}%</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={locked}
                  onClick={() => onPractice?.(node)}
                  className={`btn btn-sm shrink-0 self-start sm:self-auto ${
                    locked
                      ? 'pointer-events-none bg-slate-100 text-slate-400'
                      : node.status === MasteryStatus.MASTERED
                        ? 'btn-secondary'
                        : 'btn-gold'
                  }`}
                >
                  {locked ? (
                    <>
                      <Icon name="lock" size={12} /> Locked
                    </>
                  ) : (
                    <>
                      <Icon name="play" size={12} /> {node.status === MasteryStatus.MASTERED ? 'Review' : 'Practise'}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mt-4 flex items-center gap-4">
        <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-uni-blue-950 text-crane-yellow shadow-sm">
          <Icon name="award" size={15} />
        </div>
        <div className="flex-1 rounded-2xl bg-uni-blue-950 px-4 py-3 text-white">
          <p className="text-[11.5px] font-bold">O-Level Biology complete</p>
          <p className="text-[10px] text-slate-400">Finish every unit at 80%+ to unlock your mastery certificate.</p>
        </div>
      </div>
    </div>
  );
};

export default MasteryMap;
