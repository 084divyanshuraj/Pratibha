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
} from '../src/models/index.js';
import {
  DEMO_PASSWORD_RAW,
  demoUsers,
  demoStudents,
  demoAcademicRecords,
  demoAttendanceRecords,
  demoLmsActivity,
  demoEngagementRecords,
  demoPlacementAssessments,
  demoSkillAssessments,
  demoFeedbackRecords,
  demoInterventionCatalog,
} from '../src/db/seeds/fixtures.js';

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

    // 2. Seed Students
    console.log('[Seed] Seeding demo students...');
    for (const s of demoStudents) {
      await Student.findOneAndUpdate(
        { studentId: s.studentId },
        s,
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
    }
    console.log(`[Seed] Seeded ${demoStudents.length} demo students.`);

    // 3. Seed Category Records
    await AcademicRecord.deleteMany({ studentId: 'STU_0001' });
    await AcademicRecord.insertMany(demoAcademicRecords);

    await AttendanceRecord.deleteMany({ studentId: 'STU_0001' });
    await AttendanceRecord.insertMany(demoAttendanceRecords);

    await LmsActivity.deleteMany({ studentId: 'STU_0001' });
    await LmsActivity.insertMany(demoLmsActivity);

    await EngagementRecord.deleteMany({ studentId: 'STU_0001' });
    await EngagementRecord.insertMany(demoEngagementRecords);

    await PlacementAssessment.deleteMany({ studentId: 'STU_0001' });
    await PlacementAssessment.insertMany(demoPlacementAssessments);

    await SkillAssessment.deleteMany({ studentId: 'STU_0001' });
    await SkillAssessment.insertMany(demoSkillAssessments);

    await FeedbackRecord.deleteMany({ studentId: 'STU_0001' });
    await FeedbackRecord.insertMany(demoFeedbackRecords);
    console.log('[Seed] Seeded records across all 7 categories for STU_0001.');

    // 4. Seed Intervention Catalog
    for (const item of demoInterventionCatalog) {
      await InterventionCatalog.findOneAndUpdate(
        { interventionType: item.interventionType },
        item,
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
    }
    console.log(`[Seed] Seeded ${demoInterventionCatalog.length} intervention catalog entries.`);

    console.log('[Seed] Database seed completed successfully.');
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
