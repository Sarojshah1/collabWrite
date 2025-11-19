"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Simple full‑featured rich text editor using contentEditable and document.execCommand
// Features: headings, font family/size, bold/italic/underline/strike, colors, alignment,
// lists, indent/outdent, quote, code, link, image, undo/redo, autosave, paste image support.

const FONT_SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "4" },
  { label: "XL", value: "5" },
  { label: "2XL", value: "6" },
];

const FONT_FAMILIES = [
  "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  "Georgia, Cambria, 'Times New Roman', Times, serif",
  "'Helvetica Neue', Helvetica, Arial, sans-serif",
  "'Courier New', Courier, monospace",
];

const HEADINGS = [
  { label: "Paragraph", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
  { label: "Heading 4", value: "H4" },
];

const DRAFT_KEY = "collabwrite_draft_v1";

export default function RichEditor() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("<p><br/></p>");
  const [isDirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showRestore, setShowRestore] = useState(false);

  // Restore draft if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { title: string; html: string; ts: number };
        // Show non-blocking restore bar
        setShowRestore(true);
        // Pre-fill title to provide context
        if (parsed.title) setTitle(parsed.title);
      }
    } catch {}
  }, []);

  const saveDraft = useMemo(
    () =>
      debounce(() => {
        try {
          const payload = { title, html: editorRef.current?.innerHTML || html, ts: Date.now() };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
          setSavedAt(Date.now());
          setDirty(false);
        } catch {}
      }, 800),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, html]
  );

  useEffect(() => {
    if (!isDirty) return;
    saveDraft();
  }, [isDirty, saveDraft]);

  // Handle input changes
  const handleInput = () => {
    setHtml(editorRef.current?.innerHTML || "");
    setDirty(true);
  };

  // Toolbar actions
  const exec = (cmd: string, value?: string) => {
    if (typeof document !== "undefined") {
      document.execCommand(cmd, false, value);
      editorRef.current?.focus();
      setDirty(true);
    }
  };

  const applyHeading = (tag: string) => exec("formatBlock", tag);
  const applyFontSize = (size: string) => exec("fontSize", size);
  const applyFont = (family: string) => exec("fontName", family);
  const applyColor = (color: string) => exec("foreColor", color);
  const applyBg = (color: string) => exec("hiliteColor", color);

  const createLink = () => {
    const url = prompt("Enter URL");
    if (!url) return;
    exec("createLink", url);
  };

  const insertImage = (dataUrl: string) => exec("insertImage", dataUrl);

  const onPickImage = () => fileInputRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      insertImage(dataUrl);
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  };

  // Paste image support
  const onPaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => insertImage(reader.result as string);
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowRestore(false);
    setSavedAt(null);
  };

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return setShowRestore(false);
      const parsed = JSON.parse(saved) as { title: string; html: string; ts: number };
      setTitle(parsed.title || "");
      setHtml(parsed.html || "<p><br/></p>");
      // set content into editor
      if (editorRef.current) editorRef.current.innerHTML = parsed.html || "<p><br/></p>";
    } catch {}
    setShowRestore(false);
  };

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML.trim() === "") {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  return (
    <div className="w-full">
      {showRestore && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
          <div className="text-sm">A previous draft was found. Restore it?</div>
          <div className="flex items-center gap-2">
            <button onClick={restoreDraft} className="px-2 py-1 rounded-md bg-amber-600 text-white text-sm">Restore</button>
            <button onClick={clearDraft} className="px-2 py-1 rounded-md border border-amber-600 text-amber-700 text-sm">Dismiss</button>
          </div>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 bg-white p-2 shadow-sm">
        {/* Headings */}
        <select
          onChange={(e) => applyHeading(e.target.value)}
          className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm"
          aria-label="Heading level"
        >
          {HEADINGS.map((h) => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>

        {/* Font family */}
        <select
          onChange={(e) => applyFont(e.target.value)}
          className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm min-w-40"
          aria-label="Font family"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>{f.split(",")[0]}</option>
          ))}
        </select>

        {/* Font size */}
        <select
          onChange={(e) => applyFontSize(e.target.value)}
          className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm"
          aria-label="Font size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Inline styles */}
        <ToolbarButton onClick={() => exec("bold")} label="B" title="Bold" className="font-bold" />
        <ToolbarButton onClick={() => exec("italic")} label="I" title="Italic" className="italic" />
        <ToolbarButton onClick={() => exec("underline")} label="U" title="Underline" className="underline" />
        <ToolbarButton onClick={() => exec("strikeThrough")} label="S" title="Strikethrough" className="line-through" />

        {/* Lists */}
        <ToolbarButton onClick={() => exec("insertUnorderedList")} label="• List" title="Bulleted list" />
        <ToolbarButton onClick={() => exec("insertOrderedList")} label="1. List" title="Numbered list" />

        {/* Indent */}
        <ToolbarButton onClick={() => exec("outdent")} label="Outdent" title="Outdent" />
        <ToolbarButton onClick={() => exec("indent")} label="Indent" title="Indent" />

        {/* Align */}
        <ToolbarButton onClick={() => exec("justifyLeft")} label="Left" title="Align left" />
        <ToolbarButton onClick={() => exec("justifyCenter")} label="Center" title="Align center" />
        <ToolbarButton onClick={() => exec("justifyRight")} label="Right" title="Align right" />
        <ToolbarButton onClick={() => exec("justifyFull")} label="Justify" title="Justify" />

        {/* Quote & Code */}
        <ToolbarButton onClick={() => applyHeading("BLOCKQUOTE")} label="> Quote" title="Blockquote" />
        <ToolbarButton onClick={() => exec("formatBlock", "PRE")} label="Code" title="Code block" />

        {/* Colors */}
        <label className="inline-flex items-center gap-1 text-xs text-zinc-500">
          Text
          <input type="color" onChange={(e) => applyColor(e.target.value)} />
        </label>
        <label className="inline-flex items-center gap-1 text-xs text-zinc-500">
          Highlight
          <input type="color" onChange={(e) => applyBg(e.target.value)} />
        </label>

        {/* Link & Image */}
        <ToolbarButton onClick={createLink} label="Link" title="Insert link" />
        <ToolbarButton onClick={onPickImage} label="Image" title="Insert image" />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

        {/* Undo/Redo */}
        <div className="ml-auto flex items-center gap-2">
          <ToolbarButton onClick={() => exec("undo")} label="Undo" title="Undo" />
          <ToolbarButton onClick={() => exec("redo")} label="Redo" title="Redo" />
        </div>
      </div>

      <div className="mb-3">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          placeholder="Untitled document"
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-lg outline-none focus:ring-2 focus:ring-zinc-300"
        />
      </div>

      <div
        ref={editorRef}
        onInput={handleInput}
        onPaste={onPaste}
        contentEditable
        suppressContentEditableWarning
        className="editor-content min-h-[50vh] w-full rounded-md border border-zinc-200 bg-white p-4 leading-7 text-[15px] text-zinc-900 shadow-sm focus:outline-none"
        style={{ wordBreak: "break-word" }}
      />

      <div className="mt-2 text-xs text-zinc-500">
        {isDirty ? "Saving…" : savedAt ? `Saved ${timeAgo(savedAt)}` : ""}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            // For now, saving just writes to localStorage and marks clean
            try {
              const payload = { title, html: editorRef.current?.innerHTML || html, ts: Date.now() };
              localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
              setSavedAt(Date.now());
              setDirty(false);
              alert("Draft saved locally.");
            } catch {}
          }}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-black"
        >
          Save Draft
        </button>
        <button
          onClick={() => {
            clearDraft();
            if (editorRef.current) editorRef.current.innerHTML = "<p><br/></p>";
            setTitle("");
            setHtml("<p><br/></p>");
          }}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, label, title, className }: { onClick: () => void; label: string; title?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm hover:bg-zinc-50 ${className ?? ""}`}
    >
      {label}
    </button>
  );
}

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
