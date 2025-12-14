import { z } from 'zod';
import mongoose from 'mongoose';
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

export const authorSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 401, 'Unauthorized');
    }

    // Aggregate from the Blog collection so we use the canonical
    // per-blog counters (views and likes/bookmarks arrays) for this author.
    const pipeline = [
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
          status: 'published',
        },
      },
      {
        $group: {
          _id: null,
          views: { $sum: { $ifNull: ['$views', 0] } },
          likes: { $sum: { $size: { $ifNull: ['$likes', []] } } },
          bookmarks: { $sum: { $size: { $ifNull: ['$bookmarks', []] } } },
        },
      },
    ];

    const [row] = await Blog.aggregate(pipeline);
    const data = row
      ? [
          { _id: { type: 'view' }, count: row.views || 0 },
          { _id: { type: 'like' }, count: row.likes || 0 },
          { _id: { type: 'bookmark' }, count: row.bookmarks || 0 },
        ]
      : [];

      console.log(data)

    return sendSuccess(res, { data });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch author summary', err.message);
  }
};

export const authorTimeline = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { days = '30' } = req.query;
    const since = new Date(Date.now() - parseInt(days, 10) * 24 * 60 * 60 * 1000);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: since },
          authorSnapshot: new mongoose.Types.ObjectId(userId),
          type: { $in: ['view', 'like'] },
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
    ];

    const rows = await Interaction.aggregate(pipeline);

    const byDay = new Map();
    for (const row of rows) {
      const day = row._id.day;
      const type = row._id.type;
      const count = row.count || 0;
      if (!byDay.has(day)) {
        byDay.set(day, { day, views: 0, likes: 0 });
      }
      const entry = byDay.get(day);
      if (type === 'view') entry.views += count;
      if (type === 'like') entry.likes += count;
    }

    const points = Array.from(byDay.values()).sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));

    return sendSuccess(res, { points });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch author timeline', err.message);
  }
};
