/**
 * Synthetic demonstration fixtures for local and staging development.
 * Note: These are synthetic placeholder records. Never use real student data.
 */

export const DEMO_PASSWORD_RAW = 'DemoUser123!';

export const demoUsers = [
  {
    email: 'admin@example.edu',
    displayName: 'Demo Administrator',
    role: 'admin',
    studentId: null,
    isActive: true,
  },
  {
    email: 'faculty@example.edu',
    displayName: 'Prof. Ananya Sen',
    role: 'faculty',
    studentId: null,
    isActive: true,
  },
  {
    email: 'placement@example.edu',
    displayName: 'Rajesh Mehra (Placement Officer)',
    role: 'placement_officer',
    studentId: null,
    isActive: true,
  },
  {
    email: 'student@example.edu',
    displayName: 'Aarav Sharma (Student)',
    role: 'student',
    studentId: 'STU_0001',
    isActive: true,
  },
];

export const demoStudents = [
  {
    studentId: 'STU_0001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    institutionId: 'INST_MAIN',
    department: 'CSE',
    program: 'B.Tech',
    semester: 5,
    cohort: '2023-2027',
    enrollmentYear: 2023,
    status: 'active',
    email: 'student@example.edu',
  },
  {
    studentId: 'STU_0002',
    firstName: 'Diya',
    lastName: 'Patel',
    institutionId: 'INST_MAIN',
    department: 'CSE',
    program: 'B.Tech',
    semester: 5,
    cohort: '2023-2027',
    enrollmentYear: 2023,
    status: 'active',
    email: 'diya.patel@example.edu',
  },
  {
    studentId: 'STU_0003',
    firstName: 'Rohan',
    lastName: 'Verma',
    institutionId: 'INST_MAIN',
    department: 'ECE',
    program: 'B.Tech',
    semester: 5,
    cohort: '2023-2027',
    enrollmentYear: 2023,
    status: 'active',
    email: 'rohan.verma@example.edu',
  },
];

export const demoAcademicRecords = [
  {
    studentId: 'STU_0001',
    term: '2026-S1',
    subjectCode: 'CS301',
    subjectName: 'Data Structures and Algorithms',
    assessmentType: 'final',
    marksObtained: 72,
    maxMarks: 100,
    grade: 'B+',
    cgpa: 7.4,
    backlog: false,
    observedAt: new Date('2026-09-15T10:00:00Z'),
  },
  {
    studentId: 'STU_0001',
    term: '2026-S1',
    subjectCode: 'CS302',
    subjectName: 'Operating Systems',
    assessmentType: 'final',
    marksObtained: 68,
    maxMarks: 100,
    grade: 'B',
    cgpa: 7.4,
    backlog: false,
    observedAt: new Date('2026-09-18T10:00:00Z'),
  },
];

export const demoAttendanceRecords = [
  {
    studentId: 'STU_0001',
    term: '2026-S1',
    subjectCode: 'CS301',
    classesAttended: 38,
    classesHeld: 48,
    attendancePercentage: 79.17,
    periodStart: new Date('2026-07-01T00:00:00Z'),
    periodEnd: new Date('2026-09-30T00:00:00Z'),
    observedAt: new Date('2026-09-30T10:00:00Z'),
  },
];

export const demoLmsActivity = [
  {
    studentId: 'STU_0001',
    periodStart: new Date('2026-08-01T00:00:00Z'),
    periodEnd: new Date('2026-09-30T00:00:00Z'),
    loginCount: 42,
    activeDays: 30,
    assignmentsAssigned: 10,
    assignmentsCompleted: 8,
    engagementMinutes: 1850,
    observedAt: new Date('2026-09-30T12:00:00Z'),
  },
];

export const demoEngagementRecords = [
  {
    studentId: 'STU_0001',
    activityType: 'hackathon',
    activityName: 'CampusHack 2026',
    hours: 24,
    result: 'Finalist',
    occurredAt: new Date('2026-08-20T18:00:00Z'),
  },
];

export const demoPlacementAssessments = [
  {
    studentId: 'STU_0001',
    assessmentType: 'aptitude',
    score: 75,
    maxScore: 100,
    outcomeLabel: 'qualified',
    assessedAt: new Date('2026-09-10T14:00:00Z'),
  },
];

export const demoSkillAssessments = [
  {
    studentId: 'STU_0001',
    skillCategory: 'technical',
    skillName: 'Python Programming',
    score: 80,
    maxScore: 100,
    assessedAt: new Date('2026-09-05T10:00:00Z'),
  },
  {
    studentId: 'STU_0001',
    skillCategory: 'soft_skill',
    skillName: 'Technical Communication',
    score: 74,
    maxScore: 100,
    assessedAt: new Date('2026-09-05T11:00:00Z'),
  },
];

export const demoFeedbackRecords = [
  {
    studentId: 'STU_0001',
    feedbackType: 'course_feedback',
    rating: 4,
    comment: 'Practical sessions and labs were interactive and helpful.',
    visibility: 'staff_only',
    createdAt: new Date('2026-09-25T09:00:00Z'),
  },
];

export const demoInterventionCatalog = [
  {
    interventionType: 'peer_tutoring',
    name: 'Peer Tutoring Programme',
    description: 'Weekly student-led tutorial sessions in core computer science courses.',
    eligibilityRules: { minAttendance: 50, maxCgpa: 7.5 },
    capacityUnit: 'seats',
    costUnits: 100,
    durationDays: 30,
    active: true,
  },
  {
    interventionType: 'remedial_classes',
    name: 'Remedial Faculty Mentoring',
    description: 'Special faculty mentoring classes for struggling academic subjects.',
    eligibilityRules: { backlogCount: 1 },
    capacityUnit: 'seats',
    costUnits: 150,
    durationDays: 45,
    active: true,
  },
  {
    interventionType: 'placement_bootcamp',
    name: 'Placement Readiness Bootcamp',
    description: 'Intensive aptitude and technical interview preparation workshop.',
    eligibilityRules: { semesterMin: 5 },
    capacityUnit: 'seats',
    costUnits: 200,
    durationDays: 14,
    active: true,
  },
];
