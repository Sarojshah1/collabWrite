import { body, validationResult } from 'express-validator';
import { sendSuccess, sendError } from '../utils/response.js';
import { startSession, joinSession, getPresence } from '../services/collaborationService.js';

export const startValidators = [body('blogId').isMongoId()];
export const joinValidators = [body('blogId').isMongoId()];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, 'Validation failed', errors.array());
    return false;
  }
  return true;
}

export const start = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const { blogId } = req.body;
    const session = await startSession(blogId, req.user.id);
    return sendSuccess(res, { session, presence: getPresence(blogId) }, 201);
  } catch (err) {
    return sendError(res, 500, 'Failed to start session', err.message);
  }
};

export const join = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const { blogId } = req.body;
    const session = await joinSession(blogId, req.user.id);
    return sendSuccess(res, { session, presence: getPresence(blogId) });
  } catch (err) {
    return sendError(res, 500, 'Failed to join session', err.message);
  }
};
