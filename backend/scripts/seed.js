import bcrypt from 'bcryptjs';
import { config } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import {
  User,
  Student,
  AcademicRecord,
  AttendanceRecord,
  LmsActivity,
  EngagementRecord,
  PlacementAssessment,
  SkillAssessment,
  FeedbackRecord,
  InterventionCatalog,
  StudentScore,
  RiskPrediction,
  AuditEvent,
} from '../src/models/index.js';
import {
  DEMO_PASSWORD_RAW,
  demoUsers,
  demoInterventionCatalog,
} from '../src/db/seeds/fixtures.js';
import { rebuildSegments } from '../src/segments/segment.service.js';

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Rohan', 'Priya', 'Vikram', 'Ananya', 'Sneha', 'Karan', 'Aditi', 'Rahul',
  'Neha', 'Arjun', 'Isha', 'Kabir', 'Tanvi', 'Manish', 'Pooja', 'Siddharth', 'Meera', 'Varun',
  'Kavya', 'Gaurav', 'Rhea', 'Dev', 'Shreya', 'Amit', 'Anushka', 'Harsh', 'Simran', 'Akash',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Singh', 'Iyer', 'Reddy', 'Mehta', 'Nair', 'Gupta', 'Chopra',
  'Joshi', 'Bose', 'Das', 'Malhotra', 'Rao', 'Kaur', 'Saxena', 'Pandey', 'Kulkarni', 'Bhat',
];

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Data Science',
  'Electronics & Comm.',
  'Mechanical',
];

const SUBJECTS_BY_DEPT = {
  'Computer Science': [
    { code: 'CS301', name: 'Data Structures and Algorithms' },
    { code: 'CS302', name: 'Operating Systems' },
    { code: 'CS303', name: 'Database Management Systems' },
    { code: 'CS304', name: 'Computer Networks' },
  ],
  'Information Technology': [
    { code: 'IT301', name: 'Web Architecture' },
    { code: 'IT302', name: 'Software Engineering' },
    { code: 'IT303', name: 'Cloud Computing' },
    { code: 'IT304', name: 'Information Security' },
  ],
  'Data Science': [
    { code: 'DS301', name: 'Machine Learning Foundations' },
    { code: 'DS302', name: 'Statistical Inference' },
    { code: 'DS303', name: 'Big Data Processing' },
    { code: 'DS304', name: 'Data Visualization' },
  ],
  'Electronics & Comm.': [
    { code: 'EC301', name: 'Digital Signal Processing' },
    { code: 'EC302', name: 'Microcontrollers' },
    { code: 'EC303', name: 'VLSI Design' },
    { code: 'EC304', name: 'Communication Systems' },
  ],
  Mechanical: [
    { code: 'ME301', name: 'Thermodynamics' },
    { code: 'ME302', name: 'Fluid Mechanics' },
    { code: 'ME303', name: 'Machine Design' },
    { code: 'ME304', name: 'Manufacturing Processes' },
  ],
};

