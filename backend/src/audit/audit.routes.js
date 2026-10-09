import { Router } from 'express';
import { listAuditEventsHandler } from './audit.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Only admin role can view system audit events
router.get('/events', authenticate, authorizeRoles('admin'), listAuditEventsHandler);

export default router;
