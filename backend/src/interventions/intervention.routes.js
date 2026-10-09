import { Router } from 'express';
import {
  listInterventionsHandler,
  getInterventionByIdHandler,
  updateInterventionStatusHandler,
  recordOutcomesHandler,
} from './intervention.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Authenticated users can list interventions (students automatically scoped to own studentId)
router.get(
  '/',
  authenticate,
  listInterventionsHandler
);

// Authenticated users can get intervention details (students restricted to own studentId)
router.get(
  '/:interventionId',
  authenticate,
  getInterventionByIdHandler
);

// Staff roles can update intervention status and participation notes
router.patch(
  '/:interventionId',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  updateInterventionStatusHandler
);

// Staff roles can record observed outcomes
router.post(
  '/:interventionId/outcomes',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  recordOutcomesHandler
);

export default router;
