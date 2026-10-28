'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { QuizQuestion } from '@/types';
import Icon from './Icon';
import Modal from './Modal';
import ProgressRing from './ProgressRing';

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  topic: string;
  resourceContent?: string;
  count?: number;
}

type Phase = 'loading' | 'error' | 'question' | 'result';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const QuizModal: React.FC<QuizModalProps> = ({
  open,
  onClose,
  topic,
  resourceContent = '',
  count = 3,
}) => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mode, setMode] = useState<'gemini' | 'demo'>('demo');
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    setPhase('loading');
    setQuestions([]);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, resourceContent, count }),
      });
      if (!res.ok) throw new Error('Quiz request failed');
      const data = await res.json();
      if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error('No questions');
      setQuestions(data.questions as QuizQuestion[]);
      setMode(data.mode === 'gemini' ? 'gemini' : 'demo');
      setPhase('question');
    } catch {
      setPhase('error');
    }
  }, [topic, resourceContent, count]);

  useEffect(() => {
    if (open) load();
  }, [open, attempt, load]);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  const verdict = useMemo(() => {
    if (score >= 80) return { title: 'Excellent mastery', note: 'You can explain this unit confidently. Move on or try a harder set.' };
    if (score >= 50) return { title: 'Getting there', note: 'Good foundation. Re-read the explanations, then repeat the set once more.' };
    return { title: 'Needs another pass', note: 'That is normal. Ask Soma to explain the topic, then come back to this check.' };
  }, [score]);

  const handleCheck = () => {
    if (selected === null || !question) return;
    setChecked(true);
    if (selected === question.correctIndex) setCorrectCount((n) => n + 1);
  };

  const handleNext = () => {
    if (isLast) {
      setPhase('result');
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  };

  const optionClass = (optionIndex: number) => {
    const base =
      'group flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-[13px] font-medium transition-all duration-200';
    if (!checked) {
      return `${base} ${
        selected === optionIndex
          ? 'border-uni-blue bg-uni-blue/[0.04] text-uni-blue shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-uni-blue/30 hover:bg-slate-50'
      }`;
    }
    if (optionIndex === question?.correctIndex) {
      return `${base} border-leaf-green bg-leaf-green/5 text-leaf-green-800`;
    }
    if (optionIndex === selected) {
      return `${base} border-red-200 bg-red-50 text-red-600`;
    }
    return `${base} border-slate-100 bg-white text-slate-400`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Practice check"
      subtitle={topic}
      icon="target"
      accent="gold"
      size="md"
    >
      {phase === 'loading' && (
        <div className="flex flex-col items-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-uni-blue/15 border-t-uni-blue" />
          <p className="mt-4 text-xs font-semibold text-slate-500">Building questions from the NCDC unit…</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">{topic}</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-500">
            <Icon name="alert" size={22} />
          </div>
          <p className="mt-4 font-display text-sm font-bold text-uni-blue">The question bank did not load</p>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">
            Check your connection and try again — the offline bank usually answers instantly.
          </p>
          <div className="mt-5 flex gap-2">
            <button onClick={() => setAttempt((n) => n + 1)} className="btn-primary btn-sm">
              <Icon name="refresh" size={14} /> Try again
            </button>
            <button onClick={onClose} className="btn-ghost btn-sm">
              Close
            </button>
          </div>
        </div>
      )}

      {phase === 'question' && question && (
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex flex-1 gap-1.5">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < index ? 'bg-leaf-green' : i === index ? 'bg-crane-yellow' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {index + 1} / {questions.length}
            </span>
          </div>

          <p className="font-display text-[17px] font-bold leading-snug text-uni-blue">{question.question}</p>

          <div className="mt-5 space-y-2.5">
            {question.options.map((option, i) => (
              <button
                key={i}
                type="button"
                disabled={checked}
                onClick={() => setSelected(i)}
                className={optionClass(i)}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-extrabold ${
                    checked && i === question.correctIndex
                      ? 'bg-leaf-green text-white'
                      : checked && i === selected
                        ? 'bg-red-500 text-white'
                        : selected === i
                          ? 'bg-uni-blue text-white'
                          : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {checked && i === question.correctIndex ? (
                    <Icon name="check" size={12} />
                  ) : checked && i === selected ? (
                    <Icon name="close" size={12} />
                  ) : (
                    LETTERS[i]
                  )}
                </span>
                <span className="flex-1 pt-0.5 leading-snug">{option}</span>
              </button>
            ))}
          </div>

          {checked && (
            <div
              className={`mt-4 flex gap-3 rounded-2xl border p-4 ${
                selected === question.correctIndex
                  ? 'border-leaf-green/20 bg-leaf-green/[0.05]'
                  : 'border-amber-200 bg-amber-50/60'
              }`}
            >
              <Icon
                name={selected === question.correctIndex ? 'check-circle' : 'info'}
                size={17}
                className={selected === question.correctIndex ? 'mt-0.5 shrink-0 text-leaf-green' : 'mt-0.5 shrink-0 text-amber-600'}
              />
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
                  selected === question.correctIndex ? 'text-leaf-green-800' : 'text-amber-700'
                }`}>
                  {selected === question.correctIndex ? 'Correct' : 'Not quite'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{question.explanation}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {mode === 'gemini' ? 'Gemini generated' : 'Offline bank'}
            </span>
            {!checked ? (
              <button onClick={handleCheck} disabled={selected === null} className="btn-primary">
                Check answer <Icon name="arrow-right" size={15} />
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary">
                {isLast ? 'See results' : 'Next question'} <Icon name="arrow-right" size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="flex flex-col items-center py-4 text-center">
          <ProgressRing
            value={score}
            size={132}
            strokeWidth={10}
            color={score >= 80 ? '#12b76a' : score >= 50 ? '#f5c542' : '#ef4444'}
            sublabel="score"
          />
          <p className="mt-5 font-display text-xl font-extrabold text-uni-blue">{verdict.title}</p>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-slate-500">{verdict.note}</p>
          <p className="mt-3 text-xs font-semibold text-slate-400">
            {correctCount} of {questions.length} correct · {topic}
          </p>

          <div className="mt-7 flex w-full flex-col gap-2 sm:flex-row">
            <button
              onClick={() => setAttempt((n) => n + 1)}
              className="btn-secondary flex-1"
            >
              <Icon name="refresh" size={15} /> New set
            </button>
            <button onClick={onClose} className="btn-primary flex-1">
              <Icon name="check" size={15} /> Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default QuizModal;
