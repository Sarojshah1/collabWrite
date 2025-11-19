import { sendError, sendSuccess } from '../utils/response.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Interaction from '../models/Interaction.js';
import CollabSession from '../models/CollabSession.js';
import AdminAuditLog from '../models/AdminAuditLog.js';

// 7.1 User Management: GET /api/admin/users
export const listUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({})
        .select('_id name email role suspended followers following createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({}),
    ]);
    return sendSuccess(res, { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch users', err.message);
  }
};

// Suspend or unsuspend a user
export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;
    if (typeof suspended !== 'boolean') return sendError(res, 400, 'suspended must be boolean');
    const user = await User.findByIdAndUpdate(id, { suspended }, { new: true }).select('_id name email role suspended');
    if (!user) return sendError(res, 404, 'User not found');
    await AdminAuditLog.create({
      actor: req.user.id,
      action: suspended ? 'user.suspend' : 'user.unsuspend',
      targetType: 'user',
      targetId: id,
      details: { reason: req.body?.reason || null },
    });
    return sendSuccess(res, { user });
  } catch (err) {
    return sendError(res, 500, 'Failed to update user status', err.message);
  }
};

// Delete a user (only if they have no blogs to keep referential integrity)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const blogCount = await Blog.countDocuments({ author: id });
    if (blogCount > 0) return sendError(res, 400, 'User has blogs; suspend instead of delete');
    const user = await User.findByIdAndDelete(id);
    if (!user) return sendError(res, 404, 'User not found');
    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'user.delete',
      targetType: 'user',
      targetId: id,
      details: {},
    });
    return sendSuccess(res, { deleted: true });
  } catch (err) {
    return sendError(res, 500, 'Failed to delete user', err.message);
  }
};

// 7.2 Blog Moderation: GET /api/admin/blogs
export const listBlogs = async (req, res) => {
  try {
    const { tag, category, author, status, q, sort = 'newest' } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (tag) filter.tags = tag;
    if (category) filter.category = category;
    if (author) filter.author = author;
    if (status) filter.status = status;
    if (q) filter.title = { $regex: q, $options: 'i' };

    let query = Blog.find(filter).populate('author', 'name email');
    if (sort === 'mostViewed') {
      query = query.sort({ views: -1 });
    } else {
      // default newest
      query = query.sort({ createdAt: -1 });
    }

    const [blogs, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
      Blog.countDocuments(filter),
    ]);
    return sendSuccess(res, { blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch blogs', err.message);
  }
};

// 7.2 Blog Moderation: DELETE /api/admin/blogs/:id
export const approveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, { status: 'published' }, { new: true });
    if (!blog) return sendError(res, 404, 'Blog not found');
    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'blog.approve',
      targetType: 'blog',
      targetId: id,
      details: {},
    });
    return sendSuccess(res, { blog });
  } catch (err) {
    return sendError(res, 500, 'Failed to approve blog', err.message);
  }
};

// 7.2 Blog Moderation: DELETE /api/admin/blogs/:id
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return sendError(res, 404, 'Blog not found');
    await AdminAuditLog.create({
      actor: req.user.id,
      action: 'blog.delete',
      targetType: 'blog',
      targetId: id,
      details: {},
    });
    return sendSuccess(res, { deleted: true });
  } catch (err) {
    return sendError(res, 500, 'Failed to delete blog', err.message);
  }
};

// 7.3 Platform-Level Analytics: GET /api/admin/analytics
export const analytics = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    // Most active authors (by total blogs)
    const activeAuthors = await Blog.aggregate([
      { $group: { _id: '$author', blogs: { $sum: 1 } } },
      { $sort: { blogs: -1 } },
      { $limit: 10 },
    ]);

    // Populate author details
    const activeAuthorDetails = await User.populate(activeAuthors, { path: '_id', select: 'name email' });

    // Most popular blogs (by views and likes)
    const popularBlogs = await Blog.find({ status: 'published' })
      .select('title author views likes tags category createdAt')
      .populate('author', 'name')
      .sort({ views: -1 })
      .limit(20)
      .lean();

    // Top categories & tags
    const topTags = await Blog.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const topCategories = await Blog.aggregate([
      { $match: { category: { $ne: '' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Engagement insights
    // Daily Active Users (DAU) last 30 days
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const dau = await Interaction.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
          users: { $addToSet: '$user' },
          interactions: { $sum: 1 },
          dwellMs: { $sum: { $ifNull: ['$dwellTimeMs', 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id.day',
          dau: { $size: '$users' },
          interactions: 1,
          avgDwellMs: { $cond: [{ $gt: ['$interactions', 0] }, { $divide: ['$dwellMs', '$interactions'] }, 0] },
        },
      },
      { $sort: { day: 1 } },
    ]);

    // Reading trends (interactions by type per day)
    const trends = await Interaction.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    // Real-time activity: active collaboration sessions and participants
    const activeSessions = await CollabSession.find({ active: true })
      .select('blog participants updatedAt')
      .populate('blog', 'title author')
      .populate('participants', 'name');

    return sendSuccess(res, {
      mostActiveAuthors: activeAuthorDetails,
      mostPopularBlogs: popularBlogs,
      topTags,
      topCategories,
      dau,
      trends,
      realTimeActivity: activeSessions,
    });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch admin analytics', err.message);
  }
};

// 7.4 Trending Topics: GET /api/admin/trending
export const trending = async (req, res) => {
  try {
    const days = Number(req.query.days) || 14;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Trending tags by recent interactions weighted by type
    const weights = { view: 1, like: 5, bookmark: 3, comment: 4, share: 6 };
    const interactions = await Interaction.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: '$tagsSnapshot' },
      {
        $group: {
          _id: '$tagsSnapshot',
          score: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$type', 'view'] }, then: weights.view },
                  { case: { $eq: ['$type', 'like'] }, then: weights.like },
                  { case: { $eq: ['$type', 'bookmark'] }, then: weights.bookmark },
                  { case: { $eq: ['$type', 'comment'] }, then: weights.comment },
                  { case: { $eq: ['$type', 'share'] }, then: weights.share },
                ],
                default: 1,
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { score: -1, count: -1 } },
      { $limit: 20 },
    ]);

    // Trending categories by published blogs and interactions
    const categories = await Blog.aggregate([
      { $match: { status: 'published', createdAt: { $gte: since }, category: { $ne: '' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    return sendSuccess(res, { tags: interactions, categories });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch trending topics', err.message);
  }
};
