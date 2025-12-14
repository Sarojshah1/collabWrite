import CollabSession from '../models/CollabSession.js';
import CollabEdit from '../models/CollabEdit.js';
import Blog from '../models/Blog.js';
import BlogVersion from '../models/BlogVersion.js';
import { deltaToSanitizedHTML } from '../utils/render.js';

const presence = new Map(); 

export async function startSession(blogId, userId) {
  let session = await CollabSession.findOne({ blog: blogId, active: true });
  if (!session) {
    session = await CollabSession.create({ blog: blogId, participants: [userId] });
  } else if (!session.participants.map(String).includes(String(userId))) {
    session.participants.push(userId);
    await session.save();
  }
  return session;
}

export async function joinSession(blogId, userId) {
  return startSession(blogId, userId);
}

export function joinPresence(blogId, userId, cursor = null) {
  if (!presence.has(blogId)) presence.set(blogId, new Map());
  presence.get(blogId).set(userId, cursor);
}

export function updateCursor(blogId, userId, cursor) {
  if (!presence.has(blogId)) presence.set(blogId, new Map());
  presence.get(blogId).set(userId, cursor);
}

export function leavePresence(blogId, userId) {
  if (!presence.has(blogId)) return;
  const map = presence.get(blogId);
  map.delete(userId);
  if (map.size === 0) presence.delete(blogId);
}

export function getPresence(blogId) {
  const map = presence.get(blogId) || new Map();
  const users = [];
  for (const [uid, cursor] of map.entries()) users.push({ userId: uid, cursor });
  return users;
}

export async function applyEdit(blogId, userId, delta) {
  await CollabEdit.create({ blog: blogId, user: userId, delta });
}

export async function saveDraft(blogId, userId, content) {
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');

  // Support both legacy string content and new delta/html payload
  if (typeof content === 'string') {
    blog.content = content;
  } else if (content && typeof content === 'object') {
    const { title, contentDelta, contentHTML } = content;
    if (typeof title === 'string') blog.title = title;
    if (contentDelta && typeof contentDelta === 'object') blog.contentDelta = contentDelta;
    if (typeof contentHTML === 'string') {
      blog.contentHTML = contentHTML;
    } else if (contentDelta && typeof contentDelta === 'object') {
      blog.contentHTML = deltaToSanitizedHTML(contentDelta);
    }
  }

  blog.lastUpdatedBy = userId;
  blog.lastEditAt = new Date();
  blog.version = (blog.version || 0) + 1;
  await blog.save();

  // Persist snapshot for version history when we have structured content
  await BlogVersion.create({
    blog: blog._id,
    version: blog.version,
    author: userId,
    contentDelta: blog.contentDelta || null,
    contentHTML: blog.contentHTML || '',
    summary: blog.title?.slice(0, 140) || '',
  });

  return blog;
}


