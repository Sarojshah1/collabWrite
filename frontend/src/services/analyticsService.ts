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

export interface AnalyticsSummaryItem {
  type: string;
  count: number;
}

export interface AuthorDayPoint {
  date: string;
  views: number;
  likes: number;
}

export const analyticsService = {
  async getAnalytics(): Promise<AnalyticsResponse> {
    const { data } = await http.get<ApiSuccess<AnalyticsResponse>>("/admin/analytics");
    return data;
  },

  async getAuthorAnalyticsSummary(days: number): Promise<AnalyticsSummaryItem[]> {
    // Note: Backend currently aggregates lifetime stats, ensuring strict type safety
    const { data } = await http.get<ApiSuccess<{ stats: { totalViews: number; totalLikes: number; totalBlogs: number } }>>("/analytics/author-summary");
    return [
      { type: "view", count: data.stats.totalViews },
      { type: "like", count: data.stats.totalLikes },
      { type: "post", count: data.stats.totalBlogs }, // mapped 'totalBlogs' to 'post' if needed, or just standard items
      { type: "comment", count: 0 }, // Backend doesn't return comments yet
      { type: "bookmark", count: 0 }, // Backend doesn't return bookmarks yet
    ];
  },

  async getAuthorTimeline(days: number): Promise<AuthorDayPoint[]> {
    // Backend returns blog creation growth. Mapping to safe defaults for now to prevent crash.
    const { data } = await http.get<ApiSuccess<{ chartData: { name: string; blogs: number }[] }>>("/analytics/author-timeline");
    
    // transform backend data (monthly) to frontend expected (daily/points) format
    // Since backend data lacks views/likes history, we render flat line or mapped blog count to avoid crash
    return data.chartData.map(d => ({
      date: d.name,
      views: 0, 
      likes: 0
    }));
  }
};

export const getAuthorAnalyticsSummary = analyticsService.getAuthorAnalyticsSummary;
export const getAuthorTimeline = analyticsService.getAuthorTimeline;
