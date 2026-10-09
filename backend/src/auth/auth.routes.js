import { Router } from 'express';
import { login, register, getCurrentUser, updateProfile } from './auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateProfile);
router.patch('/me', authenticate, updateProfile);

export default router;
