'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Resource, SchoolInfo, StudentProgress, UserProfile } from '@/types';
import {
  fetchClassResources,
  fetchStudentProgress,
  fetchSystemHealth,
  fetchTeachers,
} from '@/lib/services/databaseService';
import { DEMO_PLATFORM_WEEKLY, DEMO_SECURITY_LOGS } from '@/lib/demo/data';
import AppShell, { NavItem } from './ui/Shell';
import { PageHeader, SectionHeader, EmptyState } from './ui/PageHeader';
import StatCard from './ui/StatCard';
import Icon from './ui/Icon';
import Modal from './ui/Modal';
import Markdown from './ui/Markdown';
import { useToast } from './ui/Toast';

interface Props {
  onLogout: () => void;
  userProfile: UserProfile;
}

type Tab = 'overview' | 'users' | 'library' | 'settings';

const NAV: NavItem[] = [
  { id: 'overview', label: 'Platform overview', icon: 'activity', short: 'Overview' },
  { id: 'users', label: 'People', icon: 'users', short: 'People' },
  { id: 'library', label: 'Resource registry', icon: 'database', short: 'Library' },
  { id: 'settings', label: 'Configuration', icon: 'settings', short: 'Config' },
];

const SCHOOL: SchoolInfo = { name: 'Gayaza Schools Network', location: 'Central Uganda', motto: '' };

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

