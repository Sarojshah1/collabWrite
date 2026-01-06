import { validationResult } from "express-validator";
import Blog from "../models/Blog.js";
import Assignment from "../models/Assignment.js";
import { sendSuccess, sendError } from "../utils/response.js";
import Interaction from "../models/Interaction.js";
import BlogVersion from "../models/BlogVersion.js";
import { deltaToSanitizedHTML } from "../utils/render.js";
import { env } from "../config/env.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, "Validation failed", errors.array());
    return false;
  }
  return true;
}

export const create = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const {
      title,
      content = "",
      contentDelta = null,
      contentHTML = "",
      tags = [],
      status = "draft",
      collaborators = [],
      category = "",
    } = req.body;

    const blog = await Blog.create({
      title,
      content, // backward-compatible field
      contentDelta,
      contentHTML:
        contentHTML || (contentDelta ? deltaToSanitizedHTML(contentDelta) : ""),
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
      summary: title?.slice(0, 140) || "",
    });
    return sendSuccess(res, { blog }, 201);
  } catch (err) {
    return sendError(res, 500, "Failed to create blog", err.message);
  }
};

export const list = async (req, res) => {
  try {
    const { q, tag, author, status, saved, sort = "newest" } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (tag) filter.tags = { $in: [tag] };
    if (author) filter.author = author;
    if (q) filter.title = { $regex: q, $options: "i" };
    if (saved === "true" && req.user?.id) {
      filter.bookmarks = req.user.id;
    }

    const userId = req.user?.id;
    // Only show published to unauthenticated; for authenticated, show own drafts too. Admins see all.
    const isAdmin = req.user?.role === "admin";
    if (isAdmin) {
      if (!req.query.status) {
        // If admin and no status filter, maybe show all? Or still default to published if public view?
        // Assuming /manage view passes specific status, so default public list remains clean.
        // If admin wants to see "pending", they pass status=pending.
        // If no status, default to published for general feed consistency.
        filter.status = "published";
      }
      // If status IS passed (e.g. pending), Admin sees it. logic below handles it.
    } else if (userId) {
      filter.$or = [
        { status: "published" },
        { author: userId },
        { author: userId },
        { "collaborators.user": userId },
      ];
    } else {
      filter.status = "published";
    }

    let query = Blog.find(filter)
      .select("-content -contentDelta -contentHTML")
      .select("-content -contentDelta -contentHTML")
      .populate("author", "name avatar")
      .populate("collaborators.user", "name avatar");
    if (sort === "newest") query = query.sort({ createdAt: -1 });
    if (sort === "mostViewed") query = query.sort({ views: -1 });
    if (sort === "trending") query = query.sort({ views: -1, createdAt: -1 });

    const blogs = await query.exec();
    return sendSuccess(res, { blogs });
  } catch (err) {
    return sendError(res, 500, "Failed to list blogs", err.message);
  }
};

export const getById = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name avatar"
    );
    if (!blog) return sendError(res, 404, "Blog not found");

    // Authorization: allow if published or user is author/collaborator
    const userId = req.user?.id?.toString();
    const isOwner = userId && blog.author._id.toString() === userId;
    const collaborator =
      userId &&
      blog.collaborators.find((c) => c.user && c.user.toString() === userId);
    const isCollab = !!collaborator;
    let isAssignmentMember = false;
    if (!isOwner && !isCollab && userId) {
      const assignment = await Assignment.findOne({
        blog: blog._id,
        members: userId,
      }).select("_id");
      isAssignmentMember = !!assignment;
    }
    if (
      blog.status !== "published" &&
      !isOwner &&
      !isCollab &&
      !isAssignmentMember
    ) {
      return sendError(res, 403, "Not authorized");
    }

    // Return the user's permission level for frontend
    const userRole = isOwner
      ? "owner"
      : isCollab
      ? collaborator.role
      : "viewer";

    // Inject permissions into response if needed, or frontend calculates it
    const blogObj = blog.toObject();
    blogObj.userRole = userRole;

    // Increment views for published and record interaction
    if (blog.status === "published") {
      blog.views += 1;
      await blog.save();

      try {
        await Interaction.create({
          user: req.user?.id || null,
          blog: blog._id,
          type: "view",
          tagsSnapshot: blog.tags || [],
          authorSnapshot: blog.author?._id || blog.author,
        });
      } catch (e) {
        // Non-blocking analytics error
      }
    }

    // Ensure contentHTML is present for rendering; compute from delta if missing (do not persist)
    if (
      (!blog.contentHTML || blog.contentHTML.trim() === "") &&
      blog.contentDelta
    ) {
      try {
        blog.contentHTML = deltaToSanitizedHTML(blog.contentDelta);
      } catch (e) {
        // Fallback: keep as empty if conversion fails
        blog.contentHTML = "";
      }
    }

    return sendSuccess(res, { blog: blogObj });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch blog", err.message);
  }
};

