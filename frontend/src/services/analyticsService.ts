import http from "@/lib/http";

type ApiSuccess<T> = { success: true } & T;

export interface ChartDataPoint {
  name: string;
  users: number;
  blogs: number;
}

export interface AnalyticsResponse {
  stats: {
    totalUsers: number;
    totalBlogs: number;
  };
  chartData: ChartDataPoint[];
}

export const analyticsService = {
  async getAnalytics(): Promise<AnalyticsResponse> {
    const { data } = await http.get<ApiSuccess<AnalyticsResponse>>("/admin/analytics");
    return data;
  },
};
