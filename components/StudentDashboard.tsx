'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Exam,
  MasteryStatus,
  Resource,
  SchoolInfo,
  TeacherFeedback,
  UserProfile,
  SyllabusNode,
} from '@/types';
import {
  fetchClassResources,
  fetchStudentFeedback,
  fetchStudentMastery,
  fetchUpcomingExams,
} from '@/lib/services/databaseService';
import {
  DEMO_CHILD,
  DEMO_MASTERY_BY_SUBJECT,
  DEMO_WEEKLY,
  RESOURCE_READ_MINUTES,
} from '@/lib/demo/data';
import AppShell, { NavItem } from './ui/Shell';
import { PageHeader, SectionHeader, EmptyState } from './ui/PageHeader';
import StatCard from './ui/StatCard';
import ProgressRing from './ui/ProgressRing';
import MasteryMap from './MasteryMap';
import ChatPanel, { AssistantLauncher } from './ui/ChatPanel';
import QuizModal from './ui/QuizModal';
import Modal from './ui/Modal';
import Markdown from './ui/Markdown';
import Icon from './ui/Icon';
import { useToast } from './ui/Toast';

interface Props {
  onLogout: () => void;
  resources: Resource[];
  school: SchoolInfo;
  userProfile: UserProfile;
}

type Tab = 'overview' | 'syllabus' | 'library' | 'mentor';

const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'home', short: 'Home' },
  { id: 'syllabus', label: 'My syllabus', icon: 'compass', short: 'Syllabus' },
  { id: 'library', label: 'E-Library', icon: 'book', short: 'Library' },
  { id: 'mentor', label: 'Guidance', icon: 'chat', short: 'Mentor' },
];

const TASKS = [
  'Revisit Human Transport — double circulation diagram',
  'Complete one 3-question check on Plant Nutrition',
  'Rewrite Cell Biology definitions from memory',
];

const daysUntil = (iso: string) => {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
};

const prettyDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

