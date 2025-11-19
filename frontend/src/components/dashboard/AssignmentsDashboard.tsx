"use client";

import { useEffect, useState } from "react";
import { listAssignments, type Assignment } from "@/services/assignmentService";
import { userService } from "@/services/userService";
import type { AuthUser } from "@/services/authService";
import AssignmentsHeader from "@/components/dashboard/AssignmentsHeader";
import WorkingAssignmentsCard from "@/components/dashboard/WorkingAssignmentsCard";
import AllAssignmentsCard from "@/components/dashboard/AllAssignmentsCard";
import CreateAssignmentModal from "@/components/dashboard/CreateAssignmentModal";

export default function AssignmentsDashboard() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  const [me, setMe] = useState<AuthUser | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setAssignmentsLoading(true);
        setAssignmentsError(null);
        const data = await listAssignments();
        if (mounted) setAssignments(data);
      } catch (e: any) {
        if (mounted) setAssignmentsError(e?.message || "Failed to load assignments");
      } finally {
        if (mounted) setAssignmentsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setMeLoading(true);
        const u = await userService.me();
        if (mounted) setMe(u);
      } catch {
        if (mounted) setMe(null);
      } finally {
        if (mounted) setMeLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      const data = await listAssignments();
      setAssignments(data);
    } catch (e: any) {
      setAssignmentsError(e?.message || "Failed to load assignments");
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const totalAssignments = assignments?.length ?? 0;
  const now = new Date();
  const upcomingAssignments = assignments?.filter((a) => {
    if (!a.dueDate) return false;
    const d = new Date(a.dueDate);
    if (Number.isNaN(d.getTime())) return false;
    const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length ?? 0;
  const overdueAssignments = assignments?.filter((a) => {
    if (!a.dueDate) return false;
    const d = new Date(a.dueDate);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() < now.getTime();
  }).length ?? 0;

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <section className="min-w-0">
        <AssignmentsHeader onCreateClick={() => setCreateOpen(true)} />

        {/* KPI strip */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-4 py-3 text-white shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-300">Total assignments</p>
            <p className="mt-1 text-2xl font-semibold">{totalAssignments}</p>
            <p className="mt-1 text-xs text-zinc-400">All active and past tasks you&apos;re tracking.</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">Due in next 7 days</p>
            <p className="mt-1 text-2xl font-semibold">{upcomingAssignments}</p>
            <p className="mt-1 text-xs text-amber-800/80">Great place to start today.</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-rose-900 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-rose-700">Overdue</p>
            <p className="mt-1 text-2xl font-semibold">{overdueAssignments}</p>
            <p className="mt-1 text-xs text-rose-800/80">Assignments past their due date.</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <WorkingAssignmentsCard
            assignments={assignments}
            loading={assignmentsLoading}
            error={assignmentsError}
          />

          <AllAssignmentsCard
            assignments={assignments}
            loading={assignmentsLoading}
            error={assignmentsError}
          />
        </div>
        <CreateAssignmentModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={refreshAssignments}
        />
      </section>
    </section>
  );
}
