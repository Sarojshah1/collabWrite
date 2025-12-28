import http from "@/lib/http";

export type TemplateType = "blog" | "tutorial" | "listicle" | "book_chapter" | "book_index";

export type TemplateListItem = {
  _id: string;
  name: string;
  slug: string;
  type: TemplateType;
  description?: string;
  tags?: string[];
  updatedAt?: string;
};

export type Template = TemplateListItem & {
  body: string;
  createdAt?: string;
};

type ApiSuccess<T> = { success: true } & T;

export async function listTemplates() {
  const { data } = await http.get<ApiSuccess<{ templates: TemplateListItem[] }>>("/templates");
  return data.templates;
}

export async function getTemplate(slug: string) {
  const { data } = await http.get<ApiSuccess<{ template: Template }>>(`/templates/${slug}`);
  return data.template;
}

export async function instantiateTemplate(params: {
  slug: string;
  title: string;
  category?: string;
  tags?: string[];
  status?: "draft" | "published";
  summary?: string;
  variables?: Record<string, string>;
}) {
  const { slug, ...body } = params;
  const { data } = await http.post<ApiSuccess<{ blog: { _id: string } }>>(`/templates/${slug}/instantiate`, body);
  return data.blog;
}
