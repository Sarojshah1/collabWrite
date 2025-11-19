import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { listAssignments, createAssignment } from '../controllers/assignmentController.js';

const router = express.Router();

// All assignment routes require auth
router.use(authMiddleware);

// GET /api/assignments
router.get('/', listAssignments);

// POST /api/assignments
router.post('/', createAssignment);

export default router;
