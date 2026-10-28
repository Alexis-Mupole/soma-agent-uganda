import {
  Exam,
  MasteryStatus,
  Resource,
  SchoolClass,
  SchoolInfo,
  StudentProgress,
  SyllabusNode,
  TeacherFeedback,
  UserProfile,
  UserRole,
} from '@/types';

/**
 * Demo dataset.
 *
 * Soma-Agent is designed to be fully explorable without any environment
 * variables. Every service falls back to this data when Supabase is not
 * configured (or a query fails), which keeps the demo flawless.
 */

export const DEMO_SCHOOL: SchoolInfo = {
  name: 'Gayaza High School',
  location: 'Wakiso, Uganda',
  motto: 'Never Give Up',
};

export const DEMO_PASSWORD = 'soma2026';

export interface DemoAccount {
  role: UserRole;
  fullName: string;
  email: string;
  password: string;
  studentCode?: string;
  className?: string;
  blurb: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, DemoAccount> = {
  student: {
    role: 'student',
    fullName: 'Amina Nakato',
    email: 'amina@gayaza.ac.ug',
    password: DEMO_PASSWORD,
    studentCode: 'SOMA-4821',
    className: 'Senior 4 West',
    blurb: 'Mastery map, AI tutor & practice quizzes',
  },
  teacher: {
    role: 'teacher',
    fullName: 'Daniel Okello',
    email: 'teacher@gayaza.ac.ug',
    password: DEMO_PASSWORD,
    blurb: 'Class progress, notes & AI feedback drafts',
  },
  parent: {
    role: 'parent',
    fullName: 'Grace Nakato',
    email: 'parent@gayaza.ac.ug',
    password: DEMO_PASSWORD,
    blurb: 'Live progress reports & guardian insights',
  },
  academic: {
    role: 'academic',
    fullName: 'Sarah Namuli',
    email: 'academic@gayaza.ac.ug',
    password: DEMO_PASSWORD,
    blurb: 'Enrollment approvals & classroom setup',
  },
  admin: {
    role: 'admin',
    fullName: 'Peter Ssemakula',
    email: 'admin@gayaza.ac.ug',
    password: DEMO_PASSWORD,
    blurb: 'Platform telemetry & configuration',
  },
};

export function profileForDemo(role: UserRole): UserProfile {
  const a = DEMO_ACCOUNTS[role];
  return {
    id: `demo-${role}`,
    fullName: a.fullName,
    role,
    schoolId: DEMO_SCHOOL.name,
    email: a.email,
    status: 'APPROVED',
    studentCode: a.studentCode,
    className: a.className,
  };
}

export const DEMO_ACCOUNT_LIST = Object.values(DEMO_ACCOUNTS);

const iso = (daysFromNow: number, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const DEMO_RESOURCES: Resource[] = [
  {
    id: 'res-cell',
    title: 'Cell Biology: Structure & Function',
    subject: 'Biology',
    unit: 'Unit 1',
    fileSize: '1.4 MB',
    content: `Cells are the basic structural and functional units of all living organisms.

**The cell theory** states that all living things are made of cells, cells come from pre-existing cells, and the cell is the basic unit of life.

### Key organelles
- **Nucleus** – controls cell activities and contains genetic material (DNA).
- **Mitochondrion** – site of aerobic respiration; releases energy as ATP.
- **Ribosomes** – site of protein synthesis.
- **Cell membrane** – selectively permeable; controls movement of substances in and out of the cell.
- **Chloroplast** – contains chlorophyll; site of photosynthesis (plant cells only).
- **Vacuole** – stores sap and maintains turgor in plant cells.

### Plant vs animal cells
Plant cells have a cellulose cell wall, chloroplasts and a large permanent vacuole. Animal cells have no cell wall, no chloroplasts and only small temporary vacuoles.

> Exam tip: When asked to compare cells, always mention at least two structural differences and link each one to its function.`,
  },
  {
    id: 'res-photo',
    title: 'Plant Nutrition & Photosynthesis',
    subject: 'Biology',
    unit: 'Unit 2',
    fileSize: '1.1 MB',
    content: `Photosynthesis is the process by which green plants manufacture food using light energy.

### Word equation
Carbon dioxide + water → glucose + oxygen (in the presence of light and chlorophyll).

### Requirements
- **Chlorophyll** – traps light energy.
- **Carbon dioxide** – from the atmosphere through stomata.
- **Water** – absorbed by root hairs and transported in the xylem.
- **Light** – usually sunlight.

### Limiting factors
Light intensity, carbon dioxide concentration and temperature can limit the rate of photosynthesis.

### Adaptations of a leaf
A broad, flat lamina exposes a large surface area to light, while stomata and air spaces allow efficient gas exchange.

> Local analogy: Think of a leaf as a solar panel in a Kampala taxi park — maximum surface area facing the energy source.`,
  },
  {
    id: 'res-transport',
    title: 'Human Transport: Blood & Circulation',
    subject: 'Biology',
    unit: 'Unit 3',
    fileSize: '1.6 MB',
    content: `The circulatory system transports oxygen, nutrients, hormones and waste products around the body.

### Blood components
- **Red blood cells** – contain haemoglobin which carries oxygen.
- **White blood cells** – defend the body against pathogens.
- **Platelets** – help in blood clotting.
- **Plasma** – transports dissolved substances.

### The heart
The heart has four chambers: right atrium, right ventricle, left atrium and left ventricle. The left ventricle has the thickest wall because it pumps blood at high pressure to the whole body.

### Blood vessels
- **Arteries** carry blood away from the heart under high pressure; thick elastic walls.
- **Veins** carry blood back to the heart; valves prevent backflow.
- **Capillaries** are one cell thick for efficient exchange.

> Local analogy: Blood vessels work like Kampala's roads — arteries are the busy outbound routes, veins the return routes, and capillaries the small access lanes.`,
  },
  {
    id: 'res-coord',
    title: 'Coordination: Nervous & Endocrine Systems',
    subject: 'Biology',
    unit: 'Unit 4',
    fileSize: '1.2 MB',
    content: `Coordination ensures that different parts of the body work together in response to stimuli.

### The nervous system
A **stimulus** is detected by a receptor, which sends an impulse along a sensory neurone to the central nervous system. A motor neurone then carries the impulse to an effector (muscle or gland).

### The reflex arc
Receptor → sensory neurone → relay neurone (spinal cord) → motor neurone → effector.

Reflex actions are rapid and automatic, protecting the body from harm.

### The endocrine system
Hormones are chemical messengers carried in the blood. Examples include insulin (controls blood glucose), adrenaline (fight or flight) and thyroxine (metabolic rate).

> Exam tip: Nervous responses are fast and short-lived; hormonal responses are slower but longer lasting.`,
  },
  {
    id: 'res-homeo',
    title: 'Homeostasis: Keeping a Steady State',
    subject: 'Biology',
    unit: 'Unit 5',
    fileSize: '0.9 MB',
    content: `Homeostasis is the maintenance of a stable internal environment despite changes in the external environment.

### Temperature control
Receptors in the skin detect temperature changes. The hypothalamus coordinates responses such as sweating, vasodilation, shivering and vasoconstriction.

### Blood glucose control
- High glucose → pancreas releases **insulin** → liver converts glucose to glycogen.
- Low glucose → pancreas releases **glucagon** → glycogen is converted back to glucose.

### Osmoregulation
The kidneys control water balance by adjusting the concentration of urine. ADH increases water reabsorption when the body is dehydrated.

> Local analogy: Homeostasis is like a boda boda rider balancing a heavy load — small corrections keep everything stable on a bumpy road.`,
  },
  {
    id: 'res-math',
    title: 'Quadratic Equations Made Simple',
    subject: 'Mathematics',
    unit: 'Unit 2',
    fileSize: '0.8 MB',
    content: `A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0.

### Methods of solving
1. **Factorisation** – split the middle term, then group.
2. **Completing the square** – rewrite as (x + p)² = q.
3. **Quadratic formula** – x = (-b ± √(b² - 4ac)) / 2a.

### Worked example
Solve x² - 5x + 6 = 0.
Factorise: (x - 2)(x - 3) = 0, so x = 2 or x = 3.

### The discriminant
- b² - 4ac > 0 → two real roots
- b² - 4ac = 0 → one repeated root
- b² - 4ac < 0 → no real roots

> Exam tip: Always substitute your answer back into the original equation to check it.`,
  },
  {
    id: 'res-physics',
    title: 'Electricity: Current, Voltage & Resistance',
    subject: 'Physics',
    unit: 'Unit 3',
    fileSize: '1.0 MB',
    content: `Electric current is the rate of flow of electric charge, measured in amperes (A). Voltage (potential difference) is measured in volts (V). Resistance is measured in ohms (Ω).

### Ohm's law
V = IR, provided temperature remains constant.

### Series and parallel circuits
- Series: current is the same, voltage is shared, total resistance R = R₁ + R₂.
- Parallel: voltage is the same, current is shared, 1/R = 1/R₁ + 1/R₂.

### Electrical power
Power = voltage × current (P = VI). Energy = power × time.

> Local analogy: Voltage is the road pressure in a taxi route; resistance is the traffic jam that limits flow.`,
  },
  {
    id: 'res-chem',
    title: 'Acids, Bases & the pH Scale',
    subject: 'Chemistry',
    unit: 'Unit 4',
    fileSize: '0.9 MB',
    content: `Acids are proton donors; bases are proton acceptors. The pH scale runs from 0 to 14.

### Key ideas
- pH below 7 → acidic; pH 7 → neutral; pH above 7 → alkaline.
- Acids turn blue litmus red; alkalis turn red litmus blue.
- **Neutralisation** is the reaction between an acid and a base to form salt and water.

### Common examples
Hydrochloric acid (HCl), sulphuric acid (H₂SO₄), sodium hydroxide (NaOH), and ammonia (NH₃).

> Practical tip: Always add acid to water, never water to acid, to avoid violent splashing.`,
  },
  {
    id: 'res-english',
    title: 'Comprehension & Summary Skills',
    subject: 'English',
    unit: 'Unit 1',
    fileSize: '0.6 MB',
    content: `Comprehension requires careful reading, identifying key ideas and supporting details.

### Strategy
1. Read the passage twice before answering.
2. Underline the command words in each question (state, explain, describe, compare).
3. Answer in your own words where possible.
4. For summary questions, identify topic sentences and remove examples.

### Common mistakes
- Copying long chunks of the passage.
- Missing the required number of points.
- Ignoring the marks allocated per question.

> Exam tip: Two points usually mean two separate marks — write them as two clear sentences.`,
  },
];

export const RESOURCE_READ_MINUTES: Record<string, number> = {
  'res-cell': 12,
  'res-photo': 9,
  'res-transport': 14,
  'res-coord': 11,
  'res-homeo': 8,
  'res-math': 10,
  'res-physics': 11,
  'res-chem': 9,
  'res-english': 7,
};

export const DEMO_FEEDBACK: TeacherFeedback[] = [
  {
    id: 'fb-1',
    fromTeacher: 'Mr. Daniel Okello',
    subject: 'Biology',
    date: new Date(Date.now() - 1000 * 60 * 60 * 30).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    message:
      'Excellent improvement in cell biology, Amina. Your diagram labels are now precise — focus next on linking structure to function in the transport unit.',
  },
  {
    id: 'fb-2',
    fromTeacher: 'Ms. Ruth Kirabo',
    subject: 'Mathematics',
    date: new Date(Date.now() - 1000 * 60 * 60 * 76).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    message:
      'Your factorisation is strong. Practise the quadratic formula with questions where the coefficient of x² is not 1, and always check your discriminant.',
  },
  {
    id: 'fb-3',
    fromTeacher: 'Mr. Isaac Mwesigwa',
    subject: 'Physics',
    date: new Date(Date.now() - 1000 * 60 * 60 * 150).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    message:
      'Good effort on circuits. Remember to include units in every answer — you lost marks on the series and parallel circuit question.',
  },
];

export const DEMO_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'Biology Unit Test — Human Transport',
    subject: 'Biology',
    date: iso(3, 8),
    duration: '1 hour 30 min',
    status: 'upcoming',
  },
  {
    id: 'exam-2',
    title: 'Mathematics Mid-Term Assessment',
    subject: 'Mathematics',
    date: iso(6, 9),
    duration: '2 hours',
    status: 'upcoming',
  },
  {
    id: 'exam-3',
    title: 'Chemistry Practical — Acids & Bases',
    subject: 'Chemistry',
    date: iso(11, 14),
    duration: '1 hour 15 min',
    status: 'upcoming',
  },
  {
    id: 'exam-4',
    title: 'Physics End of Term Examination',
    subject: 'Physics',
    date: iso(17, 8),
    duration: '2 hours 30 min',
    status: 'upcoming',
  },
];

