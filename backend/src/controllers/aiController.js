import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
const gemini = env.GOOGLE_API_KEY ? new GoogleGenerativeAI(env.GOOGLE_API_KEY) : null;
const claude = env.CLAUDE_API_KEY ? new Anthropic({ apiKey: env.CLAUDE_API_KEY }) : null;

function ensureKey(res) {
  if (env.AI_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      sendError(res, 500, 'OPENAI_API_KEY is not configured');
      return false;
    }
    return true;
  }
  if (env.AI_PROVIDER === 'claude') {
    if (!env.CLAUDE_API_KEY) {
      sendError(res, 500, 'CLAUDE_API_KEY is not configured');
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

export const generateBlog = async (req, res) => {
  try {
    if (!ensureKey(res)) return;
    const { prompt, audience = 'general readers', tone = 'formal and academic', wordCount = 1800, outline = [] } = req.body || {};
    if (!prompt || typeof prompt !== 'string') return sendError(res, 400, 'prompt is required');

    const sys = `You are an expert academic writing assistant. You write full assignment-style documents for students.
- The output must be a well-structured assignment, not a casual blog post.
- Use ONLY the following markdown features, because the editor supports only these:
  - Headings: lines starting with "# ", "## ", or "### " for sections and subsections.
  - Unordered lists: lines starting with "* " for bullet points.
  - Bold for short key terms using **double asterisks** (for example, **Next.js**).
  - Italic for short phrases using *single asterisks*.
  - Normal paragraphs as plain text lines separated by blank lines.
- Do NOT use tables, blockquotes, code fences, backticks, or inline HTML; avoid any other markdown syntax.
- Include a clear title, an introduction with background and a main argument, logically ordered body sections with headings, and a strong conclusion.
- Maintain a ${tone} tone that is suitable for university coursework and avoid slang.
- Be factual and do not fabricate precise statistics; if you reference data, keep it high level.
- Return only raw markdown content without code fences.`;

    const user = `Topic/Prompt: ${prompt}
Audience: ${audience}
Tone: ${tone}
Target length: ~${wordCount} words
${Array.isArray(outline) && outline.length ? `Outline to follow: ${outline.join(' | ')}` : ''}`;

    let content = '';
    if (env.AI_PROVIDER === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      });
      content = completion.choices?.[0]?.message?.content || '';
    } else if (env.AI_PROVIDER === 'gemini') {
      // Primary provider: Gemini
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `${sys}\n\n${user}`;
        const result = await model.generateContent(prompt);
        content = result?.response?.text?.() || '';
      } catch (err) {
        console.log('Gemini failed, attempting Claude fallback…', err?.status, err?.message);
        if (claude) {
          const msg = await claude.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            temperature: 0.7,
            system: sys,
            messages: [
              { role: 'user', content: user },
            ],
          });
          const parts = Array.isArray(msg?.content) ? msg.content : [];
          content = parts.map((p) => p?.text || '').join('\n').trim();
        } else {
          throw err;
        }
      }
    } else if (env.AI_PROVIDER === 'claude') {
      const msg = await claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        temperature: 0.7,
        system: sys,
        messages: [
          { role: 'user', content: user },
        ],
      });
      const parts = Array.isArray(msg?.content) ? msg.content : [];
      content = parts.map((p) => p?.text || '').join('\n').trim();
    }
    return sendSuccess(res, { content });
  } catch (err) {
    console.log(err);

    // Gracefully handle provider overload (e.g. Gemini 503)
    if ((err as any)?.status === 503) {
      return sendError(
        res,
        503,
        'AI service is temporarily overloaded. Please try again in a few seconds.',
        (err as any).statusText || (err as any).message
      );
    }

    // Handle Anthropic low-credit / billing issues explicitly so the user understands the problem
    const msg = (err as any)?.error?.error?.message || (err as any)?.message;
    if ((err as any)?.status === 400 && typeof msg === 'string' && msg.toLowerCase().includes('credit balance is too low')) {
      return sendError(
        res,
        503,
        'AI provider account has insufficient credits. Please update billing or switch to a different AI provider in configuration.',
        msg
      );
    }

    return sendError(res, 500, 'Failed to generate blog', (err as any)?.message || 'Unknown error');
  }
};