export const toggleLike = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const blog = await Blog.findById(req.params.id).select(
      "_id likes status author collaborators tags"
    );
    if (!blog) return sendError(res, 404, "Blog not found");

    // Authorization: allow liking if published or user is author/collaborator
    const uid = userId.toString();
    const isOwner = blog.author?.toString() === uid;
    const isCollab =
      Array.isArray(blog.collaborators) &&
      blog.collaborators.map(String).includes(uid);
    if (blog.status !== "published" && !isOwner && !isCollab) {
      return sendError(res, 403, "Not authorized");
    }

    const likesArr = Array.isArray(blog.likes) ? blog.likes.map(String) : [];
    const already = likesArr.includes(uid);
    if (already) {
      blog.likes = blog.likes.filter((x) => x.toString() !== uid);
    } else {
      blog.likes.push(uid);
    }
    await blog.save();

    try {
      if (!already) {
        await Interaction.create({
          user: uid,
          blog: blog._id,
          type: "like",
          tagsSnapshot: blog.tags || [],
          authorSnapshot: blog.author,
          meta: { toggled: true },
        });
      }
    } catch (e) {
      // Non-blocking analytics error
    }

    return sendSuccess(res, {
      liked: !already,
      likesCount: Array.isArray(blog.likes) ? blog.likes.length : 0,
    });
  } catch (err) {
    return sendError(res, 500, "Failed to toggle like", err.message);
  }
};

export const toggleBookmark = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const blog = await Blog.findById(req.params.id).select(
      "_id bookmarks status author collaborators tags"
    );
    if (!blog) return sendError(res, 404, "Blog not found");

    // Authorization: allow bookmarking if published or user is author/collaborator
    const uid = userId.toString();
    const isOwner = blog.author?.toString() === uid;
    const isCollab =
      Array.isArray(blog.collaborators) &&
      blog.collaborators.map(String).includes(uid);
    if (blog.status !== "published" && !isOwner && !isCollab) {
      return sendError(res, 403, "Not authorized");
    }

    const bookmarksArr = Array.isArray(blog.bookmarks)
      ? blog.bookmarks.map(String)
      : [];
    const already = bookmarksArr.includes(uid);
    if (already) {
      blog.bookmarks = blog.bookmarks.filter((x) => x.toString() !== uid);
    } else {
      blog.bookmarks.push(uid);
    }
    await blog.save();

    try {
      if (!already) {
        await Interaction.create({
          user: uid,
          blog: blog._id,
          type: "bookmark",
          tagsSnapshot: blog.tags || [],
          authorSnapshot: blog.author,
          meta: { toggled: true },
        });
      }
    } catch (e) {
      // Non-blocking analytics error
    }

    return sendSuccess(res, { bookmarked: !already });
  } catch (err) {
    return sendError(res, 500, "Failed to toggle bookmark", err.message);
  }
};

export const listComments = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).select(
      "_id status author collaborators"
    );
    if (!blog) return sendError(res, 404, "Blog not found");

    const userId = req.user?.id?.toString();
    const isOwner = userId && blog.author?.toString() === userId;
    const isCollab =
      userId &&
      Array.isArray(blog.collaborators) &&
      blog.collaborators.map(String).includes(userId);
    if (blog.status !== "published" && !isOwner && !isCollab) {
      return sendError(res, 403, "Not authorized");
    }

    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit || "50").toString(), 10) || 50)
    );
    const rows = await Interaction.find({ blog: blog._id, type: "comment" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name avatar");

    const comments = rows.map((r) => ({
      id: r._id,
      text: r.meta?.text || "",
      createdAt: r.createdAt,
      user: r.user
        ? { id: r.user._id, name: r.user.name, avatar: r.user.avatar || "" }
        : null,
    }));

    return sendSuccess(res, { comments });
  } catch (err) {
    return sendError(res, 500, "Failed to list comments", err.message);
  }
};

export const addComment = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");
    const text = (req.body?.text || "").toString().trim();
    if (!text) return sendError(res, 400, "text is required");

    const blog = await Blog.findById(req.params.id).select(
      "_id tags author status collaborators"
    );
    if (!blog) return sendError(res, 404, "Blog not found");

    const uid = userId.toString();
    const isOwner = blog.author?.toString() === uid;
    const isCollab =
      Array.isArray(blog.collaborators) &&
      blog.collaborators.map(String).includes(uid);
    if (blog.status !== "published" && !isOwner && !isCollab) {
      return sendError(res, 403, "Not authorized");
    }

    const doc = await Interaction.create({
      user: uid,
      blog: blog._id,
      type: "comment",
      tagsSnapshot: blog.tags || [],
      authorSnapshot: blog.author,
      meta: { text },
    });

    return sendSuccess(
      res,
      {
        comment: {
          id: doc._id,
          text,
          createdAt: doc.createdAt,
        },
      },
      201
    );
  } catch (err) {
    return sendError(res, 500, "Failed to add comment", err.message);
  }
};

