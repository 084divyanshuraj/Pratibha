import { Router } from 'express';
import {
  getOverviewKpisHandler,
  getTrendsHandler,
  getRiskSummaryHandler,
} from './analytics.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Institutional overview KPIs and 7-category coverage
router.get(
  '/overview',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  getOverviewKpisHandler
);

// Time-series trends across periods
router.get(
  '/trends',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  getTrendsHandler
);

// Cohort risk breakdown and decoupled divergence
router.get(
  '/risk-summary',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  getRiskSummaryHandler
);

export default router;
