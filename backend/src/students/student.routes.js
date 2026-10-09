import { Router } from 'express';
import {
  listStudentsHandler,
  createStudentHandler,
  getStudentByIdHandler,
  updateStudentHandler,
  getStudentRecordsHandler,
} from './student.controller.js';
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

export default router;