const StudentDashboard: React.FC<Props> = ({ onLogout, resources: initialResources, school, userProfile }) => {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [feedback, setFeedback] = useState<TeacherFeedback[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [mastery, setMastery] = useState<SyllabusNode[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [quiz, setQuiz] = useState<{ topic: string; content?: string } | null>(null);
  const [reading, setReading] = useState<Resource | null>(null);
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [doneTasks, setDoneTasks] = useState<number[]>([]);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [nextResources, nextFeedback, nextExams, nextMastery] = await Promise.all([
        fetchClassResources(school.name),
        fetchStudentFeedback(userProfile.id),
        fetchUpcomingExams(),
        fetchStudentMastery(userProfile.id),
      ]);
      if (!mounted) return;
      if (nextResources.length) setResources(nextResources);
      setFeedback(nextFeedback);
      setExams(nextExams);
      setMastery(nextMastery);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [school.name, userProfile.id]);

  const firstName = userProfile.fullName.split(' ')[0];
  const overall = Math.round(
    DEMO_MASTERY_BY_SUBJECT.reduce((sum, s) => sum + s.mastery, 0) / DEMO_MASTERY_BY_SUBJECT.length
  );
  const studyMinutes = DEMO_WEEKLY.reduce((sum, d) => sum + d.minutes, 0);
  const nextExam = exams[0];

  const subjects = useMemo(
    () => ['All', ...Array.from(new Set(resources.map((r) => r.subject)))],
    [resources]
  );

  const filteredResources = useMemo(
    () =>
      resources.filter((r) => {
        const matchesSubject = subjectFilter === 'All' || r.subject === subjectFilter;
        const search = query.trim().toLowerCase();
        const matchesQuery =
          !search || `${r.title} ${r.subject} ${r.unit} ${r.teacherName || ''}`.toLowerCase().includes(search);
        return matchesSubject && matchesQuery;
      }),
    [resources, subjectFilter, query]
  );

  const openQuiz = (topic: string, content?: string) => setQuiz({ topic, content });

  return (
    <AppShell
      roleLabel="Student"
      nav={NAV}
      active={tab}
      onNavigate={(id) => setTab(id as Tab)}
      user={userProfile}
      school={school}
      onLogout={onLogout}
      accent="gold"
      aside={
        <div className="mb-3 rounded-2xl border border-crane-yellow/20 bg-gradient-to-br from-crane-yellow/[0.14] to-transparent p-4">
          <div className="flex items-center gap-2 text-crane-yellow">
            <Icon name="sparkles" size={15} />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]">Soma AI</p>
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">
            Stuck on a unit? Ask for an explanation, then take a 3-question check.
          </p>
          <button
            onClick={() => setChatOpen(true)}
            className="mt-3 w-full rounded-xl bg-crane-yellow py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-uni-blue transition-colors hover:bg-crane-yellow-300"
          >
            Open study partner
          </button>
        </div>
      }
      assistant={
        <>
          <AssistantLauncher onClick={() => setChatOpen(true)} hidden={chatOpen || quiz !== null} />
          <ChatPanel
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            schoolName={school.name}
            userName={userProfile.fullName}
            context={`Student in ${userProfile.className || 'Senior 4'}. Current weakest subject: Physics (47%). Next assessment: ${nextExam?.title || 'Unit test'}.`}
            onPractice={(topic) => {
              setChatOpen(false);
              openQuiz(topic.replace(/-/g, ' '));
            }}
          />
        </>
      }
    >
      <PageHeader
        eyebrow={`${userProfile.className || 'Senior 4'} · ${school.name}`}
        title={`Salama, ${firstName}`}
        description="Your syllabus at a glance, the next assessment, and a study partner that never sleeps."
        actions={
          <>
            <button onClick={() => setChatOpen(true)} className="btn-secondary">
              <Icon name="sparkles" size={15} /> Ask Soma
            </button>
            <button onClick={() => openQuiz('Biology')} className="btn-gold">
              <Icon name="bolt" size={15} /> Daily drill
            </button>
          </>
        }
      />

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label="Overall mastery" value={`${overall}%`} icon="target" tone="green" progress={overall} hint="Across 5 O-Level subjects" />
            <StatCard label="Study time" value={`${(studyMinutes / 60).toFixed(1)}h`} icon="clock" tone="blue" hint="Last 7 days" trend="+18% vs last week" />
            <StatCard label="Study streak" value={`${DEMO_CHILD.streak} days`} icon="flame" tone="gold" hint="Keep it alive today" />
            <StatCard label="Class rank" value={`${DEMO_CHILD.rank} of ${DEMO_CHILD.classSize}`} icon="trophy" tone="violet" hint="Top 15% of the class" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="card p-5 sm:p-6">
              <SectionHeader
                title="Study rhythm"
                description="Minutes of active recall over the last seven days."
                actions={<span className="badge-green">Consistent</span>}
              />
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DEMO_WEEKLY} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
                    <defs>
                      <linearGradient id="studyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#12b76a" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#12b76a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#eef2f6" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={40} />
                    <Tooltip
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, boxShadow: '0 12px 30px -16px rgba(10,42,67,0.35)' }}
                      formatter={(value) => [`${value ?? 0} min`, 'Study time'] as [string, string]}
                    />
                    <Area type="monotone" dataKey="minutes" stroke="#12b76a" strokeWidth={2.5} fill="url(#studyFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4">
                {[
                  { label: 'Avg. session', value: `${Math.round(studyMinutes / 7)} min` },
                  { label: 'Questions answered', value: DEMO_WEEKLY.reduce((s, d) => s + d.questions, 0) },
                  { label: 'Best day', value: 'Saturday' },
                ].map((item) => (
                  <div key={item.label} className="px-3 text-center first:pl-0 last:pr-0">
                    <p className="font-display text-base font-extrabold text-uni-blue">{item.value}</p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-uni-blue-950 p-5 text-white shadow-card sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-80" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-crane-yellow">Today&apos;s focus</p>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-300">
                    {doneTasks.length}/{TASKS.length} done
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold leading-snug text-white">
                  Close the Human Transport gap
                </h3>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">
                  You are 45% through this unit. Twenty focused minutes today moves it into the secure band.
                </p>

                <div className="mt-4 space-y-2">
                  {TASKS.map((task, i) => {
                    const done = doneTasks.includes(i);
                    return (
                      <button
                        key={task}
                        onClick={() => setDoneTasks((prev) => (done ? prev.filter((x) => x !== i) : [...prev, i]))}
                        className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left text-[11.5px] leading-snug transition-all ${
                          done
                            ? 'border-leaf-green/30 bg-leaf-green/10 text-slate-400 line-through'
                            : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20'
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-md border ${
                            done ? 'border-leaf-green bg-leaf-green text-white' : 'border-slate-500'
                          }`}
                        >
                          {done && <Icon name="check" size={10} />}
                        </span>
                        {task}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => openQuiz('Human Transport')}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-crane-yellow py-2.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-uni-blue transition-colors hover:bg-crane-yellow-300"
                >
                  <Icon name="play" size={13} /> Start 3-question check
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div className="card p-5 sm:p-6">
              <SectionHeader
                title="Subject mastery"
                description="Where you stand against the 80% O-Level target."
                actions={
                  <button onClick={() => setTab('syllabus')} className="btn-ghost btn-sm">
                    Full map <Icon name="arrow-right" size={13} />
                  </button>
                }
              />
              <div className="space-y-4">
                {DEMO_MASTERY_BY_SUBJECT.map((subject) => (
                  <div key={subject.subject} className="group">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: subject.color }} />
                        <span className="text-[12.5px] font-semibold text-slate-700">{subject.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-slate-400">target 80%</span>
                        <span className="w-9 text-right text-[12px] font-bold text-uni-blue">{subject.mastery}%</span>
                        <button
                          onClick={() => openQuiz(subject.subject)}
                          className="rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-uni-blue group-hover:opacity-100"
                        >
                          Practise
                        </button>
                      </div>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-spring"
                        style={{ width: `${subject.mastery}%`, background: subject.color }}
                      />
                      <span className="absolute inset-y-0 left-[80%] w-px bg-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {nextExam && (
                <div className="card overflow-hidden">
                  <div className="flex items-start justify-between gap-3 bg-uni-blue px-5 py-4 text-white">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-crane-yellow">Next assessment</p>
                      <p className="mt-1 font-display text-[15px] font-bold leading-snug">{nextExam.title}</p>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-center">
                      <div>
                        <p className="font-display text-base font-extrabold leading-none">{daysUntil(nextExam.date)}</p>
                        <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-300">days</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 text-[10.5px] font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="calendar" size={13} className="text-slate-400" /> {prettyDate(nextExam.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="clock" size={13} className="text-slate-400" /> {nextExam.duration}
                    </span>
                    <span className="badge-blue ml-auto">{nextExam.subject}</span>
                  </div>
                </div>
              )}

              <div className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf-green/10 text-leaf-green-700">
                    <Icon name="chat" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Teacher note</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                      &ldquo;{DEMO_CHILD.teacherNote}&rdquo;
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.08em] text-uni-blue">
                      {DEMO_CHILD.teacherName} · Biology
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: 'book' as const, title: 'E-Library', copy: `${resources.length} curated notes`, tab: 'library' as Tab },
              { icon: 'compass' as const, title: 'Syllabus map', copy: `${mastery.filter((m) => m.status === MasteryStatus.MASTERED).length} units secure`, tab: 'syllabus' as Tab },
              { icon: 'chat' as const, title: 'Guidance', copy: `${feedback.length} teacher messages`, tab: 'mentor' as Tab },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => setTab(item.tab)}
                className="card-interactive flex items-center gap-3 p-4 text-left"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-uni-blue/5 text-uni-blue">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[13px] font-bold text-uni-blue">{item.title}</span>
                  <span className="block text-[11px] text-slate-400">{item.copy}</span>
                </span>
                <Icon name="arrow-right" size={15} className="shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'syllabus' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card flex items-center gap-4 p-5">
              <ProgressRing value={overall} size={82} strokeWidth={7} sublabel="mastery" />
              <div>
                <p className="eyebrow">Biology pathway</p>
                <p className="mt-1 font-display text-lg font-bold text-uni-blue">
                  {mastery.filter((m) => m.status === MasteryStatus.MASTERED).length} of {mastery.length} units secure
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  Finish Human Transport to unlock Coordination.
                </p>
              </div>
            </div>
            <div className="card p-5">
              <p className="eyebrow">In progress</p>
              <p className="mt-1 font-display text-lg font-bold text-uni-blue">Human Transport</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="progress-track flex-1">
                  <div className="progress-fill-gold" style={{ width: '45%' }} />
                </div>
                <span className="text-[11px] font-bold text-uni-blue">45%</span>
              </div>
              <button onClick={() => openQuiz('Human Transport')} className="btn-gold btn-sm mt-3 w-full">
                <Icon name="play" size={13} /> Continue unit
              </button>
            </div>
            <div className="card p-5">
              <p className="eyebrow">Next unlocked</p>
              <p className="mt-1 font-display text-lg font-bold text-uni-blue">Coordination</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Nervous system, reflexes and hormones. Unlocks at 80% in the current unit.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <Icon name="lock" size={12} /> Locked
              </div>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <SectionHeader
              title="NCDC progression map"
              description="Units build on each other — practise the highlighted node next."
            />
            <MasteryMap nodes={mastery} onPractice={(node) => openQuiz(node.title)} />
          </div>
        </div>
      )}

      {tab === 'library' && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes, units or teachers…"
                className="input pl-10"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSubjectFilter(subject)}
                  className={`chip shrink-0 ${subjectFilter === subject ? 'chip-active' : ''}`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <EmptyState
              icon="search"
              title="No notes match that search"
              description="Try a different subject or clear the search to see every resource."
              action={
                <button
                  onClick={() => {
                    setQuery('');
                    setSubjectFilter('All');
                  }}
                  className="btn-secondary btn-sm"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource) => (
                <article
                  key={resource.id}
                  className="card flex flex-col p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-uni-blue/5 text-uni-blue">
                      <Icon name="book" size={18} />
                    </span>
                    <span className="badge-blue">{resource.subject}</span>
                  </div>
                  <h3 className="mt-4 font-display text-[15px] font-bold leading-snug text-uni-blue">{resource.title}</h3>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {resource.unit} · {RESOURCE_READ_MINUTES[resource.id] || 10} min read
                  </p>
                  <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-slate-500">
                    {resource.content.replace(/[#*`>]/g, '').slice(0, 150)}…
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <button onClick={() => setReading(resource)} className="btn-secondary btn-sm flex-1">
                      Open notes
                    </button>
                    <button onClick={() => openQuiz(resource.title, resource.content)} className="btn-primary btn-sm flex-1">
                      Practise
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'mentor' && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <SectionHeader
              title="Teacher guidance"
              description="Direct notes from the staff who teach you."
              actions={<span className="badge-slate">{feedback.length} messages</span>}
            />
            {feedback.length === 0 ? (
              <EmptyState icon="chat" title="No messages yet" description="Guidance from your teachers will appear here." />
            ) : (
              feedback.map((item) => {
                const ack = acknowledged.includes(item.id);
                return (
                  <article key={item.id} className="card p-5">
                    <div className="flex items-start gap-3.5">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf-green/10 text-leaf-green-700">
                        <Icon name="users" size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-bold text-uni-blue">{item.fromTeacher}</p>
                          <span className="badge-slate">{item.subject}</span>
                          <span className="text-[10px] font-medium text-slate-400">{item.date}</span>
                        </div>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">{item.message}</p>
                        <button
                          onClick={() => {
                            if (ack) return;
                            setAcknowledged((prev) => [...prev, item.id]);
                            toast('Guidance acknowledged', { description: 'Your teacher can see that you have read this note.' });
                          }}
                          disabled={ack}
                          className={`mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                            ack ? 'text-leaf-green' : 'text-uni-blue hover:underline'
                          }`}
                        >
                          <Icon name={ack ? 'check-circle' : 'check'} size={13} />
                          {ack ? 'Acknowledged' : 'Mark as read'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            <div className="flex flex-col items-start gap-3 rounded-3xl bg-uni-blue-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-crane-yellow text-uni-blue">
                  <Icon name="sparkles" size={18} />
                </span>
                <div>
                  <p className="font-display text-[13.5px] font-bold">Want a personal revision plan?</p>
                  <p className="text-[11px] text-slate-400">Soma builds one from your mastery gaps in seconds.</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(true)} className="btn-gold btn-sm shrink-0">
                Ask Soma
              </button>
            </div>
          </div>

          <div>
            <SectionHeader title="Upcoming assessments" description="Plan your revision around these dates." />
            <div className="space-y-3">
              {exams.map((exam) => (
                <div key={exam.id} className="card flex items-center gap-4 p-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-50 text-center">
                    <div>
                      <p className="font-display text-base font-extrabold leading-none text-uni-blue">
                        {new Date(exam.date).getDate()}
                      </p>
                      <p className="mt-0.5 text-[8px] font-bold uppercase text-slate-400">
                        {new Date(exam.date).toLocaleDateString('en-GB', { month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-bold text-uni-blue">{exam.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-slate-400">
                      {exam.subject} · {exam.duration}
                    </p>
                  </div>
                  <span className="badge-gold shrink-0">{daysUntil(exam.date)}d</span>
                </div>
              ))}
              {exams.length === 0 && <EmptyState icon="calendar" title="Nothing scheduled" />}
            </div>
          </div>
        </div>
      )}

      <QuizModal
        open={quiz !== null}
        onClose={() => setQuiz(null)}
        topic={quiz?.topic || 'Biology'}
        resourceContent={quiz?.content}
      />

      <Modal
        open={reading !== null}
        onClose={() => setReading(null)}
        title={reading?.title}
        subtitle={reading ? `${reading.subject} · ${reading.unit}` : undefined}
        icon="book"
        size="lg"
      >
        {reading && (
          <>
            <Markdown content={reading.content} />
            <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row">
              <button onClick={() => setReading(null)} className="btn-secondary flex-1">
                Close notes
              </button>
              <button
                onClick={() => {
                  const resource = reading;
                  setReading(null);
                  openQuiz(resource.title, resource.content);
                }}
                className="btn-gold flex-1"
              >
                <Icon name="target" size={15} /> Check understanding
              </button>
            </div>
          </>
        )}
      </Modal>
    </AppShell>
  );
};

export default StudentDashboard;
