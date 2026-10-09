import { Router } from 'express';
import {
  listStudentsHandler,
  createStudentHandler,
  getStudentByIdHandler,
  updateStudentHandler,
  getStudentRecordsHandler,
} from './student.controller.js';
import {
  getStudentScoreHandler,
  recalculateStudentScoreHandler,
} from '../scores/score.controller.js';
import {
  getPredictionsHandler,
  generatePredictionHandler,
} from '../ml/ml.controller.js';
import {
  authenticate,
  authorizeRoles,
  authorizeStudentScope,
} from '../middleware/auth.js';

const router = Router();

// Staff-only paginated & filterable student list
router.get(
  '/',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  listStudentsHandler
);

// Admin-only student profile creation
router.post(
  '/',
  authenticate,
  authorizeRoles('admin'),
  createStudentHandler
);

// Staff or owner student access to student profile
router.get(
  '/:studentId',
  authenticate,
  authorizeStudentScope('studentId'),
  getStudentByIdHandler
);

// Admin or faculty update student profile
router.patch(
  '/:studentId',
  authenticate,
  authorizeRoles('admin', 'faculty'),
  updateStudentHandler
);

// Staff or owner student access to aggregated 7-category records
router.get(
  '/:studentId/records',
  authenticate,
  authorizeStudentScope('studentId'),
  getStudentRecordsHandler
);

// Staff or owner student access to Student Success Score
router.get(
  '/:studentId/success-score',
  authenticate,
  authorizeStudentScope('studentId'),
  getStudentScoreHandler
);

// Staff-only trigger to recalculate and persist fresh Student Success Score
router.post(
  '/:studentId/success-score/recalculate',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  recalculateStudentScoreHandler
);

// Staff or owner student access to latest risk predictions
router.get(
  '/:studentId/predictions',
  authenticate,
  authorizeStudentScope('studentId'),
  getPredictionsHandler
);

// Staff-only trigger to generate fresh ML risk predictions
router.post(
  '/:studentId/predictions',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  generatePredictionHandler
);

export default router;
