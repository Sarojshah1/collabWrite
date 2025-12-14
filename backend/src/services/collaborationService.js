import Blog from '../models/Blog.js';

// In-memory presence store: { [blogId]: { [userId]: { cursor } } }
const presenceStore = new Map();

function getOrCreateBlogPresence(blogId) {
  if (!presenceStore.has(blogId)) {
    presenceStore.set(blogId, new Map());
  }
  return presenceStore.get(blogId);
}

export function getPresence(blogId) {
  const blogPresence = presenceStore.get(blogId);
  if (!blogPresence) return [];
  return Array.from(blogPresence.entries()).map(([userId, data]) => ({
    userId,
    cursor: data.cursor || null,
  }));
}

export function joinPresence(blogId, userId, cursor = null) {
  const blogPresence = getOrCreateBlogPresence(blogId);
  blogPresence.set(userId, { cursor });
}

export function leavePresence(blogId, userId) {
  const blogPresence = presenceStore.get(blogId);
  if (!blogPresence) return;
  blogPresence.delete(userId);
  if (blogPresence.size === 0) {
    presenceStore.delete(blogId);
  }
}

export async function startSession(blogId, userId) {
  // Minimal session object for now; extend later if you add real session tracking
  joinPresence(blogId, userId, null);
  return { blogId, userId };
}

export async function joinSession(blogId, userId) {
  // Joining a session is currently equivalent to joining presence
  joinPresence(blogId, userId, null);
  return { blogId, userId };
}

export function updateCursor(blogId, userId, cursor) {
  const blogPresence = getOrCreateBlogPresence(blogId);
  const existing = blogPresence.get(userId) || {};
  blogPresence.set(userId, { ...existing, cursor });
}

// For now, applyEdit does not persist anything itself; the client will send full content on saveDraft.
export async function applyEdit(blogId, userId, delta) {
  // You could implement operational transforms here if needed.
  // Keeping it as a no-op to satisfy the socket contract.
  return { blogId, userId, delta };
}

export async function saveDraft(blogId, userId, content) {
  // Assume `content` is the rendered HTML or rich text; adjust as needed.
  const blog = await Blog.findByIdAndUpdate(
    blogId,
    {
      content,
      lastEditAt: new Date(),
      lastUpdatedBy: userId,
      status: 'draft',
    },
    { new: true }
  );

  if (!blog) {
    throw new Error('Blog not found');
  }

  return blog;
}

export async function getBlogSnapshot(blogId) {
  const blog = await Blog.findById(blogId).lean();
  if (!blog) return null;
  return {
    blogId: String(blog._id),
    contentHTML: blog.contentHTML || blog.content || '',
  };
}
