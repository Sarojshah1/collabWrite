import http from "@/lib/http";

export interface AIGeneratePayload {
  topic?: string;
  prompt?: string;
}

export async function generateBlog(payload: AIGeneratePayload) {
  const { data } = await http.post("/ai/generate-blog", payload);
  return data;
}

export async function generateTitle(payload: AIGeneratePayload) {
  const { data } = await http.post("/ai/generate-title", payload);
  return data;
}

export async function generateSummary(payload: AIGeneratePayload) {
  const { data } = await http.post("/ai/generate-summary", payload);
  return data;
}

export async function generateKeywords(payload: AIGeneratePayload) {
  const { data } = await http.post("/ai/keywords", payload);
  return data;
}

export async function generateOutline(payload: AIGeneratePayload) {
  const { data } = await http.post("/ai/generate-outline", payload);
  return data;
}

export async function generateDraft(payload: AIGeneratePayload) {
  const { data } = await http.post("/ai/generate-draft", payload);
  return data;
}
