import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { uploadMedia, uploadMiddleware } from '../controllers/mediaController.js';

const router = express.Router();

// POST /api/media/upload
router.post('/upload', authMiddleware, uploadMiddleware, uploadMedia);

export default router;
