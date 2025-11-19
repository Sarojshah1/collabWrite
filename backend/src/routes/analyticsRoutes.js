import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { record, summary } from '../controllers/analyticsController.js';

const router = express.Router();

// Record an interaction event
router.post('/record', authMiddleware, record);

// Get aggregated summary for dashboard
router.get('/summary', authMiddleware, summary);

export default router;