export const update = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return sendError(res, 404, "Blog not found");

    const userId = req.user.id.toString();
    const isOwner = blog.author.toString() === userId;
    const collaborator = blog.collaborators.find(
      (c) => c.user && c.user.toString() === userId
    );
    const isCollab = !!collaborator;

    // Check if collaborator has edit rights
    const canEdit = isOwner || (isCollab && collaborator.role === "editor");

    let isAssignmentMember = false;
    if (!canEdit) {
      const assignment = await Assignment.findOne({
        blog: blog._id,
        members: userId,
      }).select("_id");
      isAssignmentMember = !!assignment;
    }

    if (!canEdit && !isAssignmentMember)
      return sendError(res, 403, "Not authorized to edit");

    const {
      title,
      content,
      contentDelta,
      contentHTML,
      tags,
      status,
      collaborators,
      category,
    } = req.body;
    if (typeof title === "string") blog.title = title;
    if (typeof content === "string") blog.content = content;
    if (contentDelta && typeof contentDelta === "object")
      blog.contentDelta = contentDelta;
    if (typeof contentHTML === "string") {
      blog.contentHTML = contentHTML;
    } else if (contentDelta && typeof contentDelta === "object") {
      blog.contentHTML = deltaToSanitizedHTML(contentDelta);
    }
    if (Array.isArray(tags)) blog.tags = tags;
    if (typeof status === "string") blog.status = status;
    if (Array.isArray(collaborators)) blog.collaborators = collaborators;
    if (typeof category === "string") blog.category = category;
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
      contentHTML: blog.contentHTML || "",
      summary: blog.title?.slice(0, 140) || "",
    });

    return sendSuccess(res, { blog });
  } catch (err) {
    return sendError(res, 500, "Failed to update blog", err.message);
  }
};

export const remove = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id,
    });
    if (!blog) return sendError(res, 404, "Blog not found or not authorized");
    return sendSuccess(res, { deleted: true });
  } catch (err) {
    return sendError(res, 500, "Failed to delete blog", err.message);
  }
};

// Versioning APIs
export const listVersions = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).select(
      "_id author collaborators"
    );
    if (!blog) return sendError(res, 404, "Blog not found");
    const userId = req.user.id.toString();
    const isOwner = blog.author.toString() === userId;
    const isCollab = blog.collaborators.map(String).includes(userId);
    if (!isOwner && !isCollab) return sendError(res, 403, "Not authorized");

    const versions = await BlogVersion.find({ blog: blog._id })
      .select("version createdAt author")
      .sort({ version: -1 })
      .populate("author", "name");
    return sendSuccess(res, { versions });
  } catch (err) {
    return sendError(res, 500, "Failed to list versions", err.message);
  }
};

export const getVersion = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).select(
      "_id author collaborators"
    );
    if (!blog) return sendError(res, 404, "Blog not found");
    const userId = req.user.id.toString();
    const isOwner = blog.author.toString() === userId;
    const isCollab = blog.collaborators.map(String).includes(userId);
    if (!isOwner && !isCollab) return sendError(res, 403, "Not authorized");

    const versionNum = Number(req.params.version);
    const version = await BlogVersion.findOne({
      blog: blog._id,
      version: versionNum,
    });
    if (!version) return sendError(res, 404, "Version not found");

    // Ensure version.contentHTML is present for rendering on GET
    if (
      (!version.contentHTML || version.contentHTML.trim() === "") &&
      version.contentDelta
    ) {
      try {
        version.contentHTML = deltaToSanitizedHTML(version.contentDelta);
      } catch (e) {
        version.contentHTML = "";
      }
    }

    return sendSuccess(res, { version });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch version", err.message);
  }
};

export const restoreVersion = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return sendError(res, 404, "Blog not found");
    const userId = req.user.id.toString();
    const isOwner = blog.author.toString() === userId;
    const isCollab = blog.collaborators.map(String).includes(userId);
    if (!isOwner && !isCollab) return sendError(res, 403, "Not authorized");

    const versionNum = Number(req.params.version);
    const version = await BlogVersion.findOne({
      blog: blog._id,
      version: versionNum,
    });
    if (!version) return sendError(res, 404, "Version not found");

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
      summary: blog.title?.slice(0, 140) || "",
    });

    return sendSuccess(res, { blog });
  } catch (err) {
    return sendError(res, 500, "Failed to restore version", err.message);
  }
};

// Realtime info for Yjs clients
export const realtimeInfo = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "_id");
    if (!blog) return sendError(res, 404, "Blog not found");

    // Authorization: allow if published or user is author/collaborator
    const userId = req.user?.id?.toString();
    const isOwner = userId && blog.author._id.toString() === userId;
    const isCollab = userId && blog.collaborators.map(String).includes(userId);
    if (blog.status !== "published" && !isOwner && !isCollab) {
      return sendError(res, 403, "Not authorized");
    }

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    const protocol = isSecure ? "wss" : "ws";
    const host = req.get("host");
    // Always point to in-process Yjs WebSocket server mounted at /yjs
    const wsUrl = `${protocol}://${host}/yjs`;
    const room = `yjs-blog-${blog._id.toString()}`;
    const full = `${wsUrl}/${room}`;
    return sendSuccess(res, { wsUrl, room, full });
  } catch (err) {
    return sendError(res, 500, "Failed to get realtime info", err.message);
  }
};