export const DEMO_PENDING_STUDENTS: UserProfile[] = [
  {
    id: 'pending-1',
    fullName: 'Brenda Nansubuga',
    role: 'student',
    schoolId: DEMO_SCHOOL.name,
    email: 'brenda.n@gayaza.ac.ug',
    status: 'PENDING',
    studentCode: 'SOMA-7734',
  },
  {
    id: 'pending-2',
    fullName: 'Kevin Ochieng',
    role: 'student',
    schoolId: DEMO_SCHOOL.name,
    email: 'kevin.o@gayaza.ac.ug',
    status: 'PENDING',
    studentCode: 'SOMA-6152',
  },
  {
    id: 'pending-3',
    fullName: 'Patricia Auma',
    role: 'student',
    schoolId: DEMO_SCHOOL.name,
    email: 'patricia.a@gayaza.ac.ug',
    status: 'PENDING',
    studentCode: 'SOMA-9083',
  },
  {
    id: 'pending-4',
    fullName: 'Brian Ssenyonga',
    role: 'student',
    schoolId: DEMO_SCHOOL.name,
    email: 'brian.s@gayaza.ac.ug',
    status: 'PENDING',
    studentCode: 'SOMA-3407',
  },
];

export const DEMO_CLASSES: SchoolClass[] = [
  { id: 'class-1', name: 'Senior 4 West', level: 'Senior 4', studentCount: 48 },
  { id: 'class-2', name: 'Senior 4 East', level: 'Senior 4', studentCount: 45 },
  { id: 'class-3', name: 'Senior 3 North', level: 'Senior 3', studentCount: 52 },
  { id: 'class-4', name: 'Senior 2 South', level: 'Senior 2', studentCount: 50 },
];

