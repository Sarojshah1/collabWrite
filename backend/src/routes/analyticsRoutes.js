import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { record, summary, authorSummary, authorTimeline } from '../controllers/analyticsController.js';

const router = express.Router();

// Record an interaction event
router.post('/record', authMiddleware, record);

// Get aggregated summary for dashboard
router.get('/summary', authMiddleware, summary);

// Get aggregated summary for blogs authored by the current user
router.get('/author-summary', authMiddleware, authorSummary);

// Get per-day views/likes timeline for blogs authored by the current user
router.get('/author-timeline', authMiddleware, authorTimeline);

export default router;
