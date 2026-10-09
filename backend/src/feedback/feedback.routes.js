import { Router } from 'express';
import {
  submitFeedbackHandler,
  getFeedbackSummaryHandler,
  listFeedbackHandler,
} from './feedback.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Submit feedback (authenticated: students or staff)
router.post('/', authenticate, submitFeedbackHandler);

// Aggregated feedback summary (authorized staff only; comments withheld)
router.get(
  '/summary',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  getFeedbackSummaryHandler
);

// List feedback records (role-scoped; student sees only own records; comments redacted where appropriate)
router.get('/', authenticate, listFeedbackHandler);

export default router;