export const DEMO_TEACHERS: UserProfile[] = [
  { id: 'teacher-1', fullName: 'Daniel Okello', role: 'teacher', schoolId: DEMO_SCHOOL.name, email: 'daniel.o@gayaza.ac.ug', status: 'APPROVED' },
  { id: 'teacher-2', fullName: 'Ruth Kirabo', role: 'teacher', schoolId: DEMO_SCHOOL.name, email: 'ruth.k@gayaza.ac.ug', status: 'APPROVED' },
  { id: 'teacher-3', fullName: 'Isaac Mwesigwa', role: 'teacher', schoolId: DEMO_SCHOOL.name, email: 'isaac.m@gayaza.ac.ug', status: 'APPROVED' },
  { id: 'teacher-4', fullName: 'Joan Aciro', role: 'teacher', schoolId: DEMO_SCHOOL.name, email: 'joan.a@gayaza.ac.ug', status: 'APPROVED' },
];

export const DEMO_STUDENT_PROGRESS: StudentProgress[] = [
  { studentId: 'student-1', studentName: 'Amina Nakato', mastery: 68, lastActive: 'Today, 08:42', status: 'on-track' },
  { studentId: 'student-2', studentName: 'Brian Ssembatya', mastery: 88, lastActive: 'Today, 07:55', status: 'excellent' },
  { studentId: 'student-3', studentName: 'Faith Nakiwala', mastery: 76, lastActive: 'Yesterday, 19:10', status: 'on-track' },
  { studentId: 'student-4', studentName: 'Joshua Oketch', mastery: 54, lastActive: 'Yesterday, 16:02', status: 'on-track' },
  { studentId: 'student-5', studentName: 'Mercy Atim', mastery: 47, lastActive: '2 days ago', status: 'at-risk' },
  { studentId: 'student-6', studentName: 'Samuel Kigozi', mastery: 39, lastActive: '3 days ago', status: 'at-risk' },
  { studentId: 'student-7', studentName: 'Esther Nabirye', mastery: 82, lastActive: 'Today, 09:20', status: 'excellent' },
  { studentId: 'student-8', studentName: 'Derrick Musoke', mastery: 62, lastActive: 'Yesterday, 21:35', status: 'on-track' },
];

