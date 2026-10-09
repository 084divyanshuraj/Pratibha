import { config } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import {
  Student,
  AcademicRecord,
  AttendanceRecord,
  LmsActivity,
  EngagementRecord,
  PlacementAssessment,
  SkillAssessment,
  FeedbackRecord,
  StudentScore,
  RiskPrediction,
  StudentSegment,
  Import,
  Intervention,
  SimulationScenario,
  AuditEvent,
} from '../src/models/index.js';

async function clearStudentDatabase() {
  console.log('[ClearDB] Connecting to MongoDB...');
  await connectDatabase(config.mongoUri);

  console.log('[ClearDB] Wiping all synthetic student and performance records...');
  const results = await Promise.all([
    Student.deleteMany({}),
    AcademicRecord.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    LmsActivity.deleteMany({}),
    EngagementRecord.deleteMany({}),
    PlacementAssessment.deleteMany({}),
    SkillAssessment.deleteMany({}),
    FeedbackRecord.deleteMany({}),
    StudentScore.deleteMany({}),
    RiskPrediction.deleteMany({}),
    StudentSegment.deleteMany({}),
    Import.deleteMany({}),
    Intervention.deleteMany({}),
    SimulationScenario.deleteMany({}),
    AuditEvent.deleteMany({}),
  ]);

  console.log('[ClearDB] Successfully wiped student collections.');
  console.log('[ClearDB] System auth credentials & intervention catalog remain intact.');
  console.log('[ClearDB] Ready for clean multi-pillar CSV ingestion via Batch Data Studio or import-csv script.');

  await disconnectDatabase();
}

clearStudentDatabase().catch((err) => {
  console.error('[ClearDB] Failed to clear database:', err);
  process.exit(1);
});
