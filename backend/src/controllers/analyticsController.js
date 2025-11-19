import { z } from 'zod';
import Interaction from '../models/Interaction.js';
import Blog from '../models/Blog.js';
import { sendSuccess, sendError } from '../utils/response.js';

const recordSchema = z.object({
  blogId: z.string().min(1),
  type: z.enum(['view', 'like', 'bookmark', 'comment', 'share']),
  dwellTimeMs: z.number().optional(),
  device: z.string().optional(),
  location: z.string().optional(),
  referrer: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export const record = async (req, res) => {
  try {
    const parsed = recordSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'Invalid input', parsed.error.flatten());
    }
    const { blogId, type, dwellTimeMs = 0, device = '', location = '', referrer = '', meta = {} } = parsed.data;

    const blog = await Blog.findById(blogId).select('tags author');
    if (!blog) return sendError(res, 404, 'Blog not found');

    const doc = await Interaction.create({
      user: req.user?.id || null,
      blog: blog._id,
      type,
      dwellTimeMs,
      device,
      location,
      referrer,
      meta,
      tagsSnapshot: blog.tags,
      authorSnapshot: blog.author,
    });

    return sendSuccess(res, { interactionId: doc._id }, 201);
  } catch (err) {
    return sendError(res, 500, 'Failed to record interaction', err.message);
  }
};

export const summary = async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const since = new Date(Date.now() - parseInt(days, 10) * 24 * 60 * 60 * 1000);
    const pipeline = [
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { type: '$type' },
          count: { $sum: 1 },
        },
      },
    ];
    const data = await Interaction.aggregate(pipeline);
    return sendSuccess(res, { data });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch summary', err.message);
  }
};