export const DEMO_WEEKLY = [
  { day: 'Mon', minutes: 48, mastery: 58, questions: 12 },
  { day: 'Tue', minutes: 62, mastery: 61, questions: 18 },
  { day: 'Wed', minutes: 35, mastery: 60, questions: 9 },
  { day: 'Thu', minutes: 74, mastery: 64, questions: 24 },
  { day: 'Fri', minutes: 55, mastery: 66, questions: 16 },
  { day: 'Sat', minutes: 96, mastery: 68, questions: 31 },
  { day: 'Sun', minutes: 40, mastery: 68, questions: 8 },
];

export const DEMO_PLATFORM_WEEKLY = [
  { day: 'Mon', logins: 412, queries: 2480 },
  { day: 'Tue', logins: 358, queries: 2190 },
  { day: 'Wed', logins: 486, queries: 3320 },
  { day: 'Thu', logins: 441, queries: 2980 },
  { day: 'Fri', logins: 529, queries: 3860 },
  { day: 'Sat', logins: 274, queries: 1440 },
  { day: 'Sun', logins: 228, queries: 980 },
];

export const DEMO_SECURITY_LOGS = [
  { event: 'Root administrator signed in', time: '2 min ago', status: 'OK' },
  { event: 'Gemini provider key rotated', time: '38 min ago', status: 'OK' },
  { event: 'New academic hub IP address', time: '1 hr ago', status: 'WARN' },
  { event: 'Bulk student import completed', time: '3 hrs ago', status: 'OK' },
  { event: 'Resource withdrawn by moderator', time: '5 hrs ago', status: 'OK' },
];

