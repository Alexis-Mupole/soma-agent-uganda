'use client';

import { useEffect, useState } from 'react';
import Login from '@/components/Login';
import StudentDashboard from '@/components/StudentDashboard';
import TeacherDashboard from '@/components/TeacherDashboard';
import ParentDashboard from '@/components/ParentDashboard';
import AcademicDashboard from '@/components/AcademicDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { UserProfile, Resource, SchoolInfo } from '@/types';
import { fetchClassResources, getCurrentProfile, logoutUser } from '@/lib/services/databaseService';
import { ToastProvider } from '@/components/ui/Toast';
import Logo from '@/components/ui/Logo';

const SCHOOL: SchoolInfo = {
  name: 'Gayaza High School',
  location: 'Wakiso, Uganda',
  motto: 'Never Give Up',
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const current = await getCurrentProfile();
        if (mounted && current) {
          setProfile(current);
          setIsAuthenticated(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkUser();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    fetchClassResources(SCHOOL.name).then((list) => {
      if (mounted && list.length) setResources(list);
    });
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setProfile(userProfile);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setProfile(null);
  };

  const handleAddResource = (newRes: Resource) => {
    setResources((prev) => [newRes, ...prev]);
  };

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-uni-blue-950">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <Logo size="lg" variant="dark" subtitle="Gayaza High School" />
          <div className="relative h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[shimmer_1.4s_infinite] rounded-full bg-crane-yellow" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Preparing your learning space
          </p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      {!isAuthenticated || !profile ? (
        <Login onLogin={handleLoginSuccess} schoolName={SCHOOL.name} />
      ) : (
        <div className="relative min-h-dvh bg-surface">
          {profile.role === 'student' && (
            <StudentDashboard
              onLogout={handleLogout}
              resources={resources}
              school={SCHOOL}
              userProfile={profile}
            />
          )}

          {profile.role === 'teacher' && (
            <TeacherDashboard
              onLogout={handleLogout}
              resources={resources}
              onAddResource={handleAddResource}
              school={SCHOOL}
              userProfile={profile}
            />
          )}

          {profile.role === 'parent' && (
            <ParentDashboard onLogout={handleLogout} school={SCHOOL} userProfile={profile} />
          )}

          {profile.role === 'academic' && (
            <AcademicDashboard onLogout={handleLogout} school={SCHOOL} userProfile={profile} />
          )}

          {profile.role === 'admin' && (
            <AdminDashboard onLogout={handleLogout} userProfile={profile} />
          )}
        </div>
      )}
    </ToastProvider>
  );
}
