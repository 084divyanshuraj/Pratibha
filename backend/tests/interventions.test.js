import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { User } from '../src/models/User.js';
import { Student } from '../src/models/Student.js';
import { InterventionCatalog } from '../src/models/InterventionCatalog.js';
import { Intervention } from '../src/models/Intervention.js';

describe('Phase 8 — Intervention Catalog & Tracking Endpoints', () => {
  const TEST_PASSWORD = 'InterventionPassword123!';
  let adminToken = '';
  let facultyToken = '';
  let student1Token = '';
  let student2Token = '';

  const STU_1 = 'STU_INT_001';
  const STU_2 = 'STU_INT_002';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean test accounts and records
    await User.deleteMany({ email: { $regex: /^int\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_1, STU_2] } });
    await Intervention.deleteMany({ studentId: { $in: [STU_1, STU_2] } });
    await InterventionCatalog.deleteMany({ interventionType: 'mock_catalog_type' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    await User.create([
      { email: 'int.admin@example.edu', passwordHash, displayName: 'Int Admin', role: 'admin', isActive: true },
      { email: 'int.faculty@example.edu', passwordHash, displayName: 'Int Faculty', role: 'faculty', isActive: true },
      { email: 'int.student1@example.edu', passwordHash, displayName: 'Int Student 1', role: 'student', studentId: STU_1, isActive: true },
      { email: 'int.student2@example.edu', passwordHash, displayName: 'Int Student 2', role: 'student', studentId: STU_2, isActive: true },
    ]);

    await Student.create([
      {
        studentId: STU_1,
        firstName: 'Rahul',
        lastName: 'Dravid',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 6,
        enrollmentYear: 2021,
        status: 'active',
      },
      {
        studentId: STU_2,
        firstName: 'Sachin',
        lastName: 'Tendulkar',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 6,
        enrollmentYear: 2021,
        status: 'active',
      },
    ]);

    // Pre-create initial interventions
    await Intervention.create([
      {
        interventionId: 'INT_TEST_001',
        studentId: STU_1,
        interventionType: 'remedial_classes',
        assignedBy: 'int.admin@example.edu',
        status: 'assigned',
        notes: 'Initial test assignment',
      },
      {
        interventionId: 'INT_TEST_002',
        studentId: STU_2,
        interventionType: 'placement_bootcamp',
        assignedBy: 'int.faculty@example.edu',
        status: 'in_progress',
        notes: 'Bootcamp test assignment',
      },
    ]);

    // Acquire tokens
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'int.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminRes.body.data.accessToken;

    const facultyRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'int.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyRes.body.data.accessToken;

    const s1Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'int.student1@example.edu', password: TEST_PASSWORD });
    student1Token = s1Res.body.data.accessToken;

    const s2Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'int.student2@example.edu', password: TEST_PASSWORD });
    student2Token = s2Res.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /^int\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_1, STU_2] } });
    await Intervention.deleteMany({ studentId: { $in: [STU_1, STU_2] } });
    await InterventionCatalog.deleteMany({ interventionType: 'mock_catalog_type' });
    await disconnectDatabase();
  });

  describe('Intervention Catalog Endpoints', () => {
    it('should allow staff to browse the intervention catalog', async () => {
      const res = await request(app)
        .get('/api/v1/intervention-catalog')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.catalog));
    });

    it('should allow admin to create or update an intervention catalog entry', async () => {
      const res = await request(app)
        .post('/api/v1/intervention-catalog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          interventionType: 'mock_catalog_type',
          name: 'Mock Coding Tutoring',
          description: 'Special coding tutoring support program',
          capacityUnit: 'seats',
          costUnits: 50,
          durationDays: 20,
          eligibilityRules: { maxCgpa: 7.0 },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.interventionType, 'mock_catalog_type');
      assert.equal(res.body.data.name, 'Mock Coding Tutoring');
    });

    it('should prevent non-admin from creating catalog entries with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/intervention-catalog')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          interventionType: 'unauthorized_type',
          name: 'Unauthorized',
          description: 'Denied',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });

  describe('Intervention Tracking & Scoped Access', () => {
    it('should allow staff to list all interventions', async () => {
      const res = await request(app)
        .get('/api/v1/interventions')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.data.interventions.length >= 2);
    });

    it('should restrict student to only see their own interventions', async () => {
      const res = await request(app)
        .get('/api/v1/interventions')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 200);
      const list = res.body.data.interventions;
      assert.ok(list.every((i) => i.studentId === STU_1));
      assert.ok(!list.some((i) => i.studentId === STU_2));
    });

    it('should DENY student from fetching another student intervention by ID with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/interventions/INT_TEST_002')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should allow student to fetch their own intervention by ID', async () => {
      const res = await request(app)
        .get('/api/v1/interventions/INT_TEST_001')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.interventionId, 'INT_TEST_001');
      assert.equal(res.body.data.studentId, STU_1);
    });

    it('should allow staff to update intervention status and participation progress', async () => {
      const res = await request(app)
        .patch('/api/v1/interventions/INT_TEST_001')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          status: 'in_progress',
          notes: 'Student attended orientation module',
          participation: {
            attendanceCount: 3,
            completedModules: 1,
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, 'in_progress');
      assert.equal(res.body.data.notes, 'Student attended orientation module');
      assert.equal(res.body.data.participation.attendanceCount, 3);
    });

    it('should allow staff to record observed outcomes', async () => {
      const res = await request(app)
        .post('/api/v1/interventions/INT_TEST_001/outcomes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          metric: 'quiz_score_improvement',
          value: '+15%',
        });

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data.observedOutcomes));
      const outcome = res.body.data.observedOutcomes.find((o) => o.metric === 'quiz_score_improvement');
      assert.ok(outcome);
      assert.equal(outcome.value, '+15%');
    });

    it('should DENY students from modifying intervention status or recording outcomes with 403 FORBIDDEN', async () => {
      const patchRes = await request(app)
        .patch('/api/v1/interventions/INT_TEST_001')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ status: 'completed' });
      assert.equal(patchRes.status, 403);

      const outcomeRes = await request(app)
        .post('/api/v1/interventions/INT_TEST_001/outcomes')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ metric: 'self_assessment', value: 5 });
      assert.equal(outcomeRes.status, 403);
    });
  });
});