export const DEMO_MASTERY_BY_SUBJECT = [
  { subject: 'Biology', mastery: 68, target: 80, color: '#12b76a' },
  { subject: 'Mathematics', mastery: 54, target: 80, color: '#f5c542' },
  { subject: 'Chemistry', mastery: 61, target: 80, color: '#2c72a3' },
  { subject: 'Physics', mastery: 47, target: 80, color: '#8b5cf6' },
  { subject: 'English', mastery: 74, target: 80, color: '#ec4899' },
];

export const DEMO_CHILD = {
  name: 'Amina Nakato',
  code: 'SOMA-4821',
  className: 'Senior 4 West',
  attendance: 96,
  rank: 6,
  classSize: 48,
  average: 68,
  studyMinutes: 410,
  streak: 12,
  engagementDelta: 12,
  teacherName: 'Mr. Daniel Okello',
  teacherNote:
    'Amina has built strong momentum in Biology this month. Her AI practice sessions are paying off — encourage her to keep a short daily revision habit before the Unit 3 test.',
};

export const DEMO_MASTERY: SyllabusNode[] = [
  {
    id: 'unit-1',
    title: 'Cell Biology',
    subject: 'Biology',
    status: MasteryStatus.MASTERED,
    order: 1,
    progress: 92,
    description: 'Organelles, cell specialisation and microscopy',
  },
  {
    id: 'unit-2',
    title: 'Plant Nutrition',
    subject: 'Biology',
    status: MasteryStatus.MASTERED,
    order: 2,
    progress: 86,
    description: 'Photosynthesis, limiting factors and leaf structure',
  },
  {
    id: 'unit-3',
    title: 'Human Transport',
    subject: 'Biology',
    status: MasteryStatus.IN_PROGRESS,
    order: 3,
    progress: 45,
    description: 'Blood, the heart and double circulation',
  },
  {
    id: 'unit-4',
    title: 'Coordination',
    subject: 'Biology',
    status: MasteryStatus.LOCKED,
    order: 4,
    progress: 0,
    description: 'Nervous system, reflexes and hormones',
  },
  {
    id: 'unit-5',
    title: 'Homeostasis',
    subject: 'Biology',
    status: MasteryStatus.LOCKED,
    order: 5,
    progress: 0,
    description: 'Temperature, glucose and water balance',
  },
];


export const DEMO_DEMO_NOTES = [
  'No Supabase keys detected — running with the bundled demo dataset.',
  'No Gemini key detected — the offline Soma tutor is answering.',
  'Sign in with any role below. Password: soma2026.',
];
