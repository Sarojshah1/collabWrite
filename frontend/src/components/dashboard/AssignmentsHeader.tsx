"use client";

import React from "react";

type Props = {
  onCreateClick: () => void;
};

export default function AssignmentsHeader({ onCreateClick }: Props) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Your assignments</h1>
        <p className="mt-1 text-sm text-zinc-600">See what you and your collaborators are working on.</p>
      </div>
      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
      >
        Create assignment
      </button>
    </header>
  );
}
