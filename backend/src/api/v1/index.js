import { Router } from 'express';
import authRouter from '../../auth/auth.routes.js';
import institutionRouter from '../../institution/institution.routes.js';
import studentRouter from '../../students/student.routes.js';
import ingestionRouter from '../../ingestion/ingestion.routes.js';
import { authenticate, authorizeStudentScope } from '../../middleware/auth.js';

const apiV1Router = Router();

/**
 * Base /api/v1 information endpoint
 */
apiV1Router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Smart Campus Analytics API',
      version: 'v1',
      status: 'active',
      endpoints: {
        health: '/health',
        documentation: '/docs',
        auth: '/api/v1/auth',
        students: '/api/v1/students',
        imports: '/api/v1/imports',
      },
    },
    meta: {
      requestId: req.id,
    },
  });
});

// Authentication & Identity
apiV1Router.use('/auth', authRouter);

// Institution Administration
apiV1Router.use('/institution', institutionRouter);

// Data Ingestion & Batch Imports
apiV1Router.use('/imports', ingestionRouter);

// Student Profiles & Category Records
apiV1Router.use('/students', studentRouter);

// Scoped student record verification route (for testing object-level authorization gate)
apiV1Router.get(
  '/students/:studentId/test-scope',
  authenticate,
  authorizeStudentScope('studentId'),
  (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: `Authorized access to student record: ${req.params.studentId}`,
        studentId: req.params.studentId,
        accessedByRole: req.user.role,
      },
      meta: {
        requestId: req.id,
      },
    });
  }
);

export default apiV1Router;
