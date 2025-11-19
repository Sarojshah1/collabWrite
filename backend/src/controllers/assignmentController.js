import Assignment from '../models/Assignment.js';
import Blog from '../models/Blog.js';

// GET /api/assignments
export async function listAssignments(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const assignments = await Assignment.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('blog', 'title')
      .lean();

    res.json({ success: true, assignments });
  } catch (err) {
    next(err);
  }
}

// POST /api/assignments
export async function createAssignment(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { title, description, memberIds = [], dueDate } = req.body || {};

    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    // Auto-create a draft blog to act as the underlying document for this assignment
    const blog = await Blog.create({
      title,
      content: '',
      contentDelta: null,
      contentHTML: '',
      status: 'draft',
      author: userId,
    });

    const uniqueMembers = Array.from(new Set([userId, ...memberIds]));

    const assignment = await Assignment.create({
      title,
      description,
      blog: blog._id,
      owner: userId,
      members: uniqueMembers,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    next(err);
  }
}
