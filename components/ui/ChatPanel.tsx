'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/types';
import Icon from './Icon';
import Markdown from './Markdown';

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  schoolName: string;
  userName?: string;
  context?: string;
  onPractice?: (topic: string) => void;
}

const greeting = (name?: string, school?: string) => `### Salama${name ? `, ${name.split(' ')[0]}` : ''}

I am **Soma**, your AI study partner${school ? ` at ${school}` : ''}. Ask me to explain a concept, work through a past-paper question, or quiz you on any NCDC unit.

**Try one of these to begin**
- *Explain photosynthesis for Senior 2*
- *Quiz me on quadratics*
- *Summarise my progress this week*

> Tip: tell me your class and subject so I can pitch the answer at the right level.`;

export const ChatPanel: React.FC<ChatPanelProps> = ({
  open,
  onClose,
  schoolName,
  userName,
  context = '',
  onPractice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<'gemini' | 'demo'>('demo');
  const [suggestions, setSuggestions] = useState<string[]>([
    'Explain cell biology',
    'Quiz me on Biology',
    'What should I revise today?',
  ]);
  const [topic, setTopic] = useState('Biology');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setMessages((prev) =>
        prev.length
          ? prev
          : [{ role: 'assistant', content: greeting(userName, schoolName), createdAt: Date.now() }]
      );
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open, userName, schoolName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: 'user', content: text, createdAt: Date.now() }]);
    setInput('');
    setTyping(true);
    setSuggestions([]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: `${context}${context ? '\n' : ''}School: ${schoolName}. Learner: ${userName || 'Student'}.`,
          studentName: userName,
          history,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || 'I could not reach the tutor. Please try again.',
          mode: data.mode,
          createdAt: Date.now(),
        },
      ]);
      setMode(data.mode === 'gemini' ? 'gemini' : 'demo');
      if (Array.isArray(data.suggestions) && data.suggestions.length) setSuggestions(data.suggestions);
      if (typeof data.topic === 'string' && data.topic) setTopic(data.topic);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not reach the tutor just now. Check your connection and send that again — your conversation is kept.',
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const reset = () => {
    setMessages([{ role: 'assistant', content: greeting(userName, schoolName), createdAt: Date.now() }]);
    setSuggestions(['Explain cell biology', 'Quiz me on Biology', 'What should I revise today?']);
    setTopic('Biology');
    setInput('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        aria-label="Close study assistant"
        onClick={onClose}
        className="absolute inset-0 bg-uni-blue-950/40 backdrop-blur-[2px] animate-fade-in"
      />

      <section className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl animate-scale-in sm:inset-y-4 sm:right-4 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[440px] sm:rounded-[28px] sm:border sm:border-slate-200">
        {/* Header */}
        <header className="relative shrink-0 overflow-hidden bg-uni-blue-950 px-5 pb-4 pt-5 text-white">
          <div className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-80" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-crane-yellow-300 to-crane-yellow text-uni-blue shadow-[0_8px_20px_-8px_rgba(245,197,66,0.9)]">
                <Icon name="sparkles" size={22} />
              </div>
              <div>
                <h2 className="font-display text-[15px] font-bold leading-tight text-white">Soma AI</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf-green shadow-[0_0_6px_rgba(18,183,106,0.9)]" />
                  {mode === 'gemini' ? 'Gemini online' : 'Offline tutor ready'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Start a new conversation"
                title="New conversation"
              >
                <Icon name="refresh" size={16} />
              </button>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close assistant"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-surface px-4 py-5 scrollbar-slim">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-uni-blue text-crane-yellow">
                  <Icon name="sparkles" size={13} />
                </div>
              )}
              <div
                className={`max-w-[86%] rounded-2xl px-4 py-3 text-[13px] shadow-sm ${
                  message.role === 'user'
                    ? 'rounded-br-md bg-uni-blue text-white'
                    : 'rounded-tl-md border border-slate-200/70 bg-white'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Markdown content={message.content} compact />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-uni-blue text-crane-yellow">
                <Icon name="sparkles" size={13} />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-slate-200/70 bg-white px-4 py-3.5 shadow-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uni-blue/40 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uni-blue/60 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uni-blue/80" />
                <span className="ml-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Soma is thinking</span>
              </div>
            </div>
          )}

          {!typing && suggestions.length > 0 && messages.length > 0 && (
            <div className="flex flex-wrap gap-2 pl-9">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-[11px] font-semibold text-slate-500 transition-all hover:border-uni-blue/30 hover:text-uni-blue"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-slate-200/80 bg-white px-3 pb-3 pt-3">
          {onPractice && (
            <button
              onClick={() => onPractice(topic)}
              className="mb-2.5 flex w-full items-center justify-between rounded-xl bg-crane-yellow/15 px-3 py-2 text-left text-[11px] font-bold text-uni-blue transition-colors hover:bg-crane-yellow/25"
            >
              <span className="inline-flex items-center gap-2">
                <Icon name="target" size={14} /> Practice this topic
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-crane-yellow-800">
                {topic.replace(/-/g, ' ')} <Icon name="arrow-right" size={12} />
              </span>
            </button>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-1.5 transition-all focus-within:border-uni-blue/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-uni-blue/[0.06]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask Soma anything about your syllabus…"
              className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[13px] font-medium text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-uni-blue text-white transition-all hover:bg-uni-blue-800 disabled:opacity-40"
              aria-label="Send message"
            >
              <Icon name="send" size={17} />
            </button>
          </div>
          <p className="mt-2 text-center text-[9px] font-medium text-slate-400">
            Soma AI can make mistakes — check important answers with your teacher.
          </p>
        </div>
      </section>
    </div>
  );
};

interface LauncherProps {
  onClick: () => void;
  hidden?: boolean;
  label?: string;
}

export const AssistantLauncher: React.FC<LauncherProps> = ({ onClick, hidden, label = 'Ask Soma' }) => {
  if (hidden) return null;
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-uni-blue py-3 pl-3 pr-4 text-white shadow-[0_16px_40px_-12px_rgba(10,42,67,0.8)] transition-all hover:-translate-y-0.5 hover:bg-uni-blue-800 lg:bottom-7 lg:right-7"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-crane-yellow text-uni-blue">
        <Icon name="sparkles" size={18} />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em]">{label}</span>
    </button>
  );
};

export default ChatPanel;