function generateCohort(count = 120) {
  const students = [];
  const academicRecords = [];
  const attendanceRecords = [];
  const lmsRecords = [];
  const placementRecords = [];
  const skillRecords = [];
  const engagementRecords = [];
  const feedbackRecords = [];
  const scores = [];
  const riskPredictions = [];

  for (let i = 1; i <= count; i++) {
    const studentId = `STU_${String(i).padStart(4, '0')}`;
    const fn = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const ln = LAST_NAMES[Math.floor((i - 1) / FIRST_NAMES.length) % LAST_NAMES.length];
    const dept = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
    const semester = 4 + (i % 5);
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 30 ? i : ''}@pratibha.edu`;

    // 15% decoupled divergence: High CGPA (8.2-9.4) but Low Placement Readiness (Mock score < 65)
    const isDecoupledDivergence = i % 7 === 0;
    const isCriticalRisk = i % 13 === 0;

    let baseCgpa;
    let baseAttendance;
    let mockInterviewScore;
    let aptitudeScore;

    if (isCriticalRisk) {
      baseCgpa = +(5.2 + Math.random() * 0.9).toFixed(2);
      baseAttendance = +(55 + Math.random() * 14).toFixed(1);
      mockInterviewScore = +(45 + Math.random() * 15).toFixed(0);
      aptitudeScore = +(50 + Math.random() * 12).toFixed(0);
    } else if (isDecoupledDivergence) {
      baseCgpa = +(8.2 + Math.random() * 1.2).toFixed(2); // High CGPA
      baseAttendance = +(82 + Math.random() * 14).toFixed(1);
      mockInterviewScore = +(48 + Math.random() * 14).toFixed(0); // Low Placement!
      aptitudeScore = +(62 + Math.random() * 10).toFixed(0);
    } else {
      baseCgpa = +(6.8 + Math.random() * 2.4).toFixed(2);
      baseAttendance = +(75 + Math.random() * 22).toFixed(1);
      mockInterviewScore = +(65 + Math.random() * 25).toFixed(0);
      aptitudeScore = +(70 + Math.random() * 22).toFixed(0);
    }

    baseAttendance = Math.min(98.5, Math.max(52.0, baseAttendance));
    baseCgpa = Math.min(9.8, Math.max(4.8, baseCgpa));

    // Student Entity
    students.push({
      studentId,
      firstName: fn,
      lastName: ln,
      institutionId: 'INST_MAIN',
      department: dept,
      program: 'B.Tech',
      semester,
      cohort: '2023-2027',
      enrollmentYear: 2023,
      status: 'active',
      email,
    });

    // 1. Academic Records
    const subjects = SUBJECTS_BY_DEPT[dept] || SUBJECTS_BY_DEPT['Computer Science'];
    subjects.forEach((subj, sIdx) => {
      const marks = Math.min(98, Math.max(45, Math.round(baseCgpa * 9.5 + (sIdx % 2 === 0 ? 3 : -3))));
      academicRecords.push({
        studentId,
        term: '2026-S1',
        subjectCode: subj.code,
        subjectName: subj.name,
        assessmentType: 'final',
        marksObtained: marks,
        maxMarks: 100,
        grade: marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : marks >= 60 ? 'B' : 'C',
        cgpa: baseCgpa,
        backlog: marks < 50,
        observedAt: new Date('2026-09-15T10:00:00Z'),
      });
    });

    // 2. Attendance Records
    subjects.forEach((subj) => {
      const totalClasses = 50;
      const attended = Math.round((baseAttendance / 100) * totalClasses);
      attendanceRecords.push({
        studentId,
        term: '2026-S1',
        subjectCode: subj.code,
        classesHeld: totalClasses,
        classesAttended: attended,
        attendancePercentage: +((attended / totalClasses) * 100).toFixed(1),
        periodStart: new Date('2026-08-01T00:00:00Z'),
        periodEnd: new Date('2026-10-01T00:00:00Z'),
        observedAt: new Date('2026-10-01T00:00:00Z'),
      });
    });

    // 3. LMS Records
    const totalAssignments = 8;
    const completedAssignments = isCriticalRisk ? 3 : Math.min(totalAssignments, Math.round(5 + Math.random() * 3));
    lmsRecords.push({
      studentId,
      periodStart: new Date('2026-08-01T00:00:00Z'),
      periodEnd: new Date('2026-10-01T00:00:00Z'),
      loginCount: isCriticalRisk ? 12 : Math.round(25 + Math.random() * 40),
      activeDays: isCriticalRisk ? 10 : Math.round(20 + Math.random() * 30),
      assignmentsAssigned: totalAssignments,
      assignmentsCompleted: completedAssignments,
      engagementMinutes: isCriticalRisk ? 120 : Math.round(300 + Math.random() * 600),
      observedAt: new Date(),
    });

    // 4. Placement Records
    placementRecords.push(
      {
        studentId,
        assessmentType: 'mock_interview',
        score: mockInterviewScore,
        maxScore: 100,
        outcomeLabel: mockInterviewScore >= 65 ? 'Passed' : 'Needs Practice',
        employerOrProgram: 'Campus Mock Placement Drive',
        assessedAt: new Date('2026-09-20T00:00:00Z'),
      },
      {
        studentId,
        assessmentType: 'aptitude',
        score: aptitudeScore,
        maxScore: 100,
        outcomeLabel: aptitudeScore >= 60 ? 'Cleared' : 'Borderline',
        employerOrProgram: 'Quantitative Aptitude Assessment',
        assessedAt: new Date('2026-09-22T00:00:00Z'),
      }
    );

    // 5. Skill Records
    skillRecords.push(
      {
        studentId,
        skillCategory: 'technical',
        skillName: 'Data Structures & Algorithms',
        score: Math.round(baseCgpa * 9),
        maxScore: 100,
        assessedAt: new Date(),
      },
      {
        studentId,
        skillCategory: 'technical',
        skillName: 'System Architecture',
        score: Math.round(baseCgpa * 8.5),
        maxScore: 100,
        assessedAt: new Date(),
      }
    );

    // 6. Engagement Records
    engagementRecords.push({
      studentId,
      activityType: i % 2 === 0 ? 'hackathon' : 'club',
      activityName: i % 2 === 0 ? 'Inter-College Hackathon 2026' : 'ACM Computing Society',
      hours: 24,
      result: i % 2 === 0 ? 'Winner' : 'Active Member',
      occurredAt: new Date('2026-08-15T00:00:00Z'),
    });

    // 7. Feedback Records
    feedbackRecords.push({
      studentId,
      feedbackType: 'course_feedback',
      rating: isCriticalRisk ? 2 : Math.min(5, Math.max(3, Math.round(3 + Math.random() * 2))),
      comment: 'Practical exercises were insightful; requesting additional hands-on lab sessions.',
      visibility: 'aggregated',
      createdAt: new Date('2026-09-28T00:00:00Z'),
    });

    // Success Score Calculation (Formula sss-v1)
    const normAcademic = (baseCgpa / 10) * 100;
    const normAttendance = baseAttendance;
    const normPlacement = ((mockInterviewScore + aptitudeScore) / 200) * 100;
    const normLms = isCriticalRisk ? 40 : 85;
    const normEngagement = 75;

    const successScoreVal = +(
      normAcademic * 0.35 +
      normAttendance * 0.20 +
      normPlacement * 0.20 +
      normLms * 0.15 +
      normEngagement * 0.10
    ).toFixed(1);

    scores.push({
      studentId,
      period: '2026-S1',
      score: successScoreVal,
      formulaVersion: 'sss-v1',
      components: [
        { key: 'academic', rawValue: baseCgpa, normalizedValue: normAcademic, weight: 0.35 },
        { key: 'attendance', rawValue: baseAttendance, normalizedValue: normAttendance, weight: 0.20 },
        { key: 'placement', rawValue: mockInterviewScore, normalizedValue: normPlacement, weight: 0.20 },
        { key: 'lms', rawValue: normLms, normalizedValue: normLms, weight: 0.15 },
        { key: 'engagement', rawValue: normEngagement, normalizedValue: normEngagement, weight: 0.10 },
      ],
      drivers: [
        {
          name: 'Academic Performance',
          contribution: +(normAcademic * 0.35).toFixed(1),
          explanation: `Consistent CGPA standing of ${baseCgpa}/10.0 across major subjects.`,
        },
        {
          name: 'Attendance Consistency',
          contribution: +(normAttendance * 0.20).toFixed(1),
          explanation: `Classroom lecture attendance at ${baseAttendance}% meets criteria.`,
        },
        {
          name: 'Placement Preparedness',
          contribution: +(normPlacement * 0.20).toFixed(1),
          explanation: `Mock technical interview rating (${mockInterviewScore}%) observed.`,
        },
      ],
      missingFields: [],
      calculatedAt: new Date(),
    });

    // Decoupled Risk Predictions (Independent Academic Risk and Placement Risk)
    const academicRiskLevel = baseCgpa < 6.0 || baseAttendance < 65 ? 'high' : baseCgpa < 7.2 ? 'medium' : 'low';
    const placementRiskLevel = mockInterviewScore < 60 ? 'high' : mockInterviewScore < 75 ? 'medium' : 'low';

    riskPredictions.push(
      {
        studentId,
        target: 'academic_risk',
        riskLevel: academicRiskLevel,
        probability: academicRiskLevel === 'high' ? 0.88 : academicRiskLevel === 'medium' ? 0.45 : 0.12,
        modelVersion: 'academic-risk-lgbm-v1',
        featureSetVersion: 'fs-v1',
        predictedAt: new Date(),
        drivers: [
          {
            name: 'CGPA',
            direction: academicRiskLevel === 'high' ? 'increases_risk' : 'decreases_risk',
            observedValue: baseCgpa,
            explanation: `CGPA is ${baseCgpa}.`,
          },
          {
            name: 'Attendance',
            direction: baseAttendance < 75 ? 'increases_risk' : 'decreases_risk',
            observedValue: baseAttendance,
            explanation: `Course attendance is ${baseAttendance}%.`,
          },
        ],
      },
      {
        studentId,
        target: 'placement_risk',
        riskLevel: placementRiskLevel,
        probability: placementRiskLevel === 'high' ? 0.82 : placementRiskLevel === 'medium' ? 0.48 : 0.15,
        modelVersion: 'placement-risk-logreg-v1',
        featureSetVersion: 'fs-v1',
        predictedAt: new Date(),
        drivers: [
          {
            name: 'Mock Interview Performance',
            direction: placementRiskLevel === 'high' ? 'increases_risk' : 'decreases_risk',
            observedValue: mockInterviewScore,
            explanation: `Mock interview score is ${mockInterviewScore}/100.`,
          },
        ],
      }
    );
  }

  return {
    students,
    academicRecords,
    attendanceRecords,
    lmsRecords,
    placementRecords,
    skillRecords,
    engagementRecords,
    feedbackRecords,
    scores,
    riskPredictions,
  };
}

const DEMO_AUDIT_EVENTS = [
  {
    actorUserId: 'admin@pratibha.edu',
    action: 'SCENARIO_APPROVED',
    resourceType: 'simulation_scenario',
    resourceId: 'SCN_2026_09A',
    metadata: { strategy: 'targeted', allocatedCount: 38, capacityLimit: 50 },
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    actorUserId: 'admin@pratibha.edu',
    action: 'SEGMENTS_REBUILT',
    resourceType: 'student_segment',
    resourceId: null,
    metadata: { totalSegments: 5, evaluatedStudents: 120 },
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    actorUserId: 'admin@pratibha.edu',
    action: 'IMPORT_COMMITTED',
    resourceType: 'import',
    resourceId: 'IMP_2026_001',
    metadata: { datasetType: 'academic', acceptedCount: 120, rejectedCount: 0 },
    createdAt: new Date(Date.now() - 14400000),
  },
  {
    actorUserId: 'admin@pratibha.edu',
    action: 'USER_PROVISIONED',
    resourceType: 'user',
    resourceId: null,
    metadata: { email: 'mentor@pratibha.edu', role: 'faculty' },
    createdAt: new Date(Date.now() - 28800000),
  },
];

async function seed() {
  const isProd = config.isProd;
  const forceProd = process.argv.includes('--force-prod-seed');

  if (isProd && !forceProd) {
    console.error('CRITICAL: Seed script cannot be run against production database without --force-prod-seed.');
    process.exit(1);
  }

  console.log('[Seed] Starting database seed process...');
  await connectDatabase(config.mongoUri);

  try {
    // 1. Seed Users (with hashed passwords)
    console.log('[Seed] Seeding demo users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD_RAW, salt);

    for (const u of demoUsers) {
      await User.findOneAndUpdate(
        { email: u.email },
        { ...u, passwordHash },
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
    }
    console.log(`[Seed] Seeded ${demoUsers.length} demo users (default password: "${DEMO_PASSWORD_RAW}").`);

    // 2. Generate and Seed High-Volume Student Cohort (120 detailed students)
    console.log('[Seed] Generating high-volume cohort (120 students with longitudinal 7-category data)...');
    const cohort = generateCohort(120);

    // Clean existing records to prevent duplication
    await Student.deleteMany({});
    await AcademicRecord.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await LmsActivity.deleteMany({});
    await PlacementAssessment.deleteMany({});
    await SkillAssessment.deleteMany({});
    await EngagementRecord.deleteMany({});
    await FeedbackRecord.deleteMany({});
    await StudentScore.deleteMany({});
    await RiskPrediction.deleteMany({});
    await AuditEvent.deleteMany({});

    // Bulk insert cohort
    await Student.insertMany(cohort.students);
    await AcademicRecord.insertMany(cohort.academicRecords);
    await AttendanceRecord.insertMany(cohort.attendanceRecords);
    await LmsActivity.insertMany(cohort.lmsRecords);
    await PlacementAssessment.insertMany(cohort.placementRecords);
    await SkillAssessment.insertMany(cohort.skillRecords);
    await EngagementRecord.insertMany(cohort.engagementRecords);
    await FeedbackRecord.insertMany(cohort.feedbackRecords);
    await StudentScore.insertMany(cohort.scores);
    await RiskPrediction.insertMany(cohort.riskPredictions);
    await AuditEvent.insertMany(DEMO_AUDIT_EVENTS);

    console.log(`[Seed] Seeded ${cohort.students.length} students across 5 departments.`);
    console.log(`[Seed] Seeded ${cohort.academicRecords.length} academic course records.`);
    console.log(`[Seed] Seeded ${cohort.attendanceRecords.length} attendance records.`);
    console.log(`[Seed] Seeded ${cohort.lmsRecords.length} LMS activity records.`);
    console.log(`[Seed] Seeded ${cohort.placementRecords.length} placement assessments.`);
    console.log(`[Seed] Seeded ${cohort.scores.length} explainable Success Scores.`);
    console.log(`[Seed] Seeded ${cohort.riskPredictions.length} decoupled risk predictions.`);
    console.log(`[Seed] Seeded ${DEMO_AUDIT_EVENTS.length} immutable audit log entries.`);

    // 3. Seed Intervention Catalog
    for (const item of demoInterventionCatalog) {
      await InterventionCatalog.findOneAndUpdate(
        { interventionType: item.interventionType },
        item,
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
    }
    console.log(`[Seed] Seeded ${demoInterventionCatalog.length} intervention catalog entries.`);

    // 4. Build Initial Student Segments
    console.log('[Seed] Rebuilding initial student segments across entire database...');
    const segmentResult = await rebuildSegments();
    console.log(`[Seed] Initialized ${segmentResult.rebuiltCount} student segments.`);

    console.log('[Seed] Database seed completed successfully. MongoDB is populated with high-volume real data!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    throw err;
  } finally {
    await disconnectDatabase();
  }
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
