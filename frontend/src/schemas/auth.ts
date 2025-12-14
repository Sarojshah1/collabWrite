import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  bio: z.string().optional().nullable(),
  avatar: z
    .string()
    .optional()
    .nullable(),
});

export type AuthUserSchema = typeof authUserSchema;
export type AuthUserFromSchema = z.infer<typeof authUserSchema>;
