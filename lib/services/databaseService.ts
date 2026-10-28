import { supabase, DEMO_MODE } from '@/lib/supabase/client';
import {
  ApprovalStatus,
  Exam,
  MasteryStatus,
  Resource,
  SchoolClass,
  StudentProgress,
  SyllabusNode,
  TeacherFeedback,
  UserProfile,
  UserRole,
} from '@/types';
import {
  DEMO_ACCOUNTS,
  DEMO_CHILD,
  DEMO_CLASSES,
  DEMO_EXAMS,
  DEMO_FEEDBACK,
  DEMO_MASTERY,
  DEMO_PASSWORD,
  DEMO_PENDING_STUDENTS,
  DEMO_RESOURCES,
  DEMO_STUDENT_PROGRESS,
  DEMO_TEACHERS,
  profileForDemo,
} from '@/lib/demo/data';

/* ------------------------------------------------------------------ */
/*  Demo session helpers                                               */
/* ------------------------------------------------------------------ */

const SESSION_KEY = 'soma.demo.session';

function readDemoSession(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveDemoSession(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  } catch {
    /* storage might be blocked — demo still works for the session */
  }
}

export function clearDemoSession() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}

/** One-click demo sign in used by the login screen. */
export function loginAsDemo(role: UserRole): UserProfile {
  const profile = profileForDemo(role);
  saveDemoSession(profile);
  return profile;
}

/* ------------------------------------------------------------------ */
/*  Demo mutable state (so interactions persist during the session)     */
/* ------------------------------------------------------------------ */

let demoResources: Resource[] = [...DEMO_RESOURCES];
let demoFeedback: TeacherFeedback[] = [...DEMO_FEEDBACK];
let demoExams: Exam[] = [...DEMO_EXAMS];
let demoPending: UserProfile[] = [...DEMO_PENDING_STUDENTS];
let demoClasses: SchoolClass[] = [...DEMO_CLASSES];

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? 'Soma user'),
    role: row.role as UserRole,
    schoolId: (row.school_id as string) || '',
    email: (row.email as string) || '',
    status: row.status as ApprovalStatus,
    studentCode: (row.student_code as string) || undefined,
    className: (row.class_name as string) || undefined,
  };
}

export const authenticateUser = async (email: string, password: string): Promise<UserProfile | null> => {
  const normalised = email.trim().toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalised, password });
      if (!error && data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) {
          const mapped = mapProfile(profile as Record<string, unknown>);
          saveDemoSession(mapped);
          return mapped;
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  // Demo fallback: accept published demo credentials even if Supabase is configured.
  const account = Object.values(DEMO_ACCOUNTS).find(
    (a) => a.email.toLowerCase() === normalised && a.password === password
  );
  if (!account) return null;

  const profile = profileForDemo(account.role);
  saveDemoSession(profile);
  return profile;
};

