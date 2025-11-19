import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as collab from '../controllers/collabController.js';

const router = express.Router();

router.post('/start', authMiddleware, collab.startValidators, collab.start);
router.post('/join', authMiddleware, collab.joinValidators, collab.join);

export default router;
