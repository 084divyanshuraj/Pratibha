import { Router } from 'express';
import multer from 'multer';
import {
  previewImportHandler,
  commitImportHandler,
  getImportByIdHandler,
} from './ingestion.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Configure in-memory upload handling (10MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Admin-only: Dry-run preview import (validates CSV/JSON without persisting)
router.post(
  '/:datasetType/preview',
  authenticate,
  authorizeRoles('admin'),
  upload.single('file'),
  previewImportHandler
);

// Admin-only: Batch commit import (validates and persists records with import ID)
router.post(
  '/:datasetType',
  authenticate,
  authorizeRoles('admin'),
  upload.single('file'),
  commitImportHandler
);

// Admin-only: Query import execution status and row error logs
router.get(
  '/:importId',
  authenticate,
  authorizeRoles('admin'),
  getImportByIdHandler
);

export default router;
