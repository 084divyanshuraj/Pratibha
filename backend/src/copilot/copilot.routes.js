import { Router } from 'express';
import { handleCopilotQuery } from './copilot.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Process Copilot natural language queries (authenticated, role-scoped, strictly safe)
router.post('/query', authenticate, handleCopilotQuery);

export default router;
