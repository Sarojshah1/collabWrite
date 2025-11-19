import express from 'express';
import authRoutes from './authRoutes.js';
import blogRoutes from './blogRoutes.js';
import collabRoutes from './collabRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import adminRoutes from './adminRoutes.js';
import aiRoutes from './aiRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import templateRoutes from './templateRoutes.js';
import mergeConflictRoutes from './mergeConflictRoutes.js';
import assignmentRoutes from './assignmentRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/blog', blogRoutes);
router.use('/collab', collabRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/media', mediaRoutes);
router.use('/templates', templateRoutes);
router.use('/merge-conflicts', mergeConflictRoutes);
router.use('/assignments', assignmentRoutes);

export default router;
