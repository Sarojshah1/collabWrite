import path from 'path';
import { sendError, sendSuccess } from '../utils/response.js';
import Template from '../models/Template.js';
import Blog from '../models/Blog.js';
import DOMPurify from 'isomorphic-dompurify';

// Very small, dependency-free markdown to HTML (basic headings, lists, code)
function basicMarkdownToHtml(md = '') {
  if (!md) return '';
  const escapeHtml = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  md = md.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code)}</code></pre>`);
  // Headings
  md = md.replace(/^# (.*)$/gm, '<h1>$1</h1>')
         .replace(/^## (.*)$/gm, '<h2>$1</h2>')
         .replace(/^### (.*)$/gm, '<h3>$1</h3>');
  // Bold / italic
  md = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
         .replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Lists
  md = md.replace(/^- (.*)$/gm, '<li>$1</li>');
  md = md.replace(/(<li>[^<]*<\/li>\n?)+/g, (m) => `<ul>${m.replace(/\n/g, '')}</ul>`);
  // Paragraphs (very naive)
  md = md.split(/\n\n+/).map((block) => {
    if (/^<h\d|^<ul|^<pre|^<blockquote|^<p|^<li/.test(block)) return block;
    return `<p>${block}</p>`;
  }).join('\n');

  return md;
}

function fillPlaceholders(body = '', vars = {}) {
  return body.replace(/{{\s*([\w.-]+)\s*}}/g, (_, key) => {
    const val = vars[key];
    return val === undefined || val === null ? '' : String(val);
  });
}

export const listTemplates = async (req, res) => {
  try {
    const items = await Template.find({}).sort({ type: 1, name: 1 }).select('name slug type description tags updatedAt');
    return sendSuccess(res, { templates: items });
  } catch (err) {
    return sendError(res, 500, 'Failed to list templates', err.message);
  }
};

export const getTemplate = async (req, res) => {
  try {
    const { slug } = req.params;
    const tpl = await Template.findOne({ slug });
    if (!tpl) return sendError(res, 404, 'Template not found');
    return sendSuccess(res, { template: tpl });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch template', err.message);
  }
};

// Instantiate a Blog from a template
// body: { title, category, tags, status='draft', summary, variables: { key: value } }
export const instantiateBlogFromTemplate = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id; // from authMiddleware
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const { slug } = req.params;
    const { title, category = '', tags = [], status = 'draft', summary = '', variables = {} } = req.body || {};
    if (!title) return sendError(res, 400, 'title is required');

    const tpl = await Template.findOne({ slug });
    if (!tpl) return sendError(res, 404, 'Template not found');

    // Prepare content by filling placeholders
    const filledMd = fillPlaceholders(tpl.body, { title, summary, ...variables });
    const html = DOMPurify.sanitize(basicMarkdownToHtml(filledMd));

    const blog = new Blog({
      title,
      content: filledMd, // legacy field kept for compatibility
      contentDelta: null, // optional, can be generated in editor later
      contentHTML: html,
      version: 1,
      lastEditAt: new Date(),
      tags: Array.isArray(tags) ? tags : [],
      category: category || '',
      status: status === 'published' ? 'published' : 'draft',
      author: userId,
      collaborators: [],
      lastUpdatedBy: userId,
    });

    await blog.save();

    // Optionally create initial BlogVersion record if you want version trail at creation
    // Skipped here to keep concerns separate; can be added if needed.

    return sendSuccess(res, { blog }, 201);
  } catch (err) {
    return sendError(res, 500, 'Failed to instantiate blog from template', err.message);
  }
};
