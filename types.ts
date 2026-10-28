
// Define the roles available in the system
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'academic';

// Approval status for students
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Status levels for syllabus progression
export enum MasteryStatus {
  LOCKED = 'LOCKED',
  IN_PROGRESS = 'IN_PROGRESS',
  MASTERED = 'MASTERED'
}

// Node in the syllabus mastery map
export interface SyllabusNode {
  id: string;
  title: string;
  subject: string;
  status: MasteryStatus;
  order: number;
  progress?: number;
  description?: string;
}

// User Profile with personalized information
export interface UserProfile {
  id: string; 
  fullName: string; 
  role: UserRole; 
  schoolId: string; 
  studentCode?: string; 
  email?: string;
  status?: ApprovalStatus;
  className?: string;
}

// Student Performance data for Teachers
export interface StudentProgress {
  studentId: string;
  studentName: string;
  mastery: number; // 0-100
  lastActive: string;
  status: 'at-risk' | 'on-track' | 'excellent';
}

// Teacher Feedback structure
export interface TeacherFeedback {
  id: string;
  fromTeacher: string;
  message: string;
  date: string;
  subject: string;
}

// Special Exam structure
export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: string;
  status: 'upcoming' | 'active' | 'completed';
}

// School Class structure
export interface SchoolClass {
  id: string;
  name: string;
  level: string;
  studentCount: number;
}

// Educational materials uploaded by teachers
export interface Resource {
  id: string; 
  title: string; 
  unit: string; 
  fileSize: string; 
  subject: string; 
  content: string; 
  readMinutes?: number;
  teacherName?: string;
  createdAt?: string;
}

// Configuration for the localized school
export interface SchoolInfo {
  name: string; 
  location: string;
  motto: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  mode?: 'gemini' | 'demo';
  suggestions?: string[];
  createdAt?: number;
}

/** A single multiple-choice question returned by the AI quiz service. */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  topic: string;
  questions: QuizQuestion[];
  mode: 'gemini' | 'demo';
  model?: string;
}
