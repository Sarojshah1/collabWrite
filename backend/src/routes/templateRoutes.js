import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { listTemplates, getTemplate, instantiateBlogFromTemplate } from '../controllers/templateController.js';

const router = express.Router();

router.get('/', authMiddleware, listTemplates);
router.get('/:slug', authMiddleware, getTemplate);
router.post('/:slug/instantiate', authMiddleware, instantiateBlogFromTemplate);

export default router;
