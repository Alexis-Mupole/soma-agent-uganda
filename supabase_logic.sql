-- ======================================================
-- SOMA-AGENT INSTITUTIONAL DATABASE SCHEMA (POSTGRESQL)
-- ======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOLS
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    motto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,         -- e.g. 'Senior 4 West'
    level TEXT NOT NULL,        -- e.g. 'S.4'
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROFILES (Extends Auth Users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    school_id UUID REFERENCES schools(id),
    class_id UUID REFERENCES classes(id),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT CHECK (role IN ('student', 'teacher', 'parent', 'admin', 'academic')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    student_code TEXT UNIQUE,   -- Unique Institutional ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CURRICULUM RESOURCES
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id),
    teacher_id UUID REFERENCES profiles(id),
    subject TEXT NOT NULL,      -- e.g. 'Biology'
    unit TEXT NOT NULL,         -- e.g. 'Unit 1'
    title TEXT NOT NULL,
    content TEXT,               -- Stored markdown or text for AI context
    file_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ASSESSMENTS (EXAMS)
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id),
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    exam_date TIMESTAMP WITH TIME ZONE,
    duration TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ACADEMIC FEEDBACK
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id),
    teacher_id UUID REFERENCES profiles(id),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MASTERY TRACKING
CREATE TABLE student_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id),
    subject TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('LOCKED', 'IN_PROGRESS', 'MASTERED')),
    mastery_percentage INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Profiles: Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Academics (DOS): Can view and approve all students in their school
CREATE POLICY "Academics manage school profiles" 
ON profiles FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'academic' AND school_id = profiles.school_id
    )
);

-- Resources: Students can view resources for their school
CREATE POLICY "Students can view school resources" 
ON resources FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND school_id = resources.school_id
    )
);

-- Resources: Teachers can manage resources they created
CREATE POLICY "Teachers can manage own resources" 
ON resources FOR ALL 
USING (auth.uid() = teacher_id);

-- Admins: Global Access
CREATE POLICY "Admins have full global access" 
ON profiles FOR ALL 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
