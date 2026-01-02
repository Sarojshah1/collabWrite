import { z } from "zod";

export const blogAuthorSchema = z.object({
  _id: z.string(),
  name: z.string(),
  // REMOVED .url() - This allows empty strings, relative paths, or actual URLs
  // .nullish() is shorthand for .optional().nullable()
  avatar: z.string().nullish(), 
});

export const blogSchema = z.object({
  _id: z.string(),
  title: z.string(),
  contentHTML: z.string().nullish(),
  // Suggestion: If your component uses a cover image, add it here too
  coverImage: z.string().nullish(), 
  status: z.enum(["draft", "published"]),
  version: z.number().int().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  views: z.number().int().optional().nullable(),
  likes: z.array(z.any()).optional().nullable(),
  // Note: author can be a string (ID) or the populated object
  author: z.union([blogAuthorSchema, z.string()]).nullish(),
  tags: z.array(z.string()).optional(),
  collaborators: z.array(z.string()).optional(),
  bookmarks: z.array(z.string()).optional(),
});

export const blogListResponseSchema = z.object({
  blogs: z.array(blogSchema),
});

export const blogResponseSchema = z.object({
  blog: blogSchema,
});

export type BlogFromSchema = z.infer<typeof blogSchema>;