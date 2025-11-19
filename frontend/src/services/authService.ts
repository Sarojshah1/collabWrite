import http from "@/lib/http";
import { setToken, clearToken } from "@/lib/api";
import { authUserSchema } from "@/schemas/auth";
import { z } from "zod";

export type AuthUser = z.infer<typeof authUserSchema>;

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

type ApiSuccess<T> = { success: true } & T;

export const authService = {
  async register(payload: { name: string; email: string; password: string; bio?: string; avatar?: File | null }): Promise<AuthResponse> {
    const fd = new FormData();
    fd.append("name", payload.name);
    fd.append("email", payload.email);
    fd.append("password", payload.password);
    if (payload.bio) fd.append("bio", payload.bio);
    if (payload.avatar) fd.append("avatar", payload.avatar);

    // Backend returns { success: true, token, user }
    const { data } = await http.post<ApiSuccess<AuthResponse>>("/auth/register", fd);
    const parsedUser = authUserSchema.parse(data.user);
    const result: AuthResponse = { token: data.token, user: parsedUser };
    setToken(result.token);
    if (typeof document !== "undefined") {
      // 30 days
      document.cookie = "cw_auth=1; path=/; max-age=2592000";
    }
    return result;
  },
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    // Backend returns { success: true, token, user }
    const { data } = await http.post<ApiSuccess<AuthResponse>>("/auth/login", payload);
    const parsedUser = authUserSchema.parse(data.user);
    const result: AuthResponse = { token: data.token, user: parsedUser };
    setToken(result.token);
    if (typeof document !== "undefined") {
      // 30 days
      document.cookie = "cw_auth=1; path=/; max-age=2592000";
    }
    return result;
  },
  async logout() {
    clearToken();
    if (typeof document !== "undefined") {
      document.cookie = "cw_auth=; path=/; max-age=0";
    }
  },
};