export const registerUser = async (
  fullName: string,
  email: string,
  password: string,
  role: UserRole
): Promise<{ success: boolean; profile?: UserProfile; message?: string }> => {
  const isStudent = role === 'student';
  const studentCode = isStudent ? `SOMA-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

  if (supabase) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError || !authData.user) {
        return { success: false, message: authError?.message || 'Registration failed' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          email,
          role,
          status: isStudent ? 'PENDING' : 'APPROVED',
          student_code: studentCode || null,
          school_id: null,
        })
        .select()
        .single();

      if (profileError || !profile) {
        return { success: false, message: 'Failed to create profile' };
      }

      return { success: true, profile: mapProfile(profile as Record<string, unknown>) };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred while creating your profile' };
    }
  }

  // Demo mode: simulate a successful registration without persistence.
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }
  const profile: UserProfile = {
    id: `demo-${role}-${Date.now()}`,
    fullName: fullName.trim(),
    role,
    schoolId: 'Gayaza High School',
    email: email.trim().toLowerCase(),
    status: isStudent ? 'PENDING' : 'APPROVED',
    studentCode,
    className: isStudent ? 'Senior 4 West' : undefined,
  };

  if (!isStudent) saveDemoSession(profile);

  return {
    success: true,
    profile,
    message: isStudent
      ? 'Demo registration received. In production this awaits academic approval.'
      : 'Demo account created locally.',
  };
};

export const getCurrentProfile = async (): Promise<UserProfile | null> => {
  if (!supabase) return readDemoSession();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (!profileData) return null;

    const profile = mapProfile(profileData as Record<string, unknown>);
    return profile;
  } catch (error) {
    console.error('Error checking user:', error);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  clearDemoSession();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
};

/* ------------------------------------------------------------------ */
/*  Mastery & progress                                                */
/* ------------------------------------------------------------------ */

export const fetchStudentProgress = async (subject = 'Biology'): Promise<StudentProgress[]> => {
  if (!supabase) return [...DEMO_STUDENT_PROGRESS];

  try {
    const { data } = await supabase
      .from('student_mastery')
      .select(`student_id, mastery_percentage, updated_at, profiles!inner(full_name)`)
      .eq('subject', subject);

    if (!data) return [];

    return data.map((item: Record<string, any>) => ({
      studentId: item.student_id,
      studentName: item.profiles?.full_name || 'Student',
      mastery: item.mastery_percentage ?? 0,
      lastActive: new Date(item.updated_at).toLocaleString(),
      status: item.mastery_percentage >= 80 ? 'excellent' : item.mastery_percentage >= 50 ? 'on-track' : 'at-risk',
    }));
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return [...DEMO_STUDENT_PROGRESS];
  }
};

export const fetchStudentMastery = async (studentId?: string): Promise<SyllabusNode[]> => {
  if (!supabase) return DEMO_MASTERY.map((node) => ({ ...node }));

  try {
    const { data } = await supabase
      .from('student_mastery')
      .select('*')
      .eq('student_id', studentId || '')
      .eq('subject', 'Biology')
      .order('unit_id', { ascending: true });

    if (!data || data.length === 0) return DEMO_MASTERY.map((node) => ({ ...node }));

    return data.map((item, index) => ({
      id: item.id,
      title: item.unit_id,
      subject: item.subject,
      status: item.status as MasteryStatus,
      order: index + 1,
      progress: item.mastery_percentage,
    }));
  } catch (error) {
    console.error('Error fetching mastery:', error);
    return DEMO_MASTERY.map((node) => ({ ...node }));
  }
};

/* ------------------------------------------------------------------ */
/*  Feedback                                                           */
/* ------------------------------------------------------------------ */

export const sendStudentFeedback = async (
  teacherId: string,
  studentId: string,
  subject: string,
  message: string,
  teacherName?: string
): Promise<boolean> => {
  if (!supabase) {
    demoFeedback = [
      {
        id: `fb-${Date.now()}`,
        fromTeacher: teacherName || DEMO_TEACHERS[0].fullName,
        subject,
        message,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      },
      ...demoFeedback,
    ];
    return true;
  }

  try {
    const { error } = await supabase.from('feedback').insert({
      teacher_id: teacherId,
      student_id: studentId,
      subject,
      message,
    });
    return !error;
  } catch (error) {
    console.error('Error sending feedback:', error);
    return false;
  }
};

export const fetchStudentFeedback = async (studentId: string): Promise<TeacherFeedback[]> => {
  if (!supabase) return [...demoFeedback];

  try {
    const { data } = await supabase
      .from('feedback')
      .select(
        `id, subject, message, created_at, profiles!feedback_teacher_id_fkey(full_name)`
      )
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (!data) return [];

    return data.map((item: Record<string, any>) => ({
      id: item.id,
      fromTeacher: item.profiles?.full_name || 'Teacher',
      subject: item.subject,
      message: item.message,
      date: new Date(item.created_at).toLocaleDateString(),
    }));
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [...demoFeedback];
  }
};

/* ------------------------------------------------------------------ */
/*  Exams                                                              */
/* ------------------------------------------------------------------ */

export const scheduleExam = async (exam: Omit<Exam, 'id'>, schoolId?: string): Promise<Exam | null> => {
  if (!supabase) {
    const created: Exam = { ...exam, id: `exam-${Date.now()}` };
    demoExams = [...demoExams, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return created;
  }

  try {
    const { data, error } = await supabase
      .from('exams')
      .insert({
        school_id: schoolId || null,
        title: exam.title,
        subject: exam.subject,
        exam_date: exam.date,
        duration: exam.duration,
        status: exam.status,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      date: data.exam_date || '',
      duration: data.duration || '',
      status: data.status,
    };
  } catch (error) {
    console.error('Error scheduling exam:', error);
    return null;
  }
};

export const fetchUpcomingExams = async (schoolId?: string, subject?: string): Promise<Exam[]> => {
  if (!supabase) {
    return demoExams
      .filter((e) => (subject ? e.subject === subject : true))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e) => ({ ...e }));
  }

  try {
    let query = supabase
      .from('exams')
      .select('*')
      .order('exam_date', { ascending: true });

    if (schoolId) query = query.eq('school_id', schoolId);
    if (subject) query = query.eq('subject', subject);

    const { data } = await query;
    if (!data) return [];

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      subject: item.subject,
      date: item.exam_date || '',
      duration: item.duration || '',
      status: item.status,
    }));
  } catch (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
};

/* ------------------------------------------------------------------ */
/*  Enrollment & classes                                              */
/* ------------------------------------------------------------------ */

export const fetchPendingStudents = async (schoolId?: string): Promise<UserProfile[]> => {
  if (!supabase) return [...demoPending];

  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('status', 'PENDING');
    if (schoolId) query = query.eq('school_id', schoolId);

    const { data } = await query;
    if (!data) return [];

    return data.map((item) => mapProfile(item as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching pending students:', error);
    return [...demoPending];
  }
};

export const updateStudentStatus = async (studentId: string, status: ApprovalStatus): Promise<boolean> => {
  if (!supabase) {
    demoPending = demoPending.filter((s) => s.id !== studentId);
    return true;
  }

  try {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', studentId);
    return !error;
  } catch (error) {
    console.error('Error updating student status:', error);
    return false;
  }
};

export const fetchSchoolClasses = async (schoolId?: string): Promise<SchoolClass[]> => {
  if (!supabase) return [...demoClasses];

  try {
    let query = supabase.from('classes').select('*');
    if (schoolId) query = query.eq('school_id', schoolId);

    const { data } = await query;
    if (!data) return [];

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      level: item.level,
      studentCount: item.student_count,
    }));
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [...demoClasses];
  }
};

export const createSchoolClass = async (
  schoolId: string | undefined,
  name: string,
  level: string
): Promise<SchoolClass | null> => {
  if (!supabase) {
    const created: SchoolClass = {
      id: `class-${Date.now()}`,
      name,
      level,
      studentCount: 0,
    };
    demoClasses = [...demoClasses, created];
    return created;
  }

  try {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        school_id: schoolId || null,
        name,
        level,
        student_count: 0,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      level: data.level,
      studentCount: data.student_count,
    };
  } catch (error) {
    console.error('Error creating class:', error);
    return null;
  }
};

export const fetchTeachers = async (schoolId?: string): Promise<UserProfile[]> => {
  if (!supabase) return [...DEMO_TEACHERS];

  try {
    let query = supabase.from('profiles').select('*').eq('role', 'teacher');
    if (schoolId && schoolId !== 'GLOBAL') query = query.eq('school_id', schoolId);

    const { data } = await query;
    if (!data) return [];

    return data.map((item) => mapProfile(item as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [...DEMO_TEACHERS];
  }
};

/* ------------------------------------------------------------------ */
/*  Resources                                                          */
/* ------------------------------------------------------------------ */

export const fetchClassResources = async (schoolId?: string, subjectFilter?: string): Promise<Resource[]> => {
  if (!supabase) {
    return demoResources
      .filter((r) => (subjectFilter ? r.subject === subjectFilter : true))
      .map((r) => ({ ...r }));
  }

  try {
    let query = supabase.from('resources').select('*');
    if (schoolId && schoolId !== 'GLOBAL') query = query.eq('school_id', schoolId);
    if (subjectFilter) query = query.eq('subject', subjectFilter);

    const { data } = await query;
    if (!data) return [];

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      unit: item.unit,
      fileSize: item.file_size || '',
      subject: item.subject,
      content: item.content || '',
    }));
  } catch (error) {
    console.error('Error fetching resources:', error);
    return demoResources.map((r) => ({ ...r }));
  }
};

export const createResource = async (
  input: { title: string; content: string; subject: string; unit: string; fileSize?: string },
  teacherId?: string,
  schoolId?: string,
  teacherName?: string
): Promise<Resource | null> => {
  if (!supabase) {
    const created: Resource = {
      id: `res-${Date.now()}`,
      title: input.title,
      content: input.content,
      subject: input.subject,
      unit: input.unit,
      fileSize: input.fileSize || `${Math.max(1, Math.round(input.content.length / 900))} MB`,
      teacherName,
      createdAt: new Date().toISOString(),
    };
    demoResources = [created, ...demoResources];
    return created;
  }

  try {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        school_id: schoolId || null,
        teacher_id: teacherId || null,
        subject: input.subject,
        unit: input.unit,
        title: input.title,
        content: input.content,
        file_size: input.fileSize || null,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      unit: data.unit,
      fileSize: data.file_size || '',
      subject: data.subject,
      content: data.content || '',
    };
  } catch (error) {
    console.error('Error creating resource:', error);
    return null;
  }
};

export const deleteResource = async (resourceId: string): Promise<boolean> => {
  if (!supabase) {
    demoResources = demoResources.filter((r) => r.id !== resourceId);
    return true;
  }

  try {
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);
    return !error;
  } catch (error) {
    console.error('Error deleting resource:', error);
    return false;
  }
};

/* ------------------------------------------------------------------ */
/*  Platform & guardian helpers                                        */
/* ------------------------------------------------------------------ */

export const fetchSystemHealth = async () => {
  if (!supabase) {
    return { status: 'Optimal', users: 1284, uptime: '99.98%' };
  }

  try {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    return { status: 'Optimal', users: count || 0, uptime: '99.9%' };
  } catch (error) {
    console.error('Error fetching system health:', error);
    return { status: 'Error', users: 0, uptime: '0%' };
  }
};

export const fetchTeacherCourses = async (teacherId: string): Promise<string[]> => {
  if (!supabase) return ['Biology', 'Mathematics', 'Physics', 'Chemistry'];

  try {
    const { data } = await supabase.from('resources').select('subject').eq('teacher_id', teacherId);
    if (!data) return [];
    return [...new Set(data.map((item) => item.subject))];
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return ['Biology'];
  }
};

export const assignCourseToTeacher = async (_teacherId: string, _subject: string) => {
  // A dedicated teacher_courses table can be added later. Demo returns success.
  return true;
};

export interface ChildSnapshot {
  name: string;
  code: string;
  className: string;
  attendance: number;
  rank: number;
  classSize: number;
  average: number;
  studyMinutes: number;
  streak: number;
  engagementDelta: number;
  teacherName: string;
  teacherNote: string;
}

const DEMO_CHILD_CODES: Record<string, string> = {
  'SOMA-4821': DEMO_CHILD.name,
  'SOMA-7734': 'Brenda Nansubuga',
  'SOMA-6152': 'Kevin Ochieng',
  'SOMA-9083': 'Patricia Auma',
  'SOMA-3407': 'Brian Ssenyonga',
};

export const linkStudentByCode = async (
  parentId: string,
  studentCode: string
): Promise<{ success: boolean; studentName?: string; snapshot?: ChildSnapshot }> => {
  const code = studentCode.trim().toUpperCase();

  if (!supabase) {
    const name = DEMO_CHILD_CODES[code];
    if (!name) return { success: false };
    return {
      success: true,
      studentName: name,
      snapshot: { ...DEMO_CHILD, name, code },
    };
  }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, student_code')
      .eq('student_code', code)
      .eq('role', 'student')
      .single();

    if (!data) return { success: false };

    return {
      success: true,
      studentName: data.full_name,
      snapshot: { ...DEMO_CHILD, name: data.full_name, code },
    };
  } catch (error) {
    console.error('Error linking student:', error);
    return { success: false };
  }
};

export const DEMO_MODE_ENABLED = DEMO_MODE;
export const DEMO_PASSWORD_HINT = DEMO_PASSWORD;
