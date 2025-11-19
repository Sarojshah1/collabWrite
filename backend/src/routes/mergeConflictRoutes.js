import express from 'express';
import { listConflicts, acceptMerge, rejectMerge, resolveConflictWithAI } from '../controllers/mergeConflictController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/merge-conflicts/blog/:blogId
router.get('/blog/:blogId', listConflicts);

// POST /api/merge-conflicts/:id/accept
router.post('/:id/accept', acceptMerge);

// POST /api/merge-conflicts/:id/reject
router.post('/:id/reject', rejectMerge);

// POST /api/merge-conflicts/:id/resolve-ai
router.post('/:id/resolve-ai', resolveConflictWithAI);

export default router;
