import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { generateBlog, generateTitle, generateSummary, generateKeywords, generateOutline, generateDraft } from '../controllers/aiController.js';

const router = express.Router();

// AI-assisted writing
router.post('/generate-blog', authMiddleware, generateBlog);
router.post('/generate-title', authMiddleware, generateTitle);
router.post('/generate-summary', authMiddleware, generateSummary);
router.post('/keywords', authMiddleware, generateKeywords);
// Optional: outline suggestion
router.post('/generate-outline', authMiddleware, generateOutline);
// Draft generation: titles + outline + content
router.post('/generate-draft', authMiddleware, generateDraft);

export default router;
