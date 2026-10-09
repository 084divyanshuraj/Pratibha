import { Router } from 'express';
import { provisionUser } from '../auth/auth.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Admin-only user provisioning endpoint
router.post('/users', authenticate, authorizeRoles('admin'), provisionUser);

export default router;
