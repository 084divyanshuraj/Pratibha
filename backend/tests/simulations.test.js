import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { User } from '../src/models/User.js';
import { Student } from '../src/models/Student.js';
import { AcademicRecord } from '../src/models/AcademicRecord.js';
import { AttendanceRecord } from '../src/models/AttendanceRecord.js';
import { PlacementAssessment } from '../src/models/PlacementAssessment.js';
import { StudentScore } from '../src/models/StudentScore.js';
import { RiskPrediction } from '../src/models/RiskPrediction.js';
import { SimulationScenario } from '../src/models/SimulationScenario.js';
import { Intervention } from '../src/models/Intervention.js';
import { InterventionCatalog } from '../src/models/InterventionCatalog.js';

describe('Phase 8 — Sandbox Simulator & Scenario Approval Workflow', () => {
  const TEST_PASSWORD = 'SimPassword123!';
  let adminToken = '';
  let facultyToken = '';
  let studentToken = '';

  const STU_1 = 'STU_SIM_001';
  const STU_2 = 'STU_SIM_002';
  const STU_3 = 'STU_SIM_003';
  const ALL_STUS = [STU_1, STU_2, STU_3];

  let testScenarioId = '';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean test accounts and records
    await User.deleteMany({ email: { $regex: /^sim\./ } });
    await Student.deleteMany({ studentId: { $in: ALL_STUS } });
    await AcademicRecord.deleteMany({ studentId: { $in: ALL_STUS } });
    await AttendanceRecord.deleteMany({ studentId: { $in: ALL_STUS } });
    await PlacementAssessment.deleteMany({ studentId: { $in: ALL_STUS } });
    await StudentScore.deleteMany({ studentId: { $in: ALL_STUS } });
    await RiskPrediction.deleteMany({ studentId: { $in: ALL_STUS } });
    await SimulationScenario.deleteMany({ createdBy: { $regex: /sim\./ } });
    await Intervention.deleteMany({ studentId: { $in: ALL_STUS } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    await User.create([
      { email: 'sim.admin@example.edu', passwordHash, displayName: 'Sim Admin', role: 'admin', isActive: true },
      { email: 'sim.faculty@example.edu', passwordHash, displayName: 'Sim Faculty', role: 'faculty', isActive: true },
      { email: 'sim.student@example.edu', passwordHash, displayName: 'Sim Student', role: 'student', studentId: STU_1, isActive: true },
    ]);

    // Ensure catalog entry for remedial_classes exists
    await InterventionCatalog.findOneAndUpdate(
      { interventionType: 'remedial_classes' },
      {
        interventionType: 'remedial_classes',
        name: 'Remedial Academic Classes',
        description: 'Special mentoring classes for academic support',
        capacityUnit: 'seats',
        costUnits: 100,
        durationDays: 30,
        active: true,
        eligibilityRules: { maxCgpa: 8.0 },
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 3 students in Mechanical Engineering
    await Student.create([
      {
        studentId: STU_1,
        firstName: 'Virat',
        lastName: 'Kohli',
        department: 'Mechanical',
        program: 'B.Tech ME',
        semester: 6,
        enrollmentYear: 2021,
        cohort: 'SIM_TEST_COHORT',
        status: 'active',
      },
      {
        studentId: STU_2,
        firstName: 'Rohit',
        lastName: 'Sharma',
        department: 'Mechanical',
        program: 'B.Tech ME',
        semester: 6,
        enrollmentYear: 2021,
        cohort: 'SIM_TEST_COHORT',
        status: 'active',
      },
      {
        studentId: STU_3,
        firstName: 'Jasprit',
        lastName: 'Bumrah',
        department: 'Mechanical',
        program: 'B.Tech ME',
        semester: 6,
        enrollmentYear: 2021,
        cohort: 'SIM_TEST_COHORT',
        status: 'active',
      },
    ]);

    // STU_1: CGPA 5.0, 2 backlogs (Highest need)
    await AcademicRecord.create({
      studentId: STU_1,
      term: '2024-SEM1',
      marksObtained: 50,
      maxMarks: 100,
      cgpa: 5.0,
      backlog: true,
      backlogsCount: 2,
    });
    await StudentScore.create({ studentId: STU_1, period: '2024-SEM1', score: 48 });
    await RiskPrediction.create({
      studentId: STU_1,
      target: 'academic_risk',
      riskLevel: 'high',
      modelVersion: 'lgb-v1.0.0',
      featureSetVersion: 'v1.0.0',
      status: 'valid',
    });

    // STU_2: CGPA 6.5, 0 backlogs (Moderate need)
    await AcademicRecord.create({
      studentId: STU_2,
      term: '2024-SEM1',
      marksObtained: 65,
      maxMarks: 100,
      cgpa: 6.5,
      backlog: false,
    });
    await StudentScore.create({ studentId: STU_2, period: '2024-SEM1', score: 65 });

    // STU_3: CGPA 7.5, 0 backlogs (Lower need, but eligible since <= 8.0)
    await AcademicRecord.create({
      studentId: STU_3,
      term: '2024-SEM1',
      marksObtained: 75,
      maxMarks: 100,
      cgpa: 7.5,
      backlog: false,
    });
    await StudentScore.create({ studentId: STU_3, period: '2024-SEM1', score: 75 });

    // Login users
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sim.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminRes.body.data.accessToken;

    const facultyRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sim.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyRes.body.data.accessToken;

    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sim.student@example.edu', password: TEST_PASSWORD });
    studentToken = studentRes.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /^sim\./ } });
    await Student.deleteMany({ studentId: { $in: ALL_STUS } });
    await AcademicRecord.deleteMany({ studentId: { $in: ALL_STUS } });
    await AttendanceRecord.deleteMany({ studentId: { $in: ALL_STUS } });
    await PlacementAssessment.deleteMany({ studentId: { $in: ALL_STUS } });
    await StudentScore.deleteMany({ studentId: { $in: ALL_STUS } });
    await RiskPrediction.deleteMany({ studentId: { $in: ALL_STUS } });
    await SimulationScenario.deleteMany({ createdBy: { $regex: /sim\./ } });
    await Intervention.deleteMany({ studentId: { $in: ALL_STUS } });
    await disconnectDatabase();
  });

  describe('POST /api/v1/simulations (Create Scenario)', () => {
    it('should allow staff to create a new simulation scenario in draft status', async () => {
      const res = await request(app)
        .post('/api/v1/simulations')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          strategy: 'targeted',
          interventionTypes: ['remedial_classes'],
          cohortFilters: { department: 'Mechanical', cohort: 'SIM_TEST_COHORT' },
          capacityConstraints: { remedial_classes: 2 },
          assumptions: ['Testing capacity of 2 seats'],
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.scenarioId);
      assert.equal(res.body.data.status, 'draft');
      assert.equal(res.body.data.strategy, 'targeted');

      testScenarioId = res.body.data.scenarioId;
    });

    it('should reject invalid strategy with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/simulations')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          strategy: 'invalid_strategy_xyz',
          interventionTypes: ['remedial_classes'],
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('should DENY student from creating simulation scenarios with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/simulations')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          strategy: 'targeted',
          interventionTypes: ['remedial_classes'],
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });

  describe('POST /api/v1/simulations/:scenarioId/run (Run Simulation Engine)', () => {
    it('should execute deterministic allocation strictly respecting capacity constraints', async () => {
      const res = await request(app)
        .post(`/api/v1/simulations/${testScenarioId}/run`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const data = res.body.data;
      assert.equal(data.status, 'simulated');

      // Capacity constraint was set to 2 seats
      // 3 eligible students -> exactly 2 allocated, 1 excluded due to capacity limit
      assert.equal(data.allocationResults.length, 2);
      assert.equal(data.excludedResults.length, 1);

      // Targeted strategy prioritizes highest need: STU_1 has lowest CGPA, backlogs, high academic risk
      assert.equal(data.allocationResults[0].studentId, STU_1);
      assert.ok(data.allocationResults[0].priorityScore > data.allocationResults[1].priorityScore);

      // Excluded student (STU_3) should have reason explaining capacity limit
      const excluded = data.excludedResults[0];
      assert.equal(excluded.studentId, STU_3);
      assert.ok(excluded.reason.includes('capacity limit'));

      // Zero-fabrication check
      assert.equal(data.outcomeEstimates, null);
      assert.equal(data.estimateMethod, 'none');

      // Resource utilization summary
      assert.equal(data.resourceSummary.totalAllocated, 2);
      assert.equal(data.resourceSummary.totalCapacity, 2);
      assert.equal(data.resourceSummary.overallUtilizationPercentage, 100);
    });

    it('should be deterministic and repeatable on identical frozen inputs', async () => {
      const firstRun = await request(app)
        .post(`/api/v1/simulations/${testScenarioId}/run`)
        .set('Authorization', `Bearer ${adminToken}`);

      const secondRun = await request(app)
        .post(`/api/v1/simulations/${testScenarioId}/run`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.deepEqual(
        firstRun.body.data.allocationResults,
        secondRun.body.data.allocationResults
      );
    });
  });

  describe('POST /api/v1/simulations/:scenarioId/approve (Human Approval Workflow)', () => {
    it('should reject approving a draft scenario before simulation has been run', async () => {
      const draftRes = await request(app)
        .post('/api/v1/simulations')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          strategy: 'targeted',
          interventionTypes: ['remedial_classes'],
        });
      const draftId = draftRes.body.data.scenarioId;

      const approveRes = await request(app)
        .post(`/api/v1/simulations/${draftId}/approve`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(approveRes.status, 400);
      assert.equal(approveRes.body.error.code, 'INVALID_STATE');
    });

    it('should allow authorized staff to approve simulated scenario and create official Interventions', async () => {
      const res = await request(app)
        .post(`/api/v1/simulations/${testScenarioId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'approved');
      assert.equal(res.body.data.createdInterventionsCount, 2);

      // Verify Interventions were actually created in MongoDB
      const createdInDb = await Intervention.find({ scenarioId: testScenarioId });
      assert.equal(createdInDb.length, 2);
      const studentIds = createdInDb.map((i) => i.studentId);
      assert.ok(studentIds.includes(STU_1));
      assert.ok(studentIds.includes(STU_2));
    });

    it('should reject duplicate approval with 409 ALREADY_APPROVED', async () => {
      const res = await request(app)
        .post(`/api/v1/simulations/${testScenarioId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, 'ALREADY_APPROVED');
    });

    it('should DENY student from approving scenarios with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post(`/api/v1/simulations/${testScenarioId}/approve`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });
});
