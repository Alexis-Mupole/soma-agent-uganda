'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SchoolClass, SchoolInfo, UserProfile } from '@/types';
import {
  assignCourseToTeacher,
  createSchoolClass,
  fetchPendingStudents,
  fetchSchoolClasses,
  fetchTeachers,
  updateStudentStatus,
} from '@/lib/services/databaseService';
import AppShell, { NavItem } from './ui/Shell';
import { PageHeader, SectionHeader, EmptyState } from './ui/PageHeader';
import StatCard from './ui/StatCard';
import Icon from './ui/Icon';
import { useToast } from './ui/Toast';

interface Props {
  onLogout: () => void;
  school: SchoolInfo;
  userProfile: UserProfile;
}

type Tab = 'enrollment' | 'classrooms' | 'staffing';

const NAV: NavItem[] = [
  { id: 'enrollment', label: 'Enrollment', icon: 'user-check', short: 'Enroll' },
  { id: 'classrooms', label: 'Classrooms', icon: 'grid', short: 'Classes' },
  { id: 'staffing', label: 'Teaching staff', icon: 'users', short: 'Staff' },
];

const SUBJECTS = ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'English'];
const LEVELS = ['Senior 1', 'Senior 2', 'Senior 3', 'Senior 4'];

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

export default function AcademicDashboard({ onLogout, school, userProfile }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('enrollment');
  const [pending, setPending] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [className, setClassName] = useState('');
  const [level, setLevel] = useState('Senior 4');
  const [teacherId, setTeacherId] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const [students, rooms, staff] = await Promise.all([
      fetchPendingStudents(school.name),
      fetchSchoolClasses(school.name),
      fetchTeachers(school.name),
    ]);
    setPending(students);
    setClasses(rooms);
    setTeachers(staff);
    setLoading(false);
  }, [school.name]);

  useEffect(() => {
    load();
  }, [load]);

  const totalLearners = useMemo(
    () => classes.reduce((sum, room) => sum + room.studentCount, 0),
    [classes]
  );

  const approve = async (student: UserProfile) => {
    await updateStudentStatus(student.id, 'APPROVED');
    setPending((prev) => prev.filter((s) => s.id !== student.id));
    toast('Enrollment approved', { description: `${student.fullName} can now sign in.` });
  };

  const decline = (student: UserProfile) => {
    setPending((prev) => prev.filter((s) => s.id !== student.id));
    toast('Enrollment declined', { description: `${student.fullName} was removed from the queue.`, tone: 'info' });
  };

  const approveAll = async () => {
    const queue = [...pending];
    await Promise.all(queue.map((student) => updateStudentStatus(student.id, 'APPROVED')));
    setPending([]);
    toast(`${queue.length} students approved`, { description: 'Their Soma codes are now active.' });
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    const created = await createSchoolClass(school.name, className.trim(), level);
    if (created) setClasses((prev) => [...prev, created as SchoolClass]);
    setClassName('');
    toast('Classroom opened', { description: `${className.trim()} · ${level}` });
  };

  const assign = async () => {
    if (!teacherId) return;
    await assignCourseToTeacher(teacherId, subject);
    const teacher = teachers.find((t) => t.id === teacherId);
    setAssignments((prev) => ({
      ...prev,
      [teacherId]: Array.from(new Set([...(prev[teacherId] || []), subject])),
    }));
    toast('Assignment saved', { description: `${teacher?.fullName || 'Teacher'} now teaches ${subject}.` });
  };

  return (
    <AppShell
      roleLabel="Academic office"
      nav={NAV}
      active={tab}
      onNavigate={(id) => setTab(id as Tab)}
      user={userProfile}
      school={school}
      onLogout={onLogout}
      accent="green"
    >
      <PageHeader
        eyebrow={`${school.name} · Academic office`}
        title="School operations"
        description="Approve enrollments, open classrooms and keep teaching assignments tidy."
        actions={
          <button onClick={load} className="btn-secondary">
            <Icon name={loading ? 'refresh' : 'refresh'} size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Pending approvals" value={pending.length} icon="user-check" tone="gold" hint="Awaiting your review" />
        <StatCard label="Classrooms" value={classes.length} icon="grid" tone="blue" hint={`${totalLearners} learners enrolled`} />
        <StatCard label="Teaching staff" value={teachers.length} icon="users" tone="green" hint="Active this term" />
        <StatCard label="Subjects offered" value={SUBJECTS.length} icon="book" tone="violet" hint="O-Level core" />
      </div>

      {tab === 'enrollment' && (
        <div className="space-y-5">
          <SectionHeader
            title="Enrollment queue"
            description="New student profiles stay locked until the academic office approves them."
            actions={
              pending.length > 0 ? (
                <button onClick={approveAll} className="btn-green btn-sm">
                  <Icon name="check" size={13} /> Approve all
                </button>
              ) : undefined
            }
          />

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 w-full" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon="check-circle"
              title="Queue cleared"
              description="Every submitted profile has been reviewed. New enrollments will appear here automatically."
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {pending.map((student) => (
                <article key={student.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-uni-blue/5 text-[11px] font-extrabold text-uni-blue">
                      {initials(student.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-bold text-uni-blue">{student.fullName}</p>
                      <p className="truncate text-[10.5px] text-slate-400">{student.email}</p>
                      <span className="mt-1 inline-flex rounded-md bg-crane-yellow/15 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-crane-yellow-800">
                        {student.studentCode}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decline(student)} className="btn-ghost btn-sm flex-1 text-slate-400 hover:text-red-500 sm:flex-none">
                      Decline
                    </button>
                    <button onClick={() => approve(student)} className="btn-green btn-sm flex-1 sm:flex-none">
                      <Icon name="check" size={12} /> Approve
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'classrooms' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
          <div className="card h-fit p-5 sm:p-6">
            <SectionHeader title="Open a classroom" description="Names follow the school's usual convention." />
            <form onSubmit={createClass} className="space-y-4">
              <div>
                <label className="label" htmlFor="className">Class name</label>
                <input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Senior 4 West"
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="classLevel">Senior level</label>
                <select id="classLevel" value={level} onChange={(e) => setLevel(e.target.value)} className="select">
                  {LEVELS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={!className.trim()} className="btn-primary w-full">
                <Icon name="plus" size={15} /> Create classroom
              </button>
            </form>
          </div>

          <div>
            <SectionHeader title="Active classrooms" description="Live learner counts for this term." />
            {classes.length === 0 ? (
              <EmptyState icon="grid" title="No classrooms yet" description="Create your first class to begin enrolling learners." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {classes.map((room) => (
                  <article key={room.id} className="card p-4 transition-all hover:border-uni-blue/20 hover:shadow-soft">
                    <div className="flex items-start justify-between">
                      <span className="badge-green">{room.level}</span>
                      <Icon name="grid" size={16} className="text-slate-300" />
                    </div>
                    <h3 className="mt-3 font-display text-[15px] font-bold text-uni-blue">{room.name}</h3>
                    <p className="mt-1 text-[11px] text-slate-400">{room.studentCount} learners active</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Class teacher</span>
                      <button
                        onClick={() => toast('Roster opened (demo)', { description: `${room.name} learner list would appear here.`, tone: 'info' })}
                        className="text-[10px] font-bold uppercase tracking-[0.08em] text-uni-blue hover:underline"
                      >
                        Manage
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'staffing' && (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <div>
            <SectionHeader title="Teaching staff" description="Subject links used for class tracking and feedback routing." />
            <div className="card divide-y divide-slate-100 overflow-hidden">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf-green/10 text-[10px] font-extrabold text-leaf-green-800">
                      {initials(teacher.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-bold text-uni-blue">{teacher.fullName}</p>
                      <p className="truncate text-[10px] text-slate-400">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-12 sm:justify-end sm:pl-0">
                    {(assignments[teacher.id] || ['Biology']).map((item) => (
                      <span key={item} className="badge-blue">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card h-fit p-5 sm:p-6">
            <SectionHeader title="Assign a subject" description="Link a teacher to an O-Level subject." />
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="teacher">Teacher</label>
                <select
                  id="teacher"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="select"
                >
                  <option value="">Select teacher…</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="subject">Subject</label>
                <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="select">
                  {SUBJECTS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <button onClick={assign} disabled={!teacherId} className="btn-primary w-full">
                <Icon name="link" size={15} /> Save assignment
              </button>
              <p className="rounded-xl bg-slate-50 p-3 text-[10.5px] leading-relaxed text-slate-500">
                Assignments decide which classes appear in a teacher&apos;s workspace and which guardians receive updates.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
