'use client';

import React, { useMemo, useRef, useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { authenticateUser, registerUser, DEMO_MODE_ENABLED } from '@/lib/services/databaseService';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/demo/data';
import Icon, { IconName } from './ui/Icon';
import Logo from './ui/Logo';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
  schoolName: string;
}

const ROLES: { id: UserRole; label: string; icon: IconName }[] = [
  { id: 'student', label: 'Student', icon: 'graduation' },
  { id: 'teacher', label: 'Teacher', icon: 'users' },
  { id: 'parent', label: 'Parent', icon: 'home' },
  { id: 'academic', label: 'Academic', icon: 'clipboard' },
  { id: 'admin', label: 'Admin', icon: 'shield' },
];

const HIGHLIGHTS = [
  { icon: 'brain' as IconName, title: 'NCDC-aligned AI tutor', copy: 'Explanations, worked examples and instant quizzes for every O-Level unit.' },
  { icon: 'compass' as IconName, title: 'Mastery, not guesswork', copy: 'A living syllabus map shows exactly what is secure and what needs work.' },
  { icon: 'users' as IconName, title: 'Everyone in the loop', copy: 'Teachers, guardians and school leaders see the same honest picture.' },
];

export default function Login({ onLogin, schoolName }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  const activeRole = useMemo(() => ROLES.find((r) => r.id === role)!, [role]);
  const selectedDemo = useMemo(
    () => Object.values(DEMO_ACCOUNTS).find((account) => account.email === email.trim().toLowerCase()),
    [email]
  );

  const handleDemoFill = (demoRole: UserRole) => {
    const account = DEMO_ACCOUNTS[demoRole];
    setRole(demoRole);
    setEmail(account.email);
    setPassword(account.password);
    setShowPassword(true);
    setIsRegistering(false);
    setError('');
    setSuccessMsg(
      `Credentials loaded for ${account.fullName}. Press “Continue as ${ROLES.find((r) => r.id === demoRole)?.label.toLowerCase()}” to sign in.`
    );
    requestAnimationFrame(() => {
      emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      emailRef.current?.focus({ preventScroll: true });
    });
  };

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    setError('');
    setSuccessMsg('');
    if (selectedDemo) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) return setError('Enter your school email or institutional ID.');
    if (!password) return setError('Enter your password.');
    if (isRegistering && !fullName.trim()) return setError('Enter your full name.');

    setIsLoading(true);
    try {
      if (isRegistering) {
        const result = await registerUser(fullName.trim(), email.trim(), password, role);
        if (result.success && result.profile) {
          if (role === 'student') {
            setSuccessMsg(`Registration received. Your Soma code is ${result.profile.studentCode}. An academic director will approve it shortly.`);
            setIsRegistering(false);
          } else if (role === 'teacher') {
            setSuccessMsg('Teacher account created. You can sign in now.');
            setIsRegistering(false);
          } else {
            onLogin(result.profile);
          }
        } else {
          setError(result.message || 'We could not create that account.');
        }
      } else {
        const profile = await authenticateUser(email.trim(), password);
        if (!profile) {
          setError('Those credentials do not match an account. Try a demo profile below.');
        } else if (profile.role === 'student' && profile.status === 'PENDING') {
          setError('This student profile is still awaiting academic approval.');
        } else {
          onLogin(profile);
        }
      }
    } catch {
      setError('We could not reach the sign-in service. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative overflow-hidden bg-uni-blue-950 px-6 pb-10 pt-8 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-90" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -right-6 h-56 w-56 rounded-full border border-crane-yellow/10" />

        <div className="relative">
          <Logo variant="dark" size="md" subtitle={schoolName} />

          <div className="mt-10 hidden max-w-lg lg:block">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-crane-yellow">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-green" />
              Term II · Learning platform
            </p>
            <h1 className="font-display text-[42px] font-extrabold leading-[1.06] tracking-tight text-white">
              Every learner,
              <br />
              <span className="text-gradient-gold">a mastery story.</span>
            </h1>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-slate-400">
              Soma-Agent brings the Ugandan O-Level syllabus, an AI study partner and honest progress
              reporting into one calm workspace — for students, teachers and guardians.
            </p>

            <div className="mt-9 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="flex gap-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-crane-yellow">
                    <Icon name={item.icon} size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 lg:hidden">
            {['NCDC syllabus', 'AI tutor', 'Live progress'].map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-10 hidden items-center justify-between border-t border-white/10 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 lg:flex">
          <span>{schoolName}</span>
          <span className="flex items-center gap-2 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf-green" /> All systems ready
          </span>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
        <div className="w-full max-w-[460px] animate-fade-up">
          <div className="mb-7">
            <p className="eyebrow">{isRegistering ? 'Join the platform' : 'Welcome back'}</p>
            <h2 className="mt-2 font-display text-[28px] font-extrabold tracking-tight text-uni-blue">
              {isRegistering ? 'Create your profile' : 'Sign in to Soma'}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
              {isRegistering
                ? 'Students are approved by the academic office before results unlock.'
                : 'Choose your role, then continue with your school account.'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-5 gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-soft">
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 transition-all ${
                    active ? 'bg-uni-blue text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-uni-blue'
                  }`}
                  aria-pressed={active}
                >
                  <Icon name={r.icon} size={18} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.04em]">{r.label}</span>
                </button>
              );
            })}
          </div>

          {successMsg && (
            <div className="mb-5 flex gap-2.5 rounded-2xl border border-leaf-green/20 bg-leaf-green/[0.06] p-3.5 text-left">
              <Icon name="check-circle" size={16} className="mt-0.5 shrink-0 text-leaf-green" />
              <p className="text-[11.5px] font-medium leading-relaxed text-leaf-green-800">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuthAction} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="label" htmlFor="fullName">Full name</label>
                <div className="relative">
                  <Icon name="users" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Amina Nakato"
                    className="input pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">School email</label>
              <div className="relative">
                <Icon name="mail" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gayaza.ac.ug"
                  className="input pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Icon name="lock" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="input pl-10 pr-11"
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-uni-blue"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex gap-2.5 rounded-2xl border border-red-100 bg-red-50 p-3.5">
                <Icon name="alert" size={16} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-[11.5px] font-medium leading-relaxed text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary btn-lg mt-1 w-full">
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Please wait…
                </>
              ) : (
                <>
                  {isRegistering ? 'Create account' : `Continue as ${activeRole.label.toLowerCase()}`}
                  <Icon name="arrow-right" size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11.5px] font-medium text-slate-500">
            {isRegistering ? 'Already have an account?' : 'New to Soma-Agent?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering((v) => !v);
                setError('');
                setSuccessMsg('');
              }}
              className="font-bold text-uni-blue underline decoration-crane-yellow decoration-2 underline-offset-2 hover:text-uni-blue-700"
            >
              {isRegistering ? 'Sign in instead' : 'Create a profile'}
            </button>
          </p>

          {true && (
            <div className="mt-8 rounded-3xl border border-crane-yellow/30 bg-crane-yellow/[0.07] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-crane-yellow-800">
                    <Icon name="bolt" size={13} /> Demo access
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    Click a profile to load its email and password, then press continue. Password{' '}
                    <span className="font-mono font-semibold text-uni-blue">{DEMO_PASSWORD}</span>
                  </p>
                </div>
                <span className="badge-gold">no setup</span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ROLES.map((r) => {
                  const account = DEMO_ACCOUNTS[r.id];
                  const selected = selectedDemo?.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleDemoFill(r.id)}
                      aria-pressed={selected}
                      className={`group flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all hover:bg-white hover:shadow-sm ${
                        selected
                          ? 'border-uni-blue/40 bg-white ring-1 ring-uni-blue/15'
                          : 'border-white bg-white/90 hover:border-uni-blue/25'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            selected ? 'bg-leaf-green/10 text-leaf-green-700' : 'bg-uni-blue/5 text-uni-blue'
                          }`}
                        >
                          <Icon name={r.icon} size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[11.5px] font-bold text-uni-blue">
                            {account.fullName}
                          </span>
                          <span className="mt-0.5 block truncate text-[9.5px] font-medium text-slate-400">
                            {account.email}
                          </span>
                          <span className="block text-[8.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                            {r.label}
                          </span>
                        </span>
                      </span>
                      <Icon
                        name={selected ? 'check-circle' : 'arrow-up-right'}
                        size={14}
                        className={`shrink-0 transition-colors ${
                          selected ? 'text-leaf-green' : 'text-slate-300 group-hover:text-uni-blue'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {selectedDemo && (
                <p className="mt-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-leaf-green-800">
                  <Icon name="check-circle" size={13} className="shrink-0" />
                  {selectedDemo.fullName}&apos;s email and password are filled in above. Press continue to sign in.
                </p>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-[9.5px] leading-relaxed text-slate-400">
            Protected school workspace · {schoolName} · Built for the Ugandan NCDC curriculum
          </p>
        </div>
      </section>
    </div>
  );
}
