'use client';

import React, { useMemo, useState } from 'react';
import { SchoolInfo, UserProfile } from '@/types';
import { ChildSnapshot, linkStudentByCode } from '@/lib/services/databaseService';
import { DEMO_EXAMS, DEMO_MASTERY_BY_SUBJECT, DEMO_WEEKLY } from '@/lib/demo/data';
import AppShell, { NavItem } from './ui/Shell';
import { PageHeader, SectionHeader } from './ui/PageHeader';
import StatCard from './ui/StatCard';
import Icon from './ui/Icon';
import Markdown from './ui/Markdown';
import { useToast } from './ui/Toast';

interface Props {
  onLogout: () => void;
  school: SchoolInfo;
  userProfile: UserProfile;
}

type Tab = 'overview' | 'progress' | 'insights';

const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'home', short: 'Home' },
  { id: 'progress', label: 'Progress', icon: 'chart', short: 'Progress' },
  { id: 'insights', label: 'Guardian insights', icon: 'sparkles', short: 'Insights' },
];

const prettyDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export default function ParentDashboard({ onLogout, school, userProfile }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [code, setCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [child, setChild] = useState<ChildSnapshot | null>(null);
  const [insight, setInsight] = useState('');
  const [generating, setGenerating] = useState(false);

  const weeklyPeak = useMemo(() => Math.max(...DEMO_WEEKLY.map((d) => d.minutes)), []);

  const link = async (value?: string) => {
    const target = (value ?? code).trim();
    if (!target) return;
    setLinking(true);
    setError('');
    const result = await linkStudentByCode(userProfile.id, target);
    if (result.success && result.snapshot) {
      setChild(result.snapshot);
      setCode(target.toUpperCase());
      toast('Child profile linked', { description: `You can now follow ${result.snapshot.name}'s progress.` });
    } else {
      setError('That Soma code was not found. Check the code on your child’s dashboard.');
    }
    setLinking(false);
  };

  const generateInsight = async () => {
    if (!child) return;
    setGenerating(true);
    setInsight('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Summarise ${child.name}'s progress this week as a guardian-friendly report.`,
          context: `Guardian ${userProfile.fullName} at ${school.name}. Child: ${child.name}, ${child.className}. Average ${child.average}%, attendance ${child.attendance}%, rank ${child.rank} of ${child.classSize}, study time ${child.studyMinutes} minutes this week, streak ${child.streak} days. Teacher note: ${child.teacherNote}`,
          studentName: child.name,
        }),
      });
      const data = await res.json();
      setInsight(data.response || 'No insight available right now.');
    } catch {
      toast('Could not generate the report', { description: 'Please try again in a moment.', tone: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const linked = Boolean(child);

  return (
    <AppShell
      roleLabel="Guardian"
      nav={NAV}
      active={tab}
      onNavigate={(id) => setTab(id as Tab)}
      user={userProfile}
      school={school}
      onLogout={onLogout}
      accent="blue"
    >
      <PageHeader
        eyebrow={`${school.name} · Guardian workspace`}
        title={`Salama, ${userProfile.fullName.split(' ')[0]}`}
        description={
          linked
            ? `You are following ${child?.name}. Every number below comes from real practice activity.`
            : 'Link your child once with their Soma code to unlock live progress and teacher notes.'
        }
        actions={
          linked ? (
            <button
              onClick={() => {
                setChild(null);
                setCode('');
                setInsight('');
                toast('Child unlinked', { tone: 'info' });
              }}
              className="btn-secondary"
            >
              <Icon name="link" size={15} /> Change child
            </button>
          ) : undefined
        }
      />

      {!linked && (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="card p-6 sm:p-8">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-crane-yellow/20 text-crane-yellow-800">
              <Icon name="lock" size={22} />
            </div>
            <h2 className="mt-5 font-display text-xl font-extrabold text-uni-blue">Link your child&apos;s profile</h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-slate-500">
              Ask your child to open <span className="font-semibold text-uni-blue">Soma code</span> in the sidebar of their
              dashboard, then enter it below. Codes look like <span className="font-mono font-semibold">SOMA-4821</span>.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && link()}
                placeholder="SOMA-0000"
                className="input font-mono tracking-wider sm:flex-1"
                aria-label="Student Soma code"
              />
              <button onClick={() => link()} disabled={!code.trim() || linking} className="btn-primary sm:w-auto">
                {linking ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Icon name="link" size={15} />}
                {linking ? 'Verifying…' : 'Link child'}
              </button>
            </div>

            {error && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
                <Icon name="alert" size={13} /> {error}
              </p>
            )}

            <button
              onClick={() => link('SOMA-4821')}
              className="mt-5 flex w-full items-center justify-between rounded-2xl border border-crane-yellow/30 bg-crane-yellow/[0.08] px-4 py-3 text-left transition-colors hover:bg-crane-yellow/[0.14]"
            >
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-crane-yellow-800">Demo child</span>
                <span className="mt-0.5 block text-[12.5px] font-semibold text-uni-blue">
                  Amina Nakato · Senior 4 West
                </span>
              </span>
              <Icon name="arrow-right" size={16} className="text-uni-blue" />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { icon: 'chart' as const, title: 'Live mastery, not term-end surprises', copy: 'See exactly which units are secure and which need attention this week.' },
              { icon: 'chat' as const, title: 'Teacher notes in plain language', copy: 'Specific, encouraging guidance from the staff who teach your child.' },
              { icon: 'calendar' as const, title: 'Assessment calendar', copy: 'Know what is coming so revision happens without last-minute panic.' },
            ].map((item) => (
              <div key={item.title} className="card flex gap-3.5 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-uni-blue/5 text-uni-blue">
                  <Icon name={item.icon} size={18} />
                </span>
                <div>
                  <p className="text-[12.5px] font-bold text-uni-blue">{item.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {linked && child && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-uni-blue-500 to-uni-blue-700 text-[13px] font-extrabold text-white">
                {child.name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <p className="font-display text-[14px] font-bold text-uni-blue">{child.name}</p>
                <p className="text-[10.5px] font-medium text-slate-400">
                  {child.className} · {child.code}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-leaf-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-green" /> Attendance {child.attendance}%
            </div>
          </div>

          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <StatCard label="Average score" value={`${child.average}%`} icon="target" tone="green" progress={child.average} hint="Across five subjects" />
                <StatCard label="Class position" value={`${child.rank} of ${child.classSize}`} icon="trophy" tone="gold" hint="Top 15% of the class" />
                <StatCard label="Study time" value={`${(child.studyMinutes / 60).toFixed(1)}h`} icon="clock" tone="blue" hint="This week" trend={`+${child.engagementDelta}% engagement`} />
                <StatCard label="Study streak" value={`${child.streak} days`} icon="flame" tone="rose" hint="Longest this term" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="card p-5 sm:p-6">
                  <SectionHeader title="This week at a glance" description="Minutes of active study, day by day." />
                  <div className="flex h-[180px] items-end gap-2 sm:gap-3">
                    {DEMO_WEEKLY.map((day) => (
                      <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400">{day.minutes}</span>
                        <div className="flex w-full flex-1 items-end">
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-uni-blue-700 to-uni-blue-400 transition-all"
                            style={{ height: `${(day.minutes / weeklyPeak) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-slate-400">{day.day}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 border-t border-slate-100 pt-3.5 text-[11.5px] leading-relaxed text-slate-500">
                    <span className="font-semibold text-uni-blue">Pattern:</span> the strongest sessions happen on Saturday
                    mornings. Protecting that block keeps momentum through the week.
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-uni-blue-950 p-5 text-white sm:p-6">
                  <div className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-80" />
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-crane-yellow">
                        <Icon name="users" size={15} />
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Teacher note</p>
                    </div>
                    <p className="mt-3.5 text-[13px] leading-relaxed text-slate-200">&ldquo;{child.teacherNote}&rdquo;</p>
                    <p className="mt-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-crane-yellow">
                      {child.teacherName} · Biology
                    </p>
                    <button
                      onClick={() =>
                        toast('Message queued for the teacher', {
                          description: `${child.teacherName} will receive it in their staff workspace.`,
                        })
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/10"
                    >
                      <Icon name="send" size={13} /> Reply to teacher
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {DEMO_EXAMS.slice(0, 2).map((exam) => (
                  <div key={exam.id} className="card flex items-center gap-4 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-uni-blue">
                      <Icon name="calendar" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-uni-blue">{exam.title}</p>
                      <p className="mt-0.5 text-[10.5px] text-slate-400">
                        {prettyDate(exam.date)} · {exam.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'progress' && (
            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="card p-5 sm:p-6">
                <SectionHeader title="Subject mastery" description="Every subject against the 80% O-Level target." />
                <div className="space-y-4">
                  {DEMO_MASTERY_BY_SUBJECT.map((subject) => (
                    <div key={subject.subject}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
                          <span className="h-2 w-2 rounded-full" style={{ background: subject.color }} />
                          {subject.subject}
                        </span>
                        <span className="text-[11.5px] font-bold text-uni-blue">{subject.mastery}%</span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${subject.mastery}%`, background: subject.color }}
                        />
                        <span className="absolute inset-y-0 left-[80%] w-px bg-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 rounded-xl bg-slate-50 p-3.5 text-[11.5px] leading-relaxed text-slate-500">
                  <span className="font-semibold text-uni-blue">Strongest:</span> English at 74%.{' '}
                  <span className="font-semibold text-uni-blue">Priority:</span> Physics at 47% — two short sessions this week
                  would make the biggest difference.
                </p>
              </div>

              <div className="space-y-4">
                <div className="card p-5">
                  <SectionHeader title="Attendance" />
                  <div className="flex items-center gap-3">
                    <div className="relative grid h-16 w-16 place-items-center">
                      <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#eef2f6" strokeWidth="3.5" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="#12b76a"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray={`${(child.attendance / 100) * 97.4} 97.4`}
                        />
                      </svg>
                      <span className="absolute font-display text-sm font-extrabold text-uni-blue">{child.attendance}%</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-slate-500">
                      Present for {Math.round((child.attendance / 100) * 60)} of 60 school days this term.
                    </p>
                  </div>
                </div>

                <div className="card p-5">
                  <SectionHeader title="Assessment calendar" />
                  <div className="space-y-2.5">
                    {DEMO_EXAMS.slice(0, 3).map((exam) => (
                      <div key={exam.id} className="flex items-center gap-2.5 text-[11px]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-crane-yellow" />
                        <span className="min-w-0 flex-1 truncate font-medium text-slate-600">{exam.title}</span>
                        <span className="shrink-0 text-[9.5px] font-bold uppercase text-slate-400">
                          {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'insights' && (
            <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
              <div className="card p-5 sm:p-6">
                <SectionHeader
                  title="Weekly guardian report"
                  description="Soma turns the week's activity into a short, honest summary."
                  actions={
                    <button onClick={generateInsight} disabled={generating} className="btn-gold btn-sm">
                      <Icon name={generating ? 'refresh' : 'sparkles'} size={13} className={generating ? 'animate-spin' : ''} />
                      {generating ? 'Writing…' : insight ? 'Regenerate' : 'Generate'}
                    </button>
                  }
                />
                {insight ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <Markdown content={insight} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-crane-yellow/15 text-crane-yellow-800">
                      <Icon name="sparkles" size={22} />
                    </span>
                    <p className="mt-4 font-display text-sm font-bold text-uni-blue">A clear summary, in seconds</p>
                    <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
                      Soma reads this week&apos;s mastery, attendance and study habits, then writes a report you can act on.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-green-500 to-leaf-green-700 p-5 text-white shadow-card">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Celebrate progress</p>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug">
                    {child.name.split(' ')[0]} is building real momentum
                  </h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/75">
                    A short message of encouragement today is worth more than a big speech at the end of term.
                  </p>
                  <button
                    onClick={() =>
                      toast('WhatsApp message prepared', {
                        description: `“Well done ${child.name.split(' ')[0]} — ${child.streak} days of steady study. Keep going!”`,
                        tone: 'gold',
                      })
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-leaf-green-800"
                  >
                    <Icon name="whatsapp" size={14} /> Send encouragement
                  </button>
                </div>

                <div className="card p-5">
                  <SectionHeader title="How to help this week" />
                  <ul className="space-y-3">
                    {[
                      'Protect one 25-minute study block on Tuesday and Thursday.',
                      'Ask her to explain the heart diagram aloud — teaching is the best test.',
                      'Celebrate the 12-day streak before discussing the Physics score.',
                    ].map((tip) => (
                      <li key={tip} className="flex gap-2.5 text-[11.5px] leading-relaxed text-slate-600">
                        <Icon name="check-circle" size={15} className="mt-0.5 shrink-0 text-leaf-green" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