export default function AdminDashboard({ onLogout, userProfile }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [health, setHealth] = useState<{ status: string; users: number; uptime: string } | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'student'>('all');
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [reviewing, setReviewing] = useState<Resource | null>(null);

  const [config, setConfig] = useState({
    instanceName: 'Gayaza High School',
    region: 'Central Uganda',
    aiProvider: 'Google Gemini',
    maintenance: false,
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [platformHealth, progress, staff, library] = await Promise.all([
        fetchSystemHealth(),
        fetchStudentProgress('Biology'),
        fetchTeachers('GLOBAL'),
        fetchClassResources('GLOBAL'),
      ]);
      if (!active) return;
      setHealth(platformHealth);
      setStudents(progress);
      setTeachers(staff);
      setResources(library);
    };
    load();

    fetch('/api/ai/chat')
      .then((res) => res.json())
      .then((data) => setAiStatus(data.configured ? 'online' : 'offline'))
      .catch(() => setAiStatus('offline'));

    return () => {
      active = false;
    };
  }, []);

  const people = useMemo(() => {
    const teachersList = teachers.map((t) => ({ ...t, role: 'teacher' as const }));
    const studentsList = students.map((s) => ({
      id: s.studentId,
      fullName: s.studentName,
      email: `${s.studentName.split(' ')[0].toLowerCase()}@gayaza.ac.ug`,
      role: 'student' as const,
      status: 'APPROVED' as const,
      schoolId: '',
    }));
    return [...teachersList, ...studentsList];
  }, [teachers, students]);

  const visiblePeople = useMemo(() => {
    const search = query.trim().toLowerCase();
    return people.filter((person) => {
      const matchesRole = roleFilter === 'all' || person.role === roleFilter;
      const matchesQuery = !search || `${person.fullName} ${person.email}`.toLowerCase().includes(search);
      return matchesRole && matchesQuery;
    });
  }, [people, query, roleFilter]);

  const lastDay = DEMO_PLATFORM_WEEKLY[DEMO_PLATFORM_WEEKLY.length - 1];
  const weeklyQueries = DEMO_PLATFORM_WEEKLY.reduce((sum, day) => sum + day.queries, 0);

  return (
    <AppShell
      roleLabel="Administrator"
      nav={NAV}
      active={tab}
      onNavigate={(id) => setTab(id as Tab)}
      user={userProfile}
      school={SCHOOL}
      onLogout={onLogout}
      accent="blue"
      aside={
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">AI engine</p>
            <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] ${aiStatus === 'online' ? 'text-leaf-green' : 'text-crane-yellow'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${aiStatus === 'online' ? 'bg-leaf-green' : 'bg-crane-yellow'}`} />
              {aiStatus === 'checking' ? 'Checking' : aiStatus === 'online' ? 'Gemini online' : 'Offline tutor'}
            </span>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
            {aiStatus === 'online'
              ? 'Gemini keys detected. Tutor responses are model-generated.'
              : 'No Gemini key detected. The offline curriculum tutor is answering every request.'}
          </p>
        </div>
      }
    >
      <PageHeader
        eyebrow="Platform administration"
        title="Network overview"
        description={`Signed in as ${userProfile.fullName}. Monitor adoption, people and shared curriculum resources.`}
        actions={
          <button
            onClick={() =>
              toast('Snapshot refreshed', { description: `Uptime ${health?.uptime || '99.98%'} · ${health?.users ?? 0} accounts indexed.` })
            }
            className="btn-secondary"
          >
            <Icon name="refresh" size={15} /> Refresh
          </button>
        }
      />

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label="Accounts indexed" value={health?.users ?? '—'} icon="users" tone="blue" hint="All roles in the network" />
            <StatCard label="Uptime (30d)" value={health?.uptime ?? '—'} icon="activity" tone="green" hint="No incidents recorded" />
            <StatCard label="Library resources" value={resources.length} icon="database" tone="gold" hint="Across five subjects" />
            <StatCard label="AI queries" value={weeklyQueries.toLocaleString()} icon="sparkles" tone="violet" hint="Last 7 days" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <div className="card p-5 sm:p-6">
              <SectionHeader
                title="Adoption this week"
                description="Daily sign-ins and AI study queries across the network."
                actions={
                  <div className="flex items-center gap-3 text-[9.5px] font-bold uppercase tracking-[0.08em]">
                    <span className="flex items-center gap-1.5 text-uni-blue">
                      <span className="h-1.5 w-4 rounded-full bg-uni-blue" /> Sign-ins
                    </span>
                    <span className="flex items-center gap-1.5 text-crane-yellow-800">
                      <span className="h-1.5 w-4 rounded-full bg-crane-yellow" /> Queries
                    </span>
                  </div>
                }
              />
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DEMO_PLATFORM_WEEKLY} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="#eef2f6" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }}
                      labelStyle={{ fontWeight: 700, color: '#0a2a43' }}
                    />
                    <Line type="monotone" dataKey="queries" stroke="#f5c542" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="logins" stroke="#0a2a43" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <SectionHeader title="Recent activity" description="Administrative and security events." />
              <div className="space-y-3">
                {DEMO_SECURITY_LOGS.map((log) => (
                  <div key={log.event} className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        log.status === 'WARN' ? 'bg-crane-yellow' : 'bg-leaf-green'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] font-medium leading-snug text-slate-600">{log.event}</p>
                      <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => toast('Audit log is complete', { description: 'No unresolved security events today.', tone: 'info' })}
                className="btn-secondary btn-sm mt-4 w-full"
              >
                View audit log
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf-green/10 text-leaf-green-700">
                <Icon name="cpu" size={16} />
              </span>
              <div>
                <p className="text-[12px] font-bold text-uni-blue">AI availability</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  {aiStatus === 'online' ? 'Primary and fallback models are healthy.' : 'Offline tutor serving every request without keys.'}
                </p>
              </div>
            </div>
            <div className="card flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-uni-blue/5 text-uni-blue">
                <Icon name="user-check" size={16} />
              </span>
              <div>
                <p className="text-[12px] font-bold text-uni-blue">Active accounts</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  {lastDay.logins} sign-ins yesterday · {teachers.length} teachers online.
                </p>
              </div>
            </div>
            <div className="card flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-crane-yellow/15 text-crane-yellow-800">
                <Icon name="book" size={16} />
              </span>
              <div>
                <p className="text-[12px] font-bold text-uni-blue">Curriculum coverage</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  5 subjects · {resources.length} approved resources in the registry.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'Everyone' },
                { id: 'teacher', label: 'Teachers' },
                { id: 'student', label: 'Students' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRoleFilter(item.id as typeof roleFilter)}
                  className={`chip ${roleFilter === item.id ? 'chip-active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="relative sm:w-64">
              <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people…"
                className="input py-2.5 pl-9"
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="hidden grid-cols-[1.6fr_0.8fr_0.8fr_auto] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 md:grid">
              {['Identity', 'Role', 'Status', ''].map((head, i) => (
                <p key={i} className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {head}
                </p>
              ))}
            </div>
            {visiblePeople.length === 0 ? (
              <EmptyState icon="users" title="No people match" description="Try a different search or role filter." />
            ) : (
              <div className="divide-y divide-slate-100">
                {visiblePeople.map((person) => (
                  <div
                    key={`${person.role}-${person.id}`}
                    className="grid gap-2 px-4 py-3.5 md:grid-cols-[1.6fr_0.8fr_0.8fr_auto] md:items-center md:gap-4 md:px-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-uni-blue/5 text-[10px] font-extrabold text-uni-blue">
                        {initials(person.fullName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-bold text-uni-blue">{person.fullName}</p>
                        <p className="truncate text-[10px] text-slate-400">{person.email}</p>
                      </div>
                    </div>
                    <span className={`badge w-fit ${person.role === 'teacher' ? 'badge-green' : 'badge-blue'}`}>{person.role}</span>
                    <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-leaf-green" /> Active
                    </span>
                    <button
                      onClick={() => toast('Profile opened (demo)', { description: `${person.fullName}'s account details.`, tone: 'info' })}
                      className="text-[10px] font-bold uppercase tracking-[0.08em] text-uni-blue hover:underline md:text-right"
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'library' && (
        <div className="space-y-5">
          <SectionHeader
            title="Curriculum resource registry"
            description="Every note shared with learners across the network."
            actions={<span className="badge-slate">{resources.length} approved</span>}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <article key={resource.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-uni-blue/5 text-uni-blue">
                    <Icon name="file" size={17} />
                  </span>
                  <span className="badge-blue">{resource.subject}</span>
                </div>
                <h3 className="mt-4 font-display text-[14px] font-bold leading-snug text-uni-blue">{resource.title}</h3>
                <p className="mt-1 text-[10.5px] font-medium text-slate-400">
                  {resource.unit} · {resource.fileSize}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <button onClick={() => setReviewing(resource)} className="text-[10px] font-bold uppercase tracking-[0.08em] text-uni-blue hover:underline">
                    Review
                  </button>
                  <button
                    onClick={() =>
                      toast('Resource withdrawn (demo)', {
                        description: `${resource.title} would be hidden from learners.`,
                        tone: 'info',
                      })
                    }
                    className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 transition-colors hover:text-red-500"
                  >
                    Withdraw
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="card p-5 sm:p-6">
            <SectionHeader title="Platform configuration" description="Institution identity and service behaviour." />
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="instanceName">Institution name</label>
                <input
                  id="instanceName"
                  value={config.instanceName}
                  onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="region">Operational region</label>
                <select
                  id="region"
                  value={config.region}
                  onChange={(e) => setConfig({ ...config, region: e.target.value })}
                  className="select"
                >
                  <option>Central Uganda</option>
                  <option>Eastern Uganda</option>
                  <option>Northern Uganda</option>
                  <option>Western Uganda</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="aiProvider">AI engine</label>
                <select
                  id="aiProvider"
                  value={config.aiProvider}
                  onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
                  className="select"
                >
                  <option>Google Gemini</option>
                  <option>Offline curriculum tutor</option>
                </select>
                <p className="mt-1.5 text-[10.5px] text-slate-400">
                  The offline tutor is always the fallback, so studying never stops when a key is missing.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div>
                  <p className="text-[12px] font-bold text-uni-blue">Maintenance mode</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-400">Blocks student and guardian sign-in while staff keep working.</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, maintenance: !config.maintenance })}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${config.maintenance ? 'bg-red-500' : 'bg-slate-300'}`}
                  role="switch"
                  aria-checked={config.maintenance}
                  aria-label="Toggle maintenance mode"
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                      config.maintenance ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  onClick={() =>
                    setConfig({ instanceName: 'Gayaza High School', region: 'Central Uganda', aiProvider: 'Google Gemini', maintenance: false })
                  }
                  className="btn-secondary flex-1"
                >
                  Restore defaults
                </button>
                <button
                  onClick={() => toast('Configuration saved', { description: 'Changes apply to new sessions immediately.' })}
                  className="btn-primary flex-1"
                >
                  <Icon name="check" size={15} /> Save changes
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <SectionHeader title="Environment" />
              <div className="space-y-3 text-[11px]">
                {[
                  { label: 'Data layer', value: 'Demo dataset', tone: 'text-crane-yellow-800 bg-crane-yellow/15' },
                  { label: 'AI engine', value: aiStatus === 'online' ? 'Gemini' : 'Offline tutor', tone: 'text-uni-blue bg-uni-blue/10' },
                  { label: 'Deployment', value: 'Vercel', tone: 'text-leaf-green-800 bg-leaf-green/10' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">{row.label}</span>
                    <span className={`rounded-md px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] ${row.tone}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-crane-yellow/30 bg-crane-yellow/[0.08] p-5">
              <div className="flex items-center gap-2 text-crane-yellow-800">
                <Icon name="info" size={15} />
                <p className="text-[10px] font-bold uppercase tracking-[0.14em]">Demo environment</p>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
                This workspace uses a bundled dataset and offline AI so every screen can be explored without credentials.
                Add Supabase and Gemini keys to switch to live data automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={reviewing !== null}
        onClose={() => setReviewing(null)}
        title={reviewing?.title}
        subtitle={reviewing ? `${reviewing.subject} · ${reviewing.unit}` : undefined}
        icon="file"
        size="lg"
      >
        {reviewing && <Markdown content={reviewing.content} />}
      </Modal>
    </AppShell>
  );
}
