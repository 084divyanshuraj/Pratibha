import { Router } from 'express';
import {
  listSegmentsHandler,
  getSegmentByKeyHandler,
  rebuildSegmentsHandler,
} from './segment.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Staff roles can list all segments with summary indicators
router.get(
  '/',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  listSegmentsHandler
);

// Admin and faculty can trigger a rebuild of segment memberships
router.post(
  '/rebuild',
  authenticate,
  authorizeRoles('admin', 'faculty'),
  rebuildSegmentsHandler
);

// Staff roles can inspect a specific segment and its member list
router.get(
  '/:segmentKey',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  getSegmentByKeyHandler
);

export default router;
