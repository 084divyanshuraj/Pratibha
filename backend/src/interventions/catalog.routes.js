import { Router } from 'express';
import {
  listCatalogHandler,
  getCatalogEntryHandler,
  upsertCatalogEntryHandler,
} from './catalog.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Staff roles can browse intervention catalog
router.get(
  '/',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  listCatalogHandler
);

// Admin only: create or update catalog entry
router.post(
  '/',
  authenticate,
  authorizeRoles('admin'),
  upsertCatalogEntryHandler
);

// Staff roles can get specific catalog entry
router.get(
  '/:interventionType',
  authenticate,
  authorizeRoles('admin', 'faculty', 'placement_officer'),
  getCatalogEntryHandler
);

export default router;
