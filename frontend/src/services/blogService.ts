import http from "@/lib/http";
import { blogSchema, blogListResponseSchema, blogResponseSchema } from "@/schemas/blog";
import { z } from "zod";

export type BlogStatus = "draft" | "published";

export type BlogAuthor = z.infer<typeof blogSchema>["author"] extends infer A
  ? A extends { _id: string; name: string; avatar?: string | null }
    ? { _id: string; name: string; avatar?: string }
    : { _id: string; name: string; avatar?: string }
  : { _id: string; name: string; avatar?: string };

export type Blog = z.infer<typeof blogSchema>;

type ApiSuccess<T> = { success: true } & T;

function pagesToHtml(htmlPages: string[]) {
  return htmlPages.join('<div style="page-break-after:always"></div>');
}

// Minimal HTML -> Quill-like Delta converter. Not perfect but acceptable for storing a text snapshot.
// It converts block elements into lines and preserves basic bold/italic markers via attributes when possible.
type DeltaOp = { insert: string | { image: string }; attributes?: Record<string, any> };
export type QuillDelta = { ops: DeltaOp[] };

function htmlFragmentToTextLines(html: string): string[] {
  try {
    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      // Replace <br> with \n to keep line breaks, then extract text
      div.querySelectorAll('br').forEach((br) => (br.outerHTML = '\n'));
      // Convert li to lines
      div.querySelectorAll('li').forEach((li) => {
        li.outerHTML = `* ${li.textContent || ''}\n`;
      });
      const text = div.textContent || '';
      return text.split(/\n+/).map((s) => s.trimEnd());
    }
  } catch {}
  // SSR or failure: fallback by stripping tags
  const stripped = html.replace(/<br\s*\/>/gi, '\n').replace(/<[^>]+>/g, '');
  return stripped.split(/\n+/).map((s) => s.trimEnd());
}

function pagesToDelta(htmlPages: string[]): QuillDelta {
  const ops: DeltaOp[] = [];
  for (const html of htmlPages) {
    const lines = htmlFragmentToTextLines(html);
    for (const line of lines) {
      if (line.length === 0) {
        ops.push({ insert: '\n' });
      } else {
        ops.push({ insert: line });
        ops.push({ insert: '\n' });
      }
    }
    // Page break hint (could be custom blot in future). Use two newlines.
    ops.push({ insert: '\n' });
  }
  return { ops };
}

export async function createBlog(params: { title: string; htmlPages: string[]; status: BlogStatus }) {
  const payload = {
    title: params.title,
    contentHTML: pagesToHtml(params.htmlPages),
    contentDelta: pagesToDelta(params.htmlPages),
    status: params.status,
  };
  const { data } = await http.post<ApiSuccess<{ blog: Blog }>>("/blog", payload);
  const parsed = blogResponseSchema.parse({ blog: data.blog });
  const blog = parsed.blog;
  return { id: blog._id, blog };
}

export async function listBlogs(params?: { q?: string; tag?: string; author?: string; status?: BlogStatus; sort?: 'newest'|'mostViewed'|'trending' }) {
  const { data } = await http.get<ApiSuccess<{ blogs: Blog[] }>>('/blog', { params });
  const parsed = blogListResponseSchema.parse({ blogs: data.blogs });
  return parsed.blogs;
}

export async function getBlog(id: string) {
  const { data } = await http.get<ApiSuccess<{ blog: Blog }>>(`/blog/${id}`);
  const parsed = blogResponseSchema.parse({ blog: data.blog });
  return parsed.blog;
}

export async function updateBlog(params: { id: string; title?: string; htmlPages?: string[]; status?: BlogStatus }) {
  const body: any = {};
  if (typeof params.title === "string") body.title = params.title;
  if (Array.isArray(params.htmlPages)) {
    body.contentHTML = pagesToHtml(params.htmlPages);
    body.contentDelta = pagesToDelta(params.htmlPages);
  }
  if (typeof params.status === "string") body.status = params.status;
  const { data } = await http.put<ApiSuccess<{ blog: Blog }>>(`/blog/${params.id}`, body);
  const parsed = blogResponseSchema.parse({ blog: data.blog });
  const blog = parsed.blog;
  return { id: blog._id, blog };
}
