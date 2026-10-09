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
import { LmsActivity } from '../src/models/LmsActivity.js';
import { PlacementAssessment } from '../src/models/PlacementAssessment.js';
import { SkillAssessment } from '../src/models/SkillAssessment.js';
import { FeedbackRecord } from '../src/models/FeedbackRecord.js';
import { Import } from '../src/models/Import.js';

describe('Phase 4 — Data Ingestion & Batch Imports Engine', () => {
  const TEST_PASSWORD = 'TestPassword123!';
  let adminToken = '';
  let facultyToken = '';

  const STU_TARGET_1 = 'STU_ING_001';
  const STU_TARGET_2 = 'STU_ING_002';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean previous test data
    await User.deleteMany({ email: { $regex: /^ing\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await LmsActivity.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await PlacementAssessment.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await SkillAssessment.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await FeedbackRecord.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await Import.deleteMany({ uploadedBy: { $regex: /ing\.admin/ } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    await User.create([
      { email: 'ing.admin@example.edu', passwordHash, displayName: 'Ing Admin', role: 'admin', isActive: true },
      { email: 'ing.faculty@example.edu', passwordHash, displayName: 'Ing Faculty', role: 'faculty', isActive: true },
    ]);

    await Student.create([
      {
        studentId: STU_TARGET_1,
        firstName: 'Ingestion',
        lastName: 'Target1',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 6,
        enrollmentYear: 2021,
      },
      {
        studentId: STU_TARGET_2,
        firstName: 'Ingestion',
        lastName: 'Target2',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 6,
        enrollmentYear: 2021,
      },
    ]);

    const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: 'ing.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminLogin.body.data.accessToken;

    const facultyLogin = await request(app).post('/api/v1/auth/login').send({ email: 'ing.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyLogin.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /^ing\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await LmsActivity.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await PlacementAssessment.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await SkillAssessment.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await FeedbackRecord.deleteMany({ studentId: { $in: [STU_TARGET_1, STU_TARGET_2] } });
    await Import.deleteMany({ uploadedBy: { $regex: /ing\.admin/ } });
    await disconnectDatabase();
  });

  describe('POST /api/v1/imports/:datasetType/preview (Dry-Run Validation)', () => {
    it('should validate academic records dry-run without writing to database', async () => {
      const payload = {
        records: [
          {
            studentId: STU_TARGET_1,
            term: 'Spring 2025',
            subjectCode: 'CS301',
            assessmentType: 'final',
            marksObtained: 85,
            maxMarks: 100,
            cgpa: 8.5,
          },
          {
            studentId: STU_TARGET_2,
            term: 'Spring 2025',
            subjectCode: 'CS301',
            assessmentType: 'final',
            marksObtained: 92,
            maxMarks: 100,
            cgpa: 9.2,
          },
        ],
      };

      const res = await request(app)
        .post('/api/v1/imports/academic/preview')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.dryRun, true);
      assert.equal(res.body.data.counts.received, 2);
      assert.equal(res.body.data.counts.accepted, 2);
      assert.equal(res.body.data.counts.rejected, 0);
      assert.equal(res.body.data.rowErrors.length, 0);

      // Verify DB was NOT mutated
      const count = await AcademicRecord.countDocuments({ studentId: STU_TARGET_1 });
      assert.equal(count, 0);
    });

    it('should identify malformed rows, range violations, and unknown studentIds in preview', async () => {
      const payload = {
        records: [
          // Row 1 (valid)
          {
            studentId: STU_TARGET_1,
            term: 'Spring 2025',
            marksObtained: 80,
            maxMarks: 100,
          },
          // Row 2 (marksObtained > maxMarks constraint violation)
          {
            studentId: STU_TARGET_1,
            term: 'Spring 2025',
            marksObtained: 105,
            maxMarks: 100,
          },
          // Row 3 (unknown student ID)
          {
            studentId: 'STU_DOES_NOT_EXIST_404',
            term: 'Spring 2025',
            marksObtained: 70,
            maxMarks: 100,
          },
        ],
      };

      const res = await request(app)
        .post('/api/v1/imports/academic/preview')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.counts.received, 3);
      assert.equal(res.body.data.counts.accepted, 1);
      assert.equal(res.body.data.counts.rejected, 2);
      assert.ok(res.body.data.rowErrors.length >= 2);

      // Check specific error messages
      const markError = res.body.data.rowErrors.find((e) => e.field === 'marksObtained');
      assert.ok(markError);
      assert.ok(markError.message.includes('cannot be greater than maxMarks'));

      const idError = res.body.data.rowErrors.find((e) => e.field === 'studentId');
      assert.ok(idError);
      assert.ok(idError.message.includes('does not exist'));
    });

    it('should deny non-admin users from previewing imports with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/imports/academic/preview')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ records: [] });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });

  describe('POST /api/v1/imports/:datasetType (Commit Batch Import)', () => {
    let savedImportId = '';

    it('should commit academic CSV batch and persist records with sourceImportId', async () => {
      const csvData = [
        'studentId,term,subjectCode,subjectName,assessmentType,marksObtained,maxMarks,grade,cgpa,backlog',
        `${STU_TARGET_1},Spring 2025,CS301,Data Structures,final,88,100,A,8.8,false`,
        `${STU_TARGET_2},Spring 2025,CS301,Data Structures,final,76,100,B+,7.6,false`,
      ].join('\n');

      const res = await request(app)
        .post('/api/v1/imports/academic')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ csv: csvData, fileName: 'academic_test.csv' });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'completed');
      assert.equal(res.body.data.counts.received, 2);
      assert.equal(res.body.data.counts.accepted, 2);
      assert.equal(res.body.data.counts.rejected, 0);
      assert.ok(res.body.data.importId.startsWith('IMP_'));

      savedImportId = res.body.data.importId;

      // Verify records are saved in DB and tagged with importId
      const savedRecords = await AcademicRecord.find({ sourceImportId: savedImportId });
      assert.equal(savedRecords.length, 2);
      assert.equal(savedRecords[0].marksObtained, 88);
    });

    it('should preserve missing optional fields as NULL instead of silently coercing to zero', async () => {
      // In this row, cgpa is empty string "" and grade is missing
      const csvData = [
        'studentId,term,subjectCode,assessmentType,marksObtained,maxMarks,grade,cgpa',
        `${STU_TARGET_1},Fall 2024,CS201,midterm,45,50,,`,
      ].join('\n');

      const res = await request(app)
        .post('/api/v1/imports/academic')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ csv: csvData });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.counts.accepted, 1);

      const record = await AcademicRecord.findOne({
        studentId: STU_TARGET_1,
        subjectCode: 'CS201',
      });

      assert.ok(record);
      // Strictly verify cgpa remains null and did NOT become 0!
      assert.equal(record.cgpa, null);
      assert.equal(record.grade, null);
    });

    it('should handle partial imports when some rows are valid and some invalid', async () => {
      const csvData = [
        'studentId,term,classesAttended,classesHeld',
        `${STU_TARGET_1},Spring 2025,38,40`, // valid
        `${STU_TARGET_2},Spring 2025,45,40`, // invalid: attended > held
      ].join('\n');

      const res = await request(app)
        .post('/api/v1/imports/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ csv: csvData });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.status, 'partially_imported');
      assert.equal(res.body.data.counts.received, 2);
      assert.equal(res.body.data.counts.accepted, 1);
      assert.equal(res.body.data.counts.rejected, 1);
      assert.equal(res.body.data.rowErrors.length, 1);

      // Verify only valid row was persisted
      const attended = await AttendanceRecord.findOne({ studentId: STU_TARGET_1, term: 'Spring 2025' });
      assert.ok(attended);
      assert.equal(attended.classesAttended, 38);
      assert.equal(attended.attendancePercentage, 95); // auto-calculated
    });

    it('should support multipart file upload via multer buffer', async () => {
      const csvContent = Buffer.from(
        [
          'studentId,skillCategory,skillName,score,maxScore',
          `${STU_TARGET_1},technical,Python,95,100`,
          `${STU_TARGET_2},technical,SQL,85,100`,
        ].join('\n')
      );

      const res = await request(app)
        .post('/api/v1/imports/skills')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', csvContent, 'skills_upload.csv');

      assert.equal(res.status, 201);
      assert.equal(res.body.data.status, 'completed');
      assert.equal(res.body.data.counts.accepted, 2);
      assert.equal(res.body.data.fileName, 'skills_upload.csv');

      const savedSkill = await SkillAssessment.findOne({ studentId: STU_TARGET_1, skillName: 'Python' });
      assert.ok(savedSkill);
      assert.equal(savedSkill.score, 95);
    });

    describe('GET /api/v1/imports/:importId (Import Inspection)', () => {
      it('should allow admin to retrieve import execution summary and error log', async () => {
        const res = await request(app)
          .get(`/api/v1/imports/${savedImportId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.importId, savedImportId);
        assert.equal(res.body.data.datasetType, 'academic');
        assert.equal(res.body.data.status, 'completed');
        assert.equal(res.body.data.counts.accepted, 2);
      });

      it('should return 404 NOT_FOUND for non-existent import ID', async () => {
        const res = await request(app)
          .get('/api/v1/imports/IMP_NONEXISTENT_999')
          .set('Authorization', `Bearer ${adminToken}`);

        assert.equal(res.status, 404);
        assert.equal(res.body.error.code, 'NOT_FOUND');
      });

      it('should deny non-admin users from viewing import reports with 403 FORBIDDEN', async () => {
        const res = await request(app)
          .get(`/api/v1/imports/${savedImportId}`)
          .set('Authorization', `Bearer ${facultyToken}`);

        assert.equal(res.status, 403);
        assert.equal(res.body.error.code, 'FORBIDDEN');
      });
    });
  });
});
