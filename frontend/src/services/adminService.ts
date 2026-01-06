import http from "@/lib/http";
import type { AuthUser } from "@/services/authService";

type ApiSuccess<T> = { success: true } & T;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminUserListResponse {
  users: AuthUser[];
  pagination: Pagination;
}

export const adminService = {
  async listUsers(params?: { page?: number; limit?: number }): Promise<AdminUserListResponse> {
    const { data } = await http.get<ApiSuccess<AdminUserListResponse>>("/admin/users", { params });
    return data;
  },

  async updateUserRole(userId: string, role: string): Promise<{ user: AuthUser }> {
    const { data } = await http.patch<ApiSuccess<{ user: AuthUser }>>(`/admin/users/${userId}/role`, { role });
    return data;
  },
};