// Generate a blog draft (titles + outline + content) from topic/explanation
export const generateDraft = async (req, res) => {
  try {
    if (!ensureKey(res)) return;
    const {
      topic,
      explanation,
      audience = 'general readers',
      tone = 'informative',
      wordCount = 900,
      keywords = [],
    } = req.body || {};

    if (!topic && !explanation) {
      return sendError(res, 400, 'Provide at least one of: topic or explanation');
    }

    const sys = `You are an expert content assistant who drafts blog posts for human editors.
- Output must be STRICT JSON (no code fences), with keys: titleSuggestions (array of strings), outline (array of strings), content (markdown string).
- Title suggestions: 3-5 catchy, SEO-aware options, under 70 characters each, no quotes, no numbering.
- Outline: 6-10 concise section titles in logical order.
- Content: well-structured markdown (~${wordCount} words) with H2/H3 headings, bullet points where useful, an intro and a conclusion. Avoid fabrications and keep a neutral, ${tone} tone.
- If keywords are provided, naturally incorporate them where appropriate.`;

    const details = `Topic: ${topic || '(unspecified)'}\n` +
      (explanation ? `Explanation: ${explanation}\n` : '') +
      (Array.isArray(keywords) && keywords.length ? `Keywords: ${keywords.join(', ')}\n` : '') +
      `Audience: ${audience}`;

    let raw = '';
    if (env.AI_PROVIDER === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: details },
        ],
        temperature: 0.7,
      });
      raw = completion.choices?.[0]?.message?.content || '';
    } else if (env.AI_PROVIDER === 'gemini') {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(`${sys}\n\n${details}`);
      raw = result?.response?.text?.() || '';
    } else if (env.AI_PROVIDER === 'claude') {
      const msg = await claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        temperature: 0.7,
        system: sys,
        messages: [
          { role: 'user', content: details },
        ],
      });
      const parts = Array.isArray(msg?.content) ? msg.content : [];
      raw = parts.map((p) => p?.text || '').join('\n').trim();
    }

    // Try to extract JSON even if the model added stray text or fences
    const extractJson = (text) => {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const maybe = text.slice(start, end + 1);
        try { return JSON.parse(maybe); } catch { /* fallthrough */ }
      }
      return null;
    };

    let data = extractJson(raw);
    if (!data) {
      // Fallback: treat the entire response as content-only
      data = { titleSuggestions: [], outline: [], content: raw?.trim?.() || '' };
    }

    // Normalize fields
    let { titleSuggestions = [], outline = [], content = '' } = data;
    if (!Array.isArray(titleSuggestions)) titleSuggestions = [];
    if (!Array.isArray(outline)) outline = [];
    if (typeof content !== 'string') content = String(content || '');

    // Clean titles
    titleSuggestions = Array.from(new Set(
      titleSuggestions
        .map((t) => String(t || ''))
        .map((t) => t.replace(/^['"“”‘’\-\s]+|['"“”‘’\s]+$/g, ''))
        .filter((t) => t.length > 0 && t.length <= 80)
    ));
    // Ensure at least 2 suggestions if possible by heuristics from outline/headings
    if (titleSuggestions.length < 2 && outline.length > 0) {
      const extra = outline.slice(0, 3).map((s) => String(s).replace(/^[-*#\d.\s]+/, '').trim()).filter(Boolean);
      titleSuggestions = Array.from(new Set([...titleSuggestions, ...extra])).slice(0, 5);
    }

    return sendSuccess(res, { titleSuggestions, outline, content });
  } catch (err) {
    return sendError(res, 500, 'Failed to generate draft', err.message);
  }
};

export const generateTitle = async (req, res) => {
  try {
    if (!ensureKey(res)) return;
    const {
      prompt,
      topic,
      explanation,
      audience = 'general readers',
      tone = 'informative',
      keywords = [],
      avoidWords = [],
      maxLength = 70,
      variations = 5,
    } = req.body || {};

    // Build an effective task description even if the caller did not pass a raw `prompt`
    const userNeedPresent = Boolean(prompt || topic || explanation);
    if (!userNeedPresent) return sendError(res, 400, 'Provide at least one of: prompt, topic, or explanation');

    const count = Math.max(2, Math.min(Number(variations) || 5, 10));

    const compositePrompt =
      prompt ||
      `Topic: ${topic || '(unspecified)'}\n` +
        (explanation ? `Explanation: ${explanation}\n` : '') +
        `Audience: ${audience}\nTone: ${tone}`;

    let text = '';
    if (env.AI_PROVIDER === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You generate catchy, SEO-friendly blog post titles. Constraints: return ONLY a numbered list (1., 2., ...), no extra commentary; keep each title under the requested character limit; avoid quote marks around titles; avoid duplicates; be specific and benefit-oriented.',
          },
          {
            role: 'user',
            content:
              `Create ${count} distinct blog titles based on the details below.\n` +
              `Keep each title under ${maxLength} characters.\n` +
              (Array.isArray(keywords) && keywords.length ? `Prefer including these keywords where natural: ${keywords.join(', ')}.\n` : '') +
              (Array.isArray(avoidWords) && avoidWords.length ? `Avoid these words: ${avoidWords.join(', ')}.\n` : '') +
              `Content details:\n${compositePrompt}`,
          },
        ],
        temperature: 0.8,
      });
      text = completion.choices?.[0]?.message?.content || '';
    } else if (env.AI_PROVIDER === 'gemini') {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Create ${count} distinct, catchy, SEO-friendly blog titles.\n` +
          `Keep each title under ${maxLength} characters.\n` +
          (Array.isArray(keywords) && keywords.length ? `Prefer including these keywords where natural: ${keywords.join(', ')}.\n` : '') +
          (Array.isArray(avoidWords) && avoidWords.length ? `Avoid these words: ${avoidWords.join(', ')}.\n` : '') +
          `Return ONLY a numbered list. No extra text.\n\n` +
          `Content details:\n${compositePrompt}`
      );
      text = result?.response?.text?.() || '';
    } else if (env.AI_PROVIDER === 'claude') {
      const msg = await claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        temperature: 0.8,
        system:
          'You generate catchy, SEO-friendly blog post titles. Return ONLY a numbered list (1., 2., ...), no extra commentary; keep each title under the requested character limit; avoid quote marks around titles; avoid duplicates; be specific and benefit-oriented.',
        messages: [
          {
            role: 'user',
            content:
              `Create ${count} distinct blog titles based on the details below.\n` +
              `Keep each title under ${maxLength} characters.\n` +
              (Array.isArray(keywords) && keywords.length ? `Prefer including these keywords where natural: ${keywords.join(', ')}.\n` : '') +
              (Array.isArray(avoidWords) && avoidWords.length ? `Avoid these words: ${avoidWords.join(', ')}.\n` : '') +
              `Content details:\n${compositePrompt}`,
          },
        ],
      });
      const parts = Array.isArray(msg?.content) ? msg.content : [];
      text = parts.map((p) => p?.text || '').join('\n').trim();
    }

    let titles = text
      .split('\n')
      .map((l) => l.replace(/^\d+\.?\s*/, '').trim())
      .filter(Boolean);

    // Normalize: enforce max length, dedupe, and strip quotes
    titles = Array.from(
      new Set(
        titles
          .map((t) => t.replace(/^['"“”‘’\-\s]+|['"“”‘’\s]+$/g, ''))
          .map((t) => (t.length > maxLength ? t.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '…' : t))
      )
    );

    if (titles.length < 2) {
      return sendError(res, 502, 'AI provider returned insufficient results. Try refining the topic/explanation and try again.');
    }

    return sendSuccess(res, { titles });
  } catch (err) {
    return sendError(res, 500, 'Failed to generate titles', err.message);
  }
};

export const generateSummary = async (req, res) => {
  try {
    if (!ensureKey(res)) return;
    const { content, maxWords = 120 } = req.body || {};
    if (!content) return sendError(res, 400, 'content is required');

    let summary = '';
    if (env.AI_PROVIDER === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Summarize the content in plain English, focusing on key points. Keep it under the requested word limit.' },
          { role: 'user', content: `Max words: ${maxWords}\n\nContent:\n${content}` },
        ],
        temperature: 0.3,
      });
      summary = completion.choices?.[0]?.message?.content || '';
    } else if (env.AI_PROVIDER === 'gemini') {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Summarize the following content in under ${maxWords} words, focusing on key points.\n\n${content}`
      );
      summary = result?.response?.text?.() || '';
    } else if (env.AI_PROVIDER === 'claude') {
      const msg = await claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 400,
        temperature: 0.3,
        system: 'Summarize the content in plain English, focusing on key points. Keep it under the requested word limit.',
        messages: [
          { role: 'user', content: `Max words: ${maxWords}\n\nContent:\n${content}` },
        ],
      });
      const parts = Array.isArray(msg?.content) ? msg.content : [];
      summary = parts.map((p) => p?.text || '').join('\n').trim();
    }
    return sendSuccess(res, { summary });
  } catch (err) {
    return sendError(res, 500, 'Failed to generate summary', err.message);
  }
};

