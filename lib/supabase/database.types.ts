export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          location: string | null
          motto: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          motto?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          motto?: string | null
          created_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          id: string
          school_id: string | null
          name: string
          level: string
          student_count: number
          created_at: string
        }
        Insert: {
          id?: string
          school_id?: string | null
          name: string
          level: string
          student_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string | null
          name?: string
          level?: string
          student_count?: number
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          school_id: string | null
          class_id: string | null
          full_name: string
          email: string | null
          role: 'student' | 'teacher' | 'parent' | 'admin' | 'academic'
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          student_code: string | null
          created_at: string
        }
        Insert: {
          id: string
          school_id?: string | null
          class_id?: string | null
          full_name: string
          email?: string | null
          role: 'student' | 'teacher' | 'parent' | 'admin' | 'academic'
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          student_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string | null
          class_id?: string | null
          full_name?: string
          email?: string | null
          role?: 'student' | 'teacher' | 'parent' | 'admin' | 'academic'
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          student_code?: string | null
          created_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          id: string
          school_id: string | null
          teacher_id: string | null
          subject: string
          unit: string
          title: string
          content: string | null
          file_size: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id?: string | null
          teacher_id?: string | null
          subject: string
          unit: string
          title: string
          content?: string | null
          file_size?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string | null
          teacher_id?: string | null
          subject?: string
          unit?: string
          title?: string
          content?: string | null
          file_size?: string | null
          created_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          id: string
          school_id: string | null
          subject: string
          title: string
          exam_date: string | null
          duration: string | null
          status: 'upcoming' | 'active' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          school_id?: string | null
          subject: string
          title: string
          exam_date?: string | null
          duration?: string | null
          status?: 'upcoming' | 'active' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string | null
          subject?: string
          title?: string
          exam_date?: string | null
          duration?: string | null
          status?: 'upcoming' | 'active' | 'completed'
          created_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          student_id: string | null
          teacher_id: string | null
          subject: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id?: string | null
          teacher_id?: string | null
          subject: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string | null
          teacher_id?: string | null
          subject?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      student_mastery: {
        Row: {
          id: string
          student_id: string | null
          subject: string
          unit_id: string
          status: 'LOCKED' | 'IN_PROGRESS' | 'MASTERED'
          mastery_percentage: number
          updated_at: string
        }
        Insert: {
          id?: string
          student_id?: string | null
          subject: string
          unit_id: string
          status: 'LOCKED' | 'IN_PROGRESS' | 'MASTERED'
          mastery_percentage?: number
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string | null
          subject?: string
          unit_id?: string
          status?: 'LOCKED' | 'IN_PROGRESS' | 'MASTERED'
          mastery_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
