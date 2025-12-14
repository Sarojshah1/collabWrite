import MergeConflict from '../models/MergeConflict.js';
import Blog from '../models/Blog.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';

const openai = env.AI_PROVIDER === 'openai' ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
const gemini = env.AI_PROVIDER === 'gemini' ? new GoogleGenerativeAI(env.GOOGLE_API_KEY) : null;

function ensureKey(res) {
  if (env.AI_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      sendError(res, 500, 'OPENAI_API_KEY is not configured');
      return false;
    }
    return true;
  }
  if (env.AI_PROVIDER === 'gemini') {
    if (!env.GOOGLE_API_KEY) {
      sendError(res, 500, 'GOOGLE_API_KEY is not configured');
      return false;
    }
    return true;
  }
  sendError(res, 500, `Unsupported AI_PROVIDER: ${env.AI_PROVIDER}`);
  return false;
}

// List conflicts for a given blog (e.g. to show in "AI Merge Resolver" view)
export async function listConflicts(req, res, next) {
  try {
    const { blogId } = req.params;
    const conflicts = await MergeConflict.find({ blog: blogId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, conflicts });
  } catch (err) {
    next(err);
  }
}

// Accept a merge: apply mergedText to the blog's content snapshot (simplified)
export async function acceptMerge(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id; // from auth middleware

    const conflict = await MergeConflict.findById(id);
    if (!conflict) {
      return res.status(404).json({ success: false, message: 'Conflict not found' });
    }
    if (!conflict.mergedText) {
      return res.status(400).json({ success: false, message: 'No merged text available for this conflict' });
    }

    // Simplified: append merged text into blog snapshot. In a real system, you would
    // locate the segment in the blog HTML/Delta and replace that segment only.
    const blog = await Blog.findById(conflict.blog);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // NOTE: this is intentionally naive; treat this as an integration hook.
    blog.contentHTML = blog.contentHTML || '';
    blog.contentHTML += `\n<!-- merged segment ${conflict.segmentId} -->\n` + conflict.mergedText;
    await blog.save();

    conflict.status = 'resolved';
    conflict.resolvedBy = userId;
    conflict.resolvedAt = new Date();
    await conflict.save();

    res.json({ success: true, conflict });
  } catch (err) {
    next(err);
  }
}

// DEV-ONLY: create a sample conflict for a blog to test the UI.
// This should only be used in development and is guarded by NODE_ENV.
export async function createSampleConflict(req, res, next) {
  try {
    if (env.NODE_ENV !== 'development') {
      return res.status(403).json({ success: false, message: 'Sample conflict endpoint only available in development' });
    }

    const { blogId, segmentId = 'para_demo' } = req.body || {};
    if (!blogId) {
      return res.status(400).json({ success: false, message: 'blogId is required' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const conflict = await MergeConflict.create({
      blog: blog._id,
      segmentId,
      versionA: {
        user: req.user?._id,
        edit: undefined,
        text: 'Teamwork is important because it helps share tasks fairly and finish assignments on time. Everyone should try their best so the group grade is high.',
      },
      versionB: {
        user: req.user?._id,
        edit: undefined,
        text: 'Effective collaboration distributes responsibilities, reduces last-minute stress, and makes it easier for instructors to evaluate each student\'s contribution.',
      },
      status: 'pending_ai',
    });

    return res.json({ success: true, conflict });
  } catch (err) {
    next(err);
  }
}

// Resolve a conflict using AI to propose mergedText + rationale
export async function resolveConflictWithAI(req, res, next) {
  try {
    if (!ensureKey(res)) return;

    const { id } = req.params;
    const conflict = await MergeConflict.findById(id).populate('blog');
    if (!conflict) {
      return res.status(404).json({ success: false, message: 'Conflict not found' });
    }

    const { versionA, versionB } = conflict;
    const blog = conflict.blog;

    const sysPrompt = 'You merge conflicting student-written paragraphs for group assignments.\n' +
      '- Preserve key points from BOTH versions so contributors feel represented.\n' +
      '- Improve clarity, flow, and academic tone.\n' +
      '- Avoid changing the meaning.\n' +
      '- Output STRICT JSON with keys: mergedText (string), rationale (array of 2-4 short strings).\n' +
      '- Do not include code fences or extra commentary.';

    const assignmentTitle = blog?.title || 'Untitled assignment';
    const userPrompt =
      `Assignment title: ${assignmentTitle}\n\n` +
      `Version A:\n${versionA.text}\n\n` +
      `Version B:\n${versionB.text}\n\n` +
      'Task: Produce a single improved paragraph that reconciles both versions and then explain briefly why you merged it that way.';

    let raw = '';
    if (env.AI_PROVIDER === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
      });
      raw = completion.choices?.[0]?.message?.content || '';
    } else if (env.AI_PROVIDER === 'gemini') {
      const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(`${sysPrompt}\n\n${userPrompt}`);
      raw = result?.response?.text?.() || '';
    }

    const extractJson = (text) => {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(text.slice(start, end + 1));
        } catch {
          return null;
        }
      }
      return null;
    };

    const parsed = extractJson(raw);
    if (!parsed || typeof parsed.mergedText !== 'string') {
      return sendError(res, 502, 'AI merge resolver returned an invalid response');
    }

    conflict.mergedText = parsed.mergedText.trim();
    conflict.rationale = Array.isArray(parsed.rationale)
      ? parsed.rationale.map((r) => String(r || '')).filter(Boolean).slice(0, 6)
      : [];
    conflict.status = 'awaiting_approval';
    await conflict.save();

    res.json({ success: true, conflict });
  } catch (err) {
    next(err);
  }
}

// Placeholder for rejecting a merge if needed later
export async function rejectMerge(req, res, next) {
  try {
    const { id } = req.params;
    const conflict = await MergeConflict.findById(id);
    if (!conflict) {
      return res.status(404).json({ success: false, message: 'Conflict not found' });
    }
    conflict.status = 'rejected';
    await conflict.save();
    res.json({ success: true, conflict });
  } catch (err) {
    next(err);
  }
}
