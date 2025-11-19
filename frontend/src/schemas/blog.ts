import { z } from "zod";

export const blogAuthorSchema = z.object({
  _id: z.string(),
  name: z.string(),
  avatar: z.string().url().optional().nullable(),
});

export const blogSchema = z.object({
  _id: z.string(),
  title: z.string(),
  contentHTML: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]),
  version: z.number().int().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  author: z.union([blogAuthorSchema, z.string()]).optional().nullable(),
});

export const blogListResponseSchema = z.object({
  blogs: z.array(blogSchema),
});

export const blogResponseSchema = z.object({
  blog: blogSchema,
});

export type BlogFromSchema = z.infer<typeof blogSchema>;
