"use client";

import React, { useState } from "react";
import { createAssignment } from "@/services/assignmentService";
import { userService } from "@/services/userService";
import type { AuthUser } from "@/services/authService";

type LightweightUser = Pick<AuthUser, "id" | "name" | "email" | "avatar">;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => Promise<void> | void;
};

export default function CreateAssignmentModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");

  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<LightweightUser[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<LightweightUser[]>([]);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (!open) return null;

  const toggleMember = (user: LightweightUser) => {
    setSelectedMembers((prev) => {
      const exists = prev.some((m) => m.id === user.id);
      if (exists) return prev.filter((m) => m.id !== user.id);
      return [...prev, user];
    });
  };

  const handleSearchMembers = async (query: string) => {
    setMemberQuery(query);
    if (!query.trim()) {
      setMemberResults([]);
      return;
    }
    try {
      setMembersLoading(true);
      const users = await userService.searchUsers(query);
      setMemberResults(users);
    } finally {
      setMembersLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setMemberQuery("");
    setMemberResults([]);
    setSelectedMembers([]);
    setCreateError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setCreateError("Title is required");
      return;
    }
    try {
      setCreating(true);
      setCreateError(null);
      const memberIds = selectedMembers.map((m) => m.id);
      await createAssignment({
        title: title.trim(),
        description: description.trim() || undefined,
        memberIds: memberIds.length ? memberIds : undefined,
        dueDate: dueDate || undefined,
      });
      resetForm();
      if (onCreated) {
        await onCreated();
      }
      onClose();
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/60 px-4">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950/95 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-50">Create assignment</h2>
            <p className="mt-1 text-[11px] text-zinc-400">Name the task, set a due date, and invite collaborators.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800/70 text-[11px] text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form className="grid gap-5 px-5 py-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" onSubmit={handleSubmit}>
          <div className="space-y-4 border-b border-zinc-800 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">Title</label>
              <input
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-50 shadow-sm outline-none ring-1 ring-transparent transition focus:border-zinc-400 focus:ring-zinc-500/60 placeholder:text-zinc-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Content review for Week 3"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">Description</label>
              <textarea
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-50 shadow-sm outline-none ring-1 ring-transparent transition focus:border-zinc-400 focus:ring-zinc-500/60 placeholder:text-zinc-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context, goals, or links for your teammates."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">Due date</label>
              <input
                type="date"
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-50 shadow-sm outline-none ring-1 ring-transparent transition focus:border-zinc-400 focus:ring-zinc-500/60"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 pt-1 md:pl-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">Members</label>
                {selectedMembers.length > 0 && (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                    {selectedMembers.length} added
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <input
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-50 shadow-sm outline-none ring-1 ring-transparent transition focus:border-zinc-400 focus:ring-zinc-500/60 placeholder:text-zinc-500"
                  value={memberQuery}
                  onChange={(e) => handleSearchMembers(e.target.value)}
                  placeholder="Search by name or email"
                />
                {membersLoading && (
                  <p className="text-[11px] text-zinc-400">Searching…</p>
                )}
                {!membersLoading && memberResults.length > 0 && (
                  <ul className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-xs">
                    {memberResults.map((u) => {
                      const selected = selectedMembers.some((m) => m.id === u.id);
                      return (
                        <li
                          key={u.id}
                          className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1 hover:bg-zinc-800/80"
                          onClick={() => toggleMember(u)}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-medium text-zinc-50">{u.name}</p>
                            <p className="truncate text-[10px] text-zinc-400">{u.email}</p>
                          </div>
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] " +
                              (selected
                                ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/40"
                                : "bg-zinc-800 text-zinc-300")
                            }
                          >
                            {selected ? "Added" : "Add"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {selectedMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMember(m)}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-100 ring-1 ring-zinc-600"
                      >
                        <span>{m.name}</span>
                        <span>×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-800 pt-3">
              {createError && <p className="text-[11px] text-rose-400">{createError}</p>}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-zinc-700/80 bg-zinc-900/60 px-4 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-white disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create assignment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