export const generateKeywords = async (req, res) => {
  try {
    if (!ensureKey(res)) return;
    const { content, count = 12 } = req.body || {};
    if (!content) return sendError(res, 400, 'content is required');

    let text = '';
    if (env.AI_PROVIDER === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Extract SEO keywords and keyphrases from the content. Return as a JSON array of strings only.' },
          { role: 'user', content: `Return ${Math.min(Math.max(count, 3), 25)} keywords for the following content:\n\n${content}` },
        ],
        temperature: 0.4,
      });
      text = completion.choices?.[0]?.message?.content || '[]';
    } else if (env.AI_PROVIDER === 'gemini') {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Extract ${Math.min(Math.max(count, 3), 25)} SEO keywords and keyphrases from the content. Return as a JSON array of strings only.\n\n${content}`
      );
      text = result?.response?.text?.() || '[]';
    } else if (env.AI_PROVIDER === 'claude') {
      const msg = await claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 400,
        temperature: 0.4,
        system: 'Extract SEO keywords and keyphrases from the content. Return as a JSON array of strings only.',
        messages: [
          { role: 'user', content: `Return ${Math.min(Math.max(count, 3), 25)} keywords for the following content:\n\n${content}` },
        ],
      });
      const parts = Array.isArray(msg?.content) ? msg.content : [];
      text = parts.map((p) => p?.text || '').join('\n').trim() || '[]';
    }

    let keywords = [];
    try {
      keywords = JSON.parse(text);
    } catch {
      keywords = text
        .split(/[\n,]/)
        .map((s) => s.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean);
    }
    return sendSuccess(res, { keywords });
  } catch (err) {
    return sendError(res, 500, 'Failed to generate keywords', err.message);
  }
};

export const generateOutline = async (req, res) => {
  try {
    if (!ensureKey(res)) return;
    const { prompt } = req.body || {};
    if (!prompt) return sendError(res, 400, 'prompt is required');

    let text = '';
    if (env.AI_PROVIDER === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Create a reasonable blog outline with H2/H3 structure. Return as a JSON array of section titles.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
      });
      text = completion.choices?.[0]?.message?.content || '[]';
    } else if (env.AI_PROVIDER === 'gemini') {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        'Create a reasonable blog outline with H2/H3 structure for the following prompt. Return as a JSON array of section titles.\n\n' + prompt
      );
      text = result?.response?.text?.() || '[]';
    } else if (env.AI_PROVIDER === 'claude') {
      const msg = await claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        temperature: 0.5,
        system: 'Create a reasonable blog outline with H2/H3 structure. Return as a JSON array of section titles.',
        messages: [
          { role: 'user', content: prompt },
        ],
      });
      const parts = Array.isArray(msg?.content) ? msg.content : [];
      text = parts.map((p) => p?.text || '').join('\n').trim() || '[]';
    }

    let outline = [];
    try {
      outline = JSON.parse(text);
    } catch {
      outline = text
        .split('\n')
        .map((l) => l.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean);
    }
    return sendSuccess(res, { outline });
  } catch (err) {
    return sendError(res, 500, 'Failed to generate outline', err.message);
  }
};
