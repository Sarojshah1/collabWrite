"use client";

import { useEffect, useState } from "react";

type ToggleKey =
  | "darkPage"
  | "showCursors"
  | "aiHints"
  | "emailAlerts"
  | "commentNotifications"
  | "analyticsOptIn";

const STORAGE_KEY = "collabwrite_settings_ui_v1";

type ToggleState = Partial<Record<ToggleKey, boolean>>;

function loadToggles(): ToggleState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ToggleState) : {};
  } catch {
    return {};
  }
}

function saveToggles(values: ToggleState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {}
}

const LABELS: Record<ToggleKey, string> = {
  darkPage: "Use dark pages in the editor",
  showCursors: "Show collaborator cursors",
  aiHints: "Show inline AI suggestions",
  emailAlerts: "Assignment email alerts",
  commentNotifications: "Notify on new comments",
  analyticsOptIn: "Help improve analytics",
};

const DESCRIPTIONS: Record<ToggleKey, string> = {
  darkPage: "Start documents with a darker page background to reduce eye strain.",
  showCursors: "Display other editors' cursors and initials in real time.",
  aiHints: "Allow the editor to surface AI tips and merge suggestions while you write.",
  emailAlerts: "Receive updates when a collaborator assigns you new work.",
  commentNotifications: "Show in-app badges when someone comments on your document.",
  analyticsOptIn: "Anonymously aggregate usage to power better Reports & Analytics.",
};

export default function SettingsPage() {
  const [toggles, setToggles] = useState<ToggleState>({});

  useEffect(() => {
    setToggles(loadToggles());
  }, []);

  const handleToggle = (key: ToggleKey) => {
    setToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveToggles(next);
      return next;
    });
  };

  const toggleOrder: ToggleKey[] = [
    "darkPage",
    "showCursors",
    "aiHints",
    "emailAlerts",
    "commentNotifications",
    "analyticsOptIn",
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">Settings</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            Tune how CollabWrite looks and behaves for you. These preferences are stored only in this browser.
          </p>
        </div>
      </header>

      {/* Profile / account summary */}
      <article className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-900">Profile</p>
          <p className="mt-1 text-[11px] text-zinc-600">
            Manage your account details from the Profile tab. Settings here only affect this device.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white text-sm">
            U
          </span>
          <div className="hidden sm:block text-right">
            <p className="font-medium text-zinc-800">Your account</p>
            <p className="text-[11px] text-zinc-500">Open the Profile page to edit name or avatar.</p>
          </div>
        </div>
      </article>

      {/* Main settings grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Editor */}
        <article className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 mb-2">Editor</h2>
          <p className="mb-3 text-[11px] text-zinc-600">
            Control how the Docs editor looks by default on this device.
          </p>
          <div className="space-y-3">
            {toggleOrder.filter((k) => k === "darkPage").map((key) => (
              <ToggleRow
                key={key}
                label={LABELS[key]}
                description={DESCRIPTIONS[key]}
                active={!!toggles[key]}
                onClick={() => handleToggle(key)}
              />
            ))}
          </div>
        </article>

        {/* Collaboration & AI */}
        <article className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 mb-2">Collaboration & AI</h2>
          <p className="mb-3 text-[11px] text-zinc-600">
            Choose how much real‑time activity and AI assistance you want to see while collaborating.
          </p>
          <div className="space-y-3">
            {toggleOrder
              .filter((k) => k === "showCursors" || k === "aiHints")
              .map((key) => (
              <ToggleRow
                key={key}
                label={LABELS[key]}
                description={DESCRIPTIONS[key]}
                active={!!toggles[key]}
                onClick={() => handleToggle(key)}
              />
              ))}
          </div>
        </article>

        {/* Notifications & analytics */}
        <article className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 mb-2">Notifications & analytics</h2>
          <p className="mb-3 text-[11px] text-zinc-600">
            Control alerts and how your anonymous usage contributes to dashboard insights.
          </p>
          <div className="space-y-3">
            {toggleOrder
              .filter((k) => k === "emailAlerts" || k === "commentNotifications" || k === "analyticsOptIn")
              .map((key) => (
                <ToggleRow
                  key={key}
                  label={LABELS[key]}
                  description={DESCRIPTIONS[key]}
                  active={!!toggles[key]}
                  onClick={() => handleToggle(key)}
                />
              ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-zinc-900">{label}</p>
        <p className="mt-1 text-[11px] text-zinc-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex h-6 w-11 items-center rounded-full border px-0.5 text-[11px] transition-colors ${{
          true: "border-zinc-900 bg-zinc-900 text-white justify-end",
          false: "border-zinc-300 bg-zinc-100 text-zinc-600 justify-start",
        }[active ? "true" : "false"]}`}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}

