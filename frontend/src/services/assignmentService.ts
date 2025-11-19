import http from "@/lib/http";

export type Assignment = {
  _id: string;
  title: string;
  description?: string;
  blog: { _id: string; title: string } | string;
  owner: string;
  members: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

export async function listAssignments(): Promise<Assignment[]> {
  const { data } = await http.get<{ success: boolean; assignments: Assignment[] }>("/assignments");
  return data.assignments ?? [];
}

export async function createAssignment(payload: {
  title: string;
  description?: string;
  memberIds?: string[];
  dueDate?: string;
}): Promise<Assignment> {
  const { data } = await http.post<{ success: boolean; assignment: Assignment }>("/assignments", payload);
  return data.assignment;
}
