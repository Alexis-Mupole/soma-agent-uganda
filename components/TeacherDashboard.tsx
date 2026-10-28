'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Exam, Resource, SchoolInfo, StudentProgress, UserProfile } from '@/types';
import {
  fetchStudentProgress,
  fetchTeacherCourses,
  fetchUpcomingExams,
  scheduleExam,
  sendStudentFeedback,
} from '@/lib/services/databaseService';
import AppShell, { NavItem } from './ui/Shell';
import { PageHeader, SectionHeader, EmptyState } from './ui/PageHeader';
import StatCard from './ui/StatCard';
import Icon from './ui/Icon';
import Modal from './ui/Modal';
import Markdown from './ui/Markdown';
import { useToast } from './ui/Toast';

interface Props {
  onLogout: () => void;
  resources: Resource[];
  onAddResource: (res: Resource) => void;
  school: SchoolInfo;
  userProfile: UserProfile;
}

type Tab = 'library' | 'class' | 'assessments';

const NAV: NavItem[] = [
  { id: 'library', label: 'Course library', icon: 'book', short: 'Library' },
  { id: 'class', label: 'Class progress', icon: 'users', short: 'Class' },
  { id: 'assessments', label: 'Assessments', icon: 'calendar', short: 'Exams' },
];

const statusBadge = (status: StudentProgress['status']) =>
  status === 'excellent' ? 'badge-green' : status === 'at-risk' ? 'badge-red' : 'badge-gold';

const statusLabel = (status: StudentProgress['status']) =>
  status === 'excellent' ? 'Excelling' : status === 'at-risk' ? 'At risk' : 'On track';

const prettyDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function TeacherDashboard({ onLogout, resources, onAddResource, school, userProfile }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('library');
  const [courses, setCourses] = useState<string[]>([]);
  const [subject, setSubject] = useState('Biology');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [query, setQuery] = useState('');

  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [content, setContent] = useState('');

  const [coaching, setCoaching] = useState<StudentProgress | null>(null);
  const [message, setMessage] = useState('');
  const [drafting, setDrafting] = useState(false);

  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const list = await fetchTeacherCourses(userProfile.id);
      if (!active) return;
      setCourses(list);
      if (list.length && !list.includes(subject)) setSubject(list[0]);
    };
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.id]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [progress, upcoming] = await Promise.all([
        fetchStudentProgress(subject),
        fetchUpcomingExams(undefined, subject),
      ]);
      if (!active) return;
      setStudents(progress);
      setExams(upcoming);
    };
    load();
    return () => {
      active = false;
    };
  }, [subject]);

  const subjectResources = useMemo(() => resources.filter((r) => r.subject === subject), [resources, subject]);

  const classStats = useMemo(() => {
    if (!students.length) return { average: 0, atRisk: 0, excellent: 0 };
    return {
      average: Math.round(students.reduce((sum, s) => sum + s.mastery, 0) / students.length),
      atRisk: students.filter((s) => s.status === 'at-risk').length,
      excellent: students.filter((s) => s.status === 'excellent').length,
    };
  }, [students]);

  const visibleStudents = useMemo(() => {
    const search = query.trim().toLowerCase();
    return students.filter((s) => !search || s.studentName.toLowerCase().includes(search));
  }, [students, query]);

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddResource({
      id: `res-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      unit: unit.trim() || 'New unit',
      fileSize: '1.2 MB',
      subject,
      teacherName: userProfile.fullName,
      readMinutes: Math.max(4, Math.round(content.split(/\s+/).length / 180)),
    });
    setPublishing(false);
    setTitle('');
    setUnit('');
    setContent('');
    toast('Lesson published', { description: `${subject} · visible to every class instantly.` });
  };

  const draftFeedback = async () => {
    if (!coaching) return;
    setDrafting(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Draft teacher feedback for ${coaching.studentName}, who is at ${coaching.mastery}% mastery in ${subject}.`,
          context: `Teacher ${userProfile.fullName} at ${school.name}. Student last active ${coaching.lastActive}.`,
        }),
      });
      const data = await res.json();
      setMessage(data.response || '');
      toast('Draft ready', { description: 'Personalise the highlighted section before sending.', tone: 'gold' });
    } catch {
      toast('Could not draft right now', { description: 'Write the message manually and try again.', tone: 'error' });
    } finally {
      setDrafting(false);
    }
  };

  const deliver = async () => {
    if (!coaching || !message.trim()) return;
    await sendStudentFeedback(userProfile.id, coaching.studentId, subject, message.trim(), userProfile.fullName);
    setCoaching(null);
    setMessage('');
    toast('Guidance delivered', { description: `${coaching.studentName} will see it in their mentor tab.` });
  };

  const createExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) return;
    const created = await scheduleExam(
      {
        title: examTitle.trim(),
        date: new Date(examDate).toISOString(),
        subject,
        duration: '1 hour 30 min',
        status: 'upcoming',
      },
      userProfile.schoolId
    );
    if (created) setExams((prev) => [...prev, created].sort((a, b) => +new Date(a.date) - +new Date(b.date)));
    setExamTitle('');
    setExamDate('');
    toast('Assessment scheduled', { description: 'Students and guardians have been notified.' });
  };

  return (
    <AppShell
      roleLabel="Teacher"
      nav={NAV}
      active={tab}
      onNavigate={(id) => setTab(id as Tab)}
      user={userProfile}
      school={school}
      onLogout={onLogout}
      accent="green"
      aside={
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Active subject</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-leaf-green" />
            <p className="text-[13px] font-semibold text-white">{subject}</p>
          </div>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
            {subjectResources.length} notes · {students.length} learners
          </p>
        </div>
      }
    >
      <PageHeader
        eyebrow={`${school.name} · Staff workspace`}
        title={`Good to see you, ${userProfile.fullName.split(' ')[0]}`}
        description="Publish notes, spot mastery gaps early and keep every guardian in the loop."
        actions={
          <>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="select w-auto min-w-[140px]">
              {(courses.length ? courses : ['Biology']).map((course) => (
                <option key={course}>{course}</option>
              ))}
            </select>
            <button onClick={() => setPublishing(true)} className="btn-primary">
              <Icon name="plus" size={15} /> New lesson
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Learners" value={students.length} icon="users" tone="blue" hint={`${subject} · Senior 3–4`} />
        <StatCard label="Average mastery" value={`${classStats.average}%`} icon="target" tone="green" progress={classStats.average} />
        <StatCard label="Excelling" value={classStats.excellent} icon="award" tone="gold" hint="At 80% or above" />
        <StatCard label="Needs support" value={classStats.atRisk} icon="alert" tone="rose" hint="Below 50% mastery" />
      </div>

      {tab === 'library' && (
        <div className="space-y-5">
          <SectionHeader
            title={`${subject} course library`}
            description="Everything your classes can see, in one place."
            actions={
              <button onClick={() => setPublishing(true)} className="btn-secondary btn-sm">
                <Icon name="plus" size={13} /> Add note
              </button>
            }
          />
          {subjectResources.length === 0 ? (
            <EmptyState
              icon="book"
              title="No notes for this subject yet"
              description="Publish your first lesson note and it will appear in every learner's library immediately."
              action={
                <button onClick={() => setPublishing(true)} className="btn-primary btn-sm">
                  <Icon name="plus" size={13} /> Publish note
                </button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {subjectResources.map((resource) => (
                <article key={resource.id} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-uni-blue/5 text-uni-blue">
                      <Icon name="file" size={17} />
                    </span>
                    <span className="badge-green">Live</span>
                  </div>
                  <h3 className="mt-4 font-display text-[15px] font-bold leading-snug text-uni-blue">{resource.title}</h3>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {resource.unit} · {resource.fileSize}
                  </p>
                  <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-slate-500">
                    {resource.content.replace(/[#*`>]/g, '').slice(0, 130)}…
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {resource.teacherName || userProfile.fullName}
                    </span>
                    <button
                      onClick={() =>
                        toast('Resource archived (demo)', {
                          description: `${resource.title} would be hidden from learners.`,
                          tone: 'info',
                        })
                      }
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 transition-colors hover:text-red-500"
                    >
                      Archive
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'class' && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-uni-blue">Class progress</h2>
              <p className="mt-1 text-xs text-slate-500">Live mastery for {subject}, updated after every practice session.</p>
            </div>
            <div className="relative sm:w-64">
              <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a student…"
                className="input py-2.5 pl-9"
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="hidden grid-cols-[1.6fr_1.2fr_0.9fr_auto] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 md:grid">
              {['Student', 'Mastery', 'Last active', ''].map((head, i) => (
                <p key={i} className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {head}
                </p>
              ))}
            </div>

            {visibleStudents.length === 0 ? (
              <EmptyState icon="users" title="No students match" description="Try another name or clear the search." />
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className="grid gap-3 px-4 py-4 transition-colors hover:bg-slate-50/60 md:grid-cols-[1.6fr_1.2fr_0.9fr_auto] md:items-center md:gap-4 md:px-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-uni-blue/5 text-[10px] font-extrabold text-uni-blue">
                        {student.studentName
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-bold text-uni-blue">{student.studentName}</p>
                        <span className={`badge mt-1 ${statusBadge(student.status)}`}>{statusLabel(student.status)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="progress-track flex-1">
                        <div
                          className={student.mastery >= 80 ? 'progress-fill-green' : student.mastery >= 50 ? 'progress-fill-gold' : 'h-full rounded-full bg-red-400'}
                          style={{ width: `${student.mastery}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-[11.5px] font-bold text-uni-blue">{student.mastery}%</span>
                    </div>

                    <p className="text-[11px] font-medium text-slate-400">{student.lastActive}</p>

                    <button
                      onClick={() => {
                        setCoaching(student);
                        setMessage('');
                      }}
                      className="btn-secondary btn-sm justify-self-start md:justify-self-end"
                    >
                      <Icon name="chat" size={13} /> Guidance
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-crane-yellow/15 text-crane-yellow-800">
                <Icon name="sparkles" size={16} />
              </span>
              <div>
                <p className="text-[12px] font-bold text-uni-blue">Draft guidance with Soma</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  Open a student, then let the AI draft a specific, encouraging note you can edit.
                </p>
              </div>
            </div>
            <div className="card flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500">
                <Icon name="alert" size={16} />
              </span>
              <div>
                <p className="text-[12px] font-bold text-uni-blue">Early intervention</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  {classStats.atRisk} learner{classStats.atRisk === 1 ? '' : 's'} below 50%. A short note this week keeps them on track.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'assessments' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
          <div className="card p-5 sm:p-6">
            <SectionHeader title="Schedule an assessment" description={`Students in ${subject} are notified instantly.`} />
            <form onSubmit={createExam} className="space-y-4">
              <div>
                <label className="label" htmlFor="examTitle">Assessment title</label>
                <input
                  id="examTitle"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder={`e.g. ${subject} Unit 3 test`}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="examDate">Date</label>
                <input
                  id="examDate"
                  type="date"
                  value={examDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="input"
                />
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5 text-[11px] leading-relaxed text-slate-500">
                <span className="font-bold text-uni-blue">Standard format:</span> 1 hour 30 minutes, NCDC paper structure,
                auto-marked practice attached.
              </div>
              <button type="submit" className="btn-primary w-full" disabled={!examTitle.trim() || !examDate}>
                <Icon name="calendar" size={15} /> Notify class
              </button>
            </form>
          </div>

          <div>
            <SectionHeader title={`${subject} schedule`} description="Upcoming assessments for your classes." />
            <div className="space-y-3">
              {exams.length === 0 ? (
                <EmptyState icon="calendar" title="Nothing scheduled" description="Use the form to set your next assessment." />
              ) : (
                exams.map((exam) => (
                  <div key={exam.id} className="card flex items-center gap-4 p-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-uni-blue text-center text-white">
                      <div>
                        <p className="font-display text-base font-extrabold leading-none">
                          {new Date(exam.date).getDate()}
                        </p>
                        <p className="mt-0.5 text-[8px] font-bold uppercase text-slate-300">
                          {new Date(exam.date).toLocaleDateString('en-GB', { month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold text-uni-blue">{exam.title}</p>
                      <p className="mt-0.5 text-[10.5px] text-slate-400">
                        {prettyDate(exam.date)} · {exam.duration}
                      </p>
                    </div>
                    <span className="badge-gold shrink-0">{exam.subject}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Publish modal */}
      <Modal
        open={publishing}
        onClose={() => setPublishing(false)}
        title="Publish lesson notes"
        subtitle={`${subject} · visible to every class instantly`}
        icon="pencil"
        size="lg"
      >
        <form onSubmit={publish} className="space-y-4">
          <div>
            <label className="label" htmlFor="noteTitle">Topic title</label>
            <input
              id="noteTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The mammalian heart"
              className="input"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="noteUnit">Unit</label>
              <input
                id="noteUnit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit 3"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="noteSubject">Subject</label>
              <input id="noteSubject" value={subject} readOnly className="input bg-slate-50 text-slate-500" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="noteContent">Lesson content</label>
            <textarea
              id="noteContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Paste or write the lesson. Markdown is supported."
              className="input resize-y"
            />
          </div>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button type="button" onClick={() => setPublishing(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!title.trim()}>
              <Icon name="check" size={15} /> Publish to classes
            </button>
          </div>
        </form>
      </Modal>

      {/* Guidance modal */}
      <Modal
        open={coaching !== null}
        onClose={() => setCoaching(null)}
        title="Academic guidance"
        subtitle={coaching ? `${coaching.studentName} · ${subject}` : undefined}
        icon="chat"
        size="md"
        accent="green"
      >
        {coaching && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-display text-base font-extrabold text-uni-blue">{coaching.mastery}%</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">Mastery</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-display text-base font-extrabold text-uni-blue">{statusLabel(coaching.status)}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">Status</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="truncate font-display text-[11px] font-extrabold leading-6 text-uni-blue">{coaching.lastActive}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">Last active</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="label mb-0" htmlFor="feedback">Message</label>
              <button onClick={draftFeedback} disabled={drafting} className="btn-ghost btn-sm text-uni-blue">
                <Icon name={drafting ? 'refresh' : 'sparkles'} size={13} className={drafting ? 'animate-spin' : ''} />
                {drafting ? 'Drafting…' : 'Draft with Soma'}
              </button>
            </div>

            <textarea
              id="feedback"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Write specific, encouraging guidance…"
              className="input resize-y"
            />

            {message.includes('###') && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Preview</p>
                <Markdown content={message} compact />
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => setCoaching(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={deliver} disabled={!message.trim()} className="btn-green flex-1">
                <Icon name="send" size={14} /> Deliver message
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
