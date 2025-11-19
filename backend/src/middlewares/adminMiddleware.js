import User from '../models/User.js';
import { sendError } from '../utils/response.js';

export const adminOnly = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, 'Unauthorized');
    const user = await User.findById(userId).select('role suspended');
    if (!user) return sendError(res, 401, 'Unauthorized');
    if (user.suspended) return sendError(res, 403, 'Account suspended');
    if (user.role !== 'admin') return sendError(res, 403, 'Admin access required');
    return next();
  } catch (err) {
    return sendError(res, 500, 'Authorization failed', err.message);
  }
};
