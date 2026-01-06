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

  async getAnalytics(days: number = 30): Promise<AdminAnalyticsResponse> {
      const { data } = await http.get<ApiSuccess<AdminAnalyticsResponse>>("/admin/analytics", { params: { days } });
      return data;
  },

  async getTrending(days: number = 14): Promise<AdminTrendingResponse> {
      const { data } = await http.get<ApiSuccess<AdminTrendingResponse>>("/admin/trending", { params: { days } });
      return data;
  }
};

export interface AdminAnalyticsResponse {
    mostActiveAuthors: Array<{ _id: string; name: string; email: string; blogs: number }>;
    mostPopularBlogs: Array<{ _id: string; title: string; views: number; likes: number; author: { _id: string; name: string } }>;
    topTags: Array<{ _id: string; count: number }>;
    topCategories: Array<{ _id: string; count: number }>;
    dau: Array<{ day: string; dau: number; interactions: number; avgDwellMs: number }>;
    trends: Array<{ _id: { day: string; type: string }; count: number }>;
    realTimeActivity: Array<any>;
}

export interface AdminTrendingResponse {
    tags: Array<{ _id: string; score: number; count: number }>;
    categories: Array<{ _id: string; count: number }>;
}
