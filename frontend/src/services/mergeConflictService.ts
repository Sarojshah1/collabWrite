import http from "@/lib/http";

export type MergeConflict = {
  _id: string;
  blog: string;
  segmentId: string;
  versionA: { user: string; edit: string; text: string };
  versionB: { user: string; edit: string; text: string };
  mergedText?: string;
  rationale?: string[];
  status: "pending_ai" | "awaiting_approval" | "resolved" | "rejected";
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export async function listConflictsForBlog(blogId: string): Promise<MergeConflict[]> {
  const { data } = await http.get<{ success: boolean; conflicts: MergeConflict[] }>(
    `/merge-conflicts/blog/${blogId}`
  );
  return data.conflicts ?? [];
}

export async function resolveConflictWithAI(conflictId: string): Promise<MergeConflict> {
  const { data } = await http.post<{ success: boolean; conflict: MergeConflict }>(
    `/merge-conflicts/${conflictId}/resolve-ai`
  );
  return data.conflict;
}

export async function acceptMergedConflict(conflictId: string): Promise<MergeConflict> {
  const { data } = await http.post<{ success: boolean; conflict: MergeConflict }>(
    `/merge-conflicts/${conflictId}/accept`
  );
  return data.conflict;
}
