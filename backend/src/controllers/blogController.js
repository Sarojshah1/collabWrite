import { validationResult } from 'express-validator';
import Blog from '../models/Blog.js';
import { sendSuccess, sendError } from '../utils/response.js';
import Interaction from '../models/Interaction.js';
import BlogVersion from '../models/BlogVersion.js';
import { deltaToSanitizedHTML } from '../utils/render.js';
import { env } from '../config/env.js';

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, 'Validation failed', errors.array());
    return false;
  }
  return true;
}

export const create = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const {
      title,
      content = '',
      contentDelta = null,
      contentHTML = '',
      tags = [],
      status = 'draft',
      collaborators = [],
      category = '',
    } = req.body;

    const blog = await Blog.create({
      title,
      content, // backward-compatible field
      contentDelta,
      contentHTML: contentHTML || (contentDelta ? deltaToSanitizedHTML(contentDelta) : ''),
      version: 1,
      lastEditAt: new Date(),
      tags,
      category,
      status,
      author: req.user.id,
      collaborators,
      lastUpdatedBy: req.user.id,
    });

    // Create initial version snapshot
    await BlogVersion.create({
      blog: blog._id,
      version: 1,
      author: req.user.id,
      contentDelta,
      contentHTML: blog.contentHTML,
      summary: title?.slice(0, 140) || '',
    });
    return sendSuccess(res, { blog }, 201);
  } catch (err) {
    return sendError(res, 500, 'Failed to create blog', err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { q, tag, author, status, sort = 'newest' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (tag) filter.tags = tag;
    if (author) filter.author = author;
    if (q) filter.title = { $regex: q, $options: 'i' };

    // Only show published to unauthenticated; for authenticated, show own drafts too
    filter.$or = [
      { status: 'published' },
      { author: req.user?.id },
      { collaborators: req.user?.id },
    ];

    let query = Blog.find(filter).select('-content -contentDelta -contentHTML').populate('author', 'name avatar');
    if (sort === 'newest') query = query.sort({ createdAt: -1 });
    if (sort === 'mostViewed') query = query.sort({ views: -1 });
    if (sort === 'trending') query = query.sort({ likesCount: -1, views: -1 });

    const blogs = await query.exec();
    return sendSuccess(res, { blogs });
  } catch (err) {
    return sendError(res, 500, 'Failed to list blogs', err.message);
  }
};

export const getById = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    if (!blog) return sendError(res, 404, 'Blog not found');

    // Authorization: allow if published or user is author/collaborator
    const userId = req.user?.id?.toString();
    const isOwner = userId && blog.author._id.toString() === userId;
    const isCollab = userId && blog.collaborators.map(String).includes(userId);
    if (blog.status !== 'published' && !isOwner && !isCollab) {
      return sendError(res, 403, 'Not authorized');
    }

    // Increment views for published and record interaction
    if (blog.status === 'published') {
      blog.views += 1;
      await blog.save();

      try {
        await Interaction.create({
          user: req.user?.id || null,
          blog: blog._id,
          type: 'view',
          tagsSnapshot: blog.tags || [],
          authorSnapshot: blog.author?._id || blog.author,
        });
      } catch (e) {
        // Non-blocking analytics error
      }
    }

    // Ensure contentHTML is present for rendering; compute from delta if missing (do not persist)
    if ((!blog.contentHTML || blog.contentHTML.trim() === '') && blog.contentDelta) {
      try {
        blog.contentHTML = deltaToSanitizedHTML(blog.contentDelta);
      } catch (e) {
        // Fallback: keep as empty if conversion fails
        blog.contentHTML = '';
      }
    }

    return sendSuccess(res, { blog });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch blog', err.message);
  }
};

export const update = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return sendError(res, 404, 'Blog not found');

    const userId = req.user.id.toString();
    const isOwner = blog.author.toString() === userId;
    const isCollab = blog.collaborators.map(String).includes(userId);
    if (!isOwner && !isCollab) return sendError(res, 403, 'Not authorized');

    const { title, content, contentDelta, contentHTML, tags, status, collaborators, category } = req.body;
    if (typeof title === 'string') blog.title = title;
    if (typeof content === 'string') blog.content = content;
    if (contentDelta && typeof contentDelta === 'object') blog.contentDelta = contentDelta;
    if (typeof contentHTML === 'string') {
      blog.contentHTML = contentHTML;
    } else if (contentDelta && typeof contentDelta === 'object') {
      blog.contentHTML = deltaToSanitizedHTML(contentDelta);
    }
    if (Array.isArray(tags)) blog.tags = tags;
    if (typeof status === 'string') blog.status = status;
    if (Array.isArray(collaborators)) blog.collaborators = collaborators;
    if (typeof category === 'string') blog.category = category;
    blog.lastUpdatedBy = req.user.id;
    blog.lastEditAt = new Date();
    blog.version = (blog.version || 0) + 1;
    await blog.save();

    // Save version snapshot
    await BlogVersion.create({
      blog: blog._id,
      version: blog.version,
      author: req.user.id,
      contentDelta: blog.contentDelta || null,
      contentHTML: blog.contentHTML || '',
      summary: blog.title?.slice(0, 140) || '',
    });

    return sendSuccess(res, { blog });
  } catch (err) {
    return sendError(res, 500, 'Failed to update blog', err.message);
  }
};

