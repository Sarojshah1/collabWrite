import http from "@/lib/http";
import type { AuthUser } from "@/services/authService";
import { authUserSchema } from "@/schemas/auth";

type ApiSuccess<T> = { success: true } & T;

export const userService = {
  async me(): Promise<AuthUser> {
    const { data } = await http.get<ApiSuccess<{ user: AuthUser }>>("/auth/profile");
    const parsed = authUserSchema.parse(data.user);
    return parsed;
  },
  async updateProfile(payload: Partial<Pick<AuthUser, "name" | "bio" | "avatar">> & {
    currentPassword?: string;
    newPassword?: string;
  }): Promise<AuthUser> {
    const { data } = await http.put<ApiSuccess<{ user: AuthUser }>>("/auth/profile", payload);
    return data.user;
  },
  async searchUsers(query: string): Promise<Array<Pick<AuthUser, "id" | "name" | "email" | "avatar">>> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const { data } = await http.get<ApiSuccess<{ users: Array<{ _id: string; name: string; email: string; avatar?: string }> }>>(
      `/auth/users`,
      { params: { q: trimmed } }
    );
    return data.users.map((u) => ({ id: u._id, name: u.name, email: u.email, avatar: u.avatar || "" }));
  },
};
