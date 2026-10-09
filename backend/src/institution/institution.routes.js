import { Router } from 'express';
import { provisionUser } from '../auth/auth.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
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
} from '../models/index.js';

const router = Router();

// Admin-only user provisioning endpoint
router.post('/users', authenticate, authorizeRoles('admin'), provisionUser);

// Admin-only: Clear student records to allow a clean custom CSV import
router.post('/clear-data', authenticate, authorizeRoles('admin'), async (req, res, next) => {
  try {
    await Promise.all([
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
    ]);
    res.status(200).json({
      success: true,
      data: { message: 'All student domain records cleared. Ready for fresh CSV import.' },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
