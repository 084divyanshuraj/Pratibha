import { Router } from 'express';
import {
  createScenarioHandler,
  runScenarioHandler,
  getScenarioHandler,
  approveScenarioHandler,
} from './simulation.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Staff roles can define a new simulation scenario
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  createScenarioHandler
);

// Staff roles can execute deterministic allocation for a scenario
router.post(
  '/:scenarioId/run',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  runScenarioHandler
);

// Staff roles can inspect scenario details, allocations, and exclusions
router.get(
  '/:scenarioId',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  getScenarioHandler
);

// Admin or faculty only: approve scenario and convert allocations to official interventions
router.post(
  '/:scenarioId/approve',
  authenticate,
  authorizeRoles('admin', 'faculty'),
  approveScenarioHandler
);

export default router;
