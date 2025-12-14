import http from "@/lib/http";

export type AnalyticsSummaryItem = {
  type: string;
  count: number;
};

export async function getAnalyticsSummary(days: number = 30): Promise<AnalyticsSummaryItem[]> {
  const { data } = await http.get<{ success: boolean; data: { data: { _id: { type: string }; count: number }[] } }>(
    "/analytics/summary",
    { params: { days } }
  );
  const raw = data?.data?.data || [];
  return raw.map((item) => ({ type: item._id?.type || "unknown", count: item.count || 0 }));
}

export async function recordView(blogId: string) {
  await http.post("/analytics/record", { blogId, type: "view" });
}

export async function getAuthorAnalyticsSummary(days: number = 30): Promise<AnalyticsSummaryItem[]> {
  const { data } = await http.get<{ success: boolean; data: { data: { _id: { type: string }; count: number }[] } }>(
    "/analytics/author-summary"
  );
  const raw = data?.data || [];
  console.log(data)
  return raw.map((item) => ({ type: item._id?.type || "unknown", count: item.count || 0 }));
}

export async function recordLike(blogId: string) {
  await http.post("/analytics/record", { blogId, type: "like" });
}

export async function recordComment(blogId: string, text: string) {
  await http.post("/analytics/record", { blogId, type: "comment", meta: { text } });
}

export type AuthorDayPoint = {
  day: string;
  views: number;
  likes: number;
};

export async function getAuthorTimeline(days: number = 30): Promise<AuthorDayPoint[]> {
  const { data } = await http.get<{ success: boolean; data: { points: AuthorDayPoint[] } }>(
    "/analytics/author-timeline",
    { params: { days } }
  );
  return data?.data?.points || [];
}