export const remove = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!blog) return sendError(res, 404, 'Blog not found or not authorized');
    return sendSuccess(res, { deleted: true });
  } catch (err) {
    return sendError(res, 500, 'Failed to delete blog', err.message);
  }
};

// Versioning APIs
export const listVersions = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).select('_id author collaborators');
    if (!blog) return sendError(res, 404, 'Blog not found');
    const userId = req.user.id.toString();
    const isOwner = blog.author.toString() === userId;
    const isCollab = blog.collaborators.map(String).includes(userId);
    if (!isOwner && !isCollab) return sendError(res, 403, 'Not authorized');

    const versions = await BlogVersion.find({ blog: blog._id })
      .select('version createdAt author')
      .sort({ version: -1 })
      .populate('author', 'name');
    return sendSuccess(res, { versions });
  } catch (err) {
    return sendError(res, 500, 'Failed to list versions', err.message);
  }
};

export const getVersion = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).select('_id author collaborators');
    if (!blog) return sendError(res, 404, 'Blog not found');
    const userId = req.user.id.toString();
    const isOwner = blog.author.toString() === userId;
    const isCollab = blog.collaborators.map(String).includes(userId);
    if (!isOwner && !isCollab) return sendError(res, 403, 'Not authorized');

    const versionNum = Number(req.params.version);
    const version = await BlogVersion.findOne({ blog: blog._id, version: versionNum });
    if (!version) return sendError(res, 404, 'Version not found');

    // Ensure version.contentHTML is present for rendering on GET
    if ((!version.contentHTML || version.contentHTML.trim() === '') && version.contentDelta) {
      try {
        version.contentHTML = deltaToSanitizedHTML(version.contentDelta);
      } catch (e) {
        version.contentHTML = '';
      }
    }

    return sendSuccess(res, { version });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch version', err.message);
  }
};

export const restoreVersion = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return sendError(res, 404, 'Blog not found');
    const userId = req.user.id.toString();
    const isOwner = blog.author.toString() === userId;
    const isCollab = blog.collaborators.map(String).includes(userId);
    if (!isOwner && !isCollab) return sendError(res, 403, 'Not authorized');

    const versionNum = Number(req.params.version);
    const version = await BlogVersion.findOne({ blog: blog._id, version: versionNum });
    if (!version) return sendError(res, 404, 'Version not found');

    blog.contentDelta = version.contentDelta;
    blog.contentHTML = version.contentHTML;
    blog.lastUpdatedBy = req.user.id;
    blog.lastEditAt = new Date();
    blog.version = (blog.version || 0) + 1;
    await blog.save();

    await BlogVersion.create({
      blog: blog._id,
      version: blog.version,
      author: req.user.id,
      contentDelta: blog.contentDelta,
      contentHTML: blog.contentHTML,
      summary: blog.title?.slice(0, 140) || '',
    });

    return sendSuccess(res, { blog });
  } catch (err) {
    return sendError(res, 500, 'Failed to restore version', err.message);
  }
};

// Realtime info for Yjs clients
export const realtimeInfo = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).populate('author', '_id');
    if (!blog) return sendError(res, 404, 'Blog not found');

    // Authorization: allow if published or user is author/collaborator
    const userId = req.user?.id?.toString();
    const isOwner = userId && blog.author._id.toString() === userId;
    const isCollab = userId && blog.collaborators.map(String).includes(userId);
    if (blog.status !== 'published' && !isOwner && !isCollab) {
      return sendError(res, 403, 'Not authorized');
    }

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const protocol = isSecure ? 'wss' : 'ws';
    const host = req.get('host');
    // Always point to in-process Yjs WebSocket server mounted at /yjs
    const wsUrl = `${protocol}://${host}/yjs`;
    const room = `yjs-blog-${blog._id.toString()}`;
    const full = `${wsUrl}/${room}`;
    return sendSuccess(res, { wsUrl, room, full });
  } catch (err) {
    return sendError(res, 500, 'Failed to get realtime info', err.message);
  }
};
