"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { generateBlog, generateSummary, generateTitle } from "@/services/aiService";
import { createBlog, updateBlog, getBlog } from "@/services/blogService";
import { connectCollab, getUserIdFromToken } from "@/services/realtimeService";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiType,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiList,
  FiLink,
  FiX,
  FiImage,
  FiRotateCcw,
  FiRotateCw,
  FiMinus,
  FiPlus,
  FiSun,
  FiMoon,
  FiDroplet,
  FiSlash,
  FiFilePlus,
  FiSave,
  FiSend,
  FiDownload,
  FiGrid,
  FiChevronDown,
  FiStar,
  FiMessageCircle,
  FiLock,
  FiZap,
} from "react-icons/fi";

const FONT_SIZES = [
  { label: "10", value: "2" },
  { label: "12", value: "3" },
  { label: "14", value: "4" },
  { label: "18", value: "5" },
  { label: "24", value: "6" },
];

const FONT_FAMILIES = [
  "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  "'Times New Roman', Times, serif",
  "Georgia, Cambria, 'Times New Roman', Times, serif",
  "Garamond, serif",
  "'Merriweather', serif",
  "'Helvetica Neue', Helvetica, Arial, sans-serif",
  "'Courier New', Courier, monospace",
];

const HEADINGS = [
  { label: "Normal text", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
];

const DRAFT_KEY = "collabwrite_docs_draft_v1";

type PageSize = "A4" | "Letter";
type Orientation = "portrait" | "landscape";

type DocsEditorProps = {
  initialDocId?: string;
};

export default function DocsEditor({ initialDocId }: DocsEditorProps) {
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [docId, setDocId] = useState<string | null>(null); // blog id from backend
  const [zoom, setZoom] = useState(1);
  const [isDirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [darkPage, setDarkPage] = useState(false);
  const [pages, setPages] = useState<number>(1);
  const [presence, setPresence] = useState<any>(null);
  const collabRef = useRef<null | Awaited<ReturnType<typeof connectCollab>>>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [showInsert, setShowInsert] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState<"write"|"rewrite"|"continue"|"summarize">("write");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [titleChoices, setTitleChoices] = useState<string[] | null>(null);
  const [aiSelection, setAiSelection] = useState<string>("");
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [gridHoverRows, setGridHoverRows] = useState(1);
  const [gridHoverCols, setGridHoverCols] = useState(1);
  const savedRangeRef = useRef<Range | null>(null);

  const updateSavedRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      const txt = sel.toString();
      if (txt) setAiSelection(txt);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      return true;
    }
    // fallback: focus first page end
    const first = pageContainerRef.current?.querySelector<HTMLDivElement>(".docs-page");
    if (first) {
      first.focus();
      const range = document.createRange();
      range.selectNodeContents(first);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      savedRangeRef.current = range.cloneRange();
      return true;
    }
    return false;
  };

  // Restore draft or load existing blog when initialDocId is provided
  useEffect(() => {
    (async () => {
      try {
        if (initialDocId) {
          const blog = await getBlog(initialDocId);
          setDocId(blog._id);
          setTitle(blog.title || "");

          let html = (blog.contentHTML || "").trim();
          if (!html) {
            html = defaultHtml();
          } else {
            // If contentHTML is actually markdown (no tags but has markdown syntax), convert it
            const looksLikeHtml = /<\w+/.test(html);
            const looksLikeMarkdown = /(^|\n)\s*#{1,6}\s+/.test(html) || /\*\*(.+?)\*\*/.test(html) || /^-\s+/m.test(html);
            if (!looksLikeHtml && looksLikeMarkdown) {
              html = markdownToHtml(html);
            }
          }

          setPages(1);
          setTimeout(() => {
            const n = pageContainerRef.current?.querySelector<HTMLDivElement>(".docs-page");
            if (n) n.innerHTML = html;
          }, 0);
          return;
        }

        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const p = JSON.parse(saved) as { title: string; html?: string; htmlPages?: string[]; pageSize?: PageSize; orientation?: Orientation; darkPage?: boolean };
          setTitle(p.title || "");
          if (p.pageSize) setPageSize(p.pageSize);
          if (p.orientation) setOrientation(p.orientation);
          if (typeof p.darkPage === "boolean") setDarkPage(p.darkPage);
          // Restore pages
          const htmlPages = p.htmlPages && p.htmlPages.length > 0 ? p.htmlPages : [p.html || defaultHtml()];
          setPages(htmlPages.length);
          setTimeout(() => {
            const nodes = pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page");
            if (nodes) htmlPages.forEach((h, i) => { const n = nodes[i]; if (n) n.innerHTML = h; });
          }, 0);
        } else {
          // Initialize first page blank
          setPages(1);
          setTimeout(() => {
            const n = pageContainerRef.current?.querySelector<HTMLDivElement>(".docs-page");
            if (n && n.innerHTML.trim() === "") n.innerHTML = defaultHtml();
          }, 0);
        }
      } catch {}
    })();
  }, [initialDocId]);

  // Realtime: connect when we have a blog id
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!docId) return;
      const userId = getUserIdFromToken() || "anon";
      try {
        if (!collabRef.current) {
          const client = await connectCollab();
          if (!mounted) { client.disconnect(); return; }
          collabRef.current = client;
          client.onPresence((p) => setPresence(p));
        }
        collabRef.current?.join(docId, userId, null);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [docId]);

  useEffect(() => {
    return () => {
      try {
        const userId = getUserIdFromToken() || "anon";
        if (docId && collabRef.current) {
          collabRef.current.leave(docId, userId);
          collabRef.current.disconnect();
          collabRef.current = null;
        }
      } catch {}
    };
  }, []);

  // Selection/text insertion helpers
  function replaceSelectionWithHtml(html: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const frag = range.createContextualFragment(html);
    range.insertNode(frag);
    pageContainerRef.current?.focus();
  }

  function insertPlainText(text: string) {
    document.execCommand("insertText", false, text);
  }

  // Turn plain text into simple HTML paragraphs
  function toHtml(text: string) {
    const esc = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const parts = esc.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, "<br/>")}</p>`);
    return parts.join("");
  }

  // Very small Markdown -> HTML converter (headings, lists, bold/italic, paragraphs)
  function markdownToHtml(md: string) {
    // Normalize AI-style markdown that may put headings/bullets inline without newlines
    let normalized = md.replace(/\r\n?/g, "\n");
    // Ensure headings like "... readers. ## What is" start on a new line
    normalized = normalized.replace(/\s(#{1,6}\s+)/g, "\n$1");
    // Ensure bullets like "... characteristics: * **Connectivity:**" start on new lines
    normalized = normalized.replace(/\s(\*\s+)/g, "\n$1");

    const lines = normalized.split("\n");
    let html = "";
    let inUl = false;
    const flushUl = () => { if (inUl) { html += "</ul>"; inUl = false; } };
    const inline = (s: string) => s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    for (const raw of lines) {
      const line = raw.trimEnd();
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushUl();
        const level = h[1].length;
        html += `<h${level}>${inline(h[2])}</h${level}>`;
        continue;
      }
      if (/^\*\s+/.test(line)) {
        if (!inUl) { html += "<ul>"; inUl = true; }
        html += `<li>${inline(line.replace(/^\*\s+/, ""))}</li>`;
        continue;
      }
      if (line === "") { flushUl(); html += "<p><br/></p>"; continue; }
      flushUl();
      html += `<p>${inline(line)}</p>`;
    }
    flushUl();
    return html;
  }

  function normalizeAiContent(res: any): string {
    if (!res) return "";
    if (typeof res.html === 'string') return res.html;
    if (typeof res.content === 'string') return res.content;
    if (typeof res.text === 'string') return res.text;
    if (Array.isArray(res?.choices)) {
      const c = res.choices[0];
      if (typeof c === 'string') return c;
      if (typeof c?.message?.content === 'string') return c.message.content;
    }
    try { return String(res); } catch { return ""; }
  }

  function paginateText(text: string, wordsPerPage = 900) {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let buf: string[] = [];
    for (const w of words) {
      buf.push(w);
      if (buf.length >= wordsPerPage) {
        chunks.push(buf.join(" "));
        buf = [];
      }
    }
    if (buf.length) chunks.push(buf.join(" "));
    return chunks;
  }

  function focusLastPage() {
    const pages = pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page");
    const last = pages && pages[pages.length - 1];
    if (!last) return;
    last.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(last);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
    savedRangeRef.current = range.cloneRange();
  }

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function runAiChat(prompt: string, mode: 'write'|'rewrite'|'continue'|'summarize' = 'write') {
    try {
      const context = mode === 'rewrite' || mode === 'summarize' ? (window.getSelection()?.toString() || '') : '';
      const finalPrompt = context ? `${prompt}\n\nContext:\n${context}` : prompt;
      let outText: string;
      if (mode === 'write' && /^(#|\*\s|\w+)/m.test(prompt) && prompt.length > 80) {
        outText = prompt;
      } else {
        const res = await generateBlog({ prompt: finalPrompt });
        outText = normalizeAiContent(res);
      }

      // Paginate by word count
      const chunks = paginateText(outText, 900);
      for (let i = 0; i < chunks.length; i++) {
        const html = /<\w+/.test(outText) ? chunks[i] : markdownToHtml(chunks[i]);
        focusLastPage();
        document.execCommand('insertHTML', false, html);
        setDirty(true);
        if (i < chunks.length - 1) {
          addPage();
          await wait(0);
        }
      }
    } catch (e: any) {
      // ignore chat history; surface failures via alert for now
      alert(e?.message || 'AI failed');
    }
  }

  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prompt = aiPrompt.trim();
    if (!prompt || aiLoading) return;
    setAiLoading(true);
    try {
      await runAiChat(prompt, aiMode);
      setAiPrompt("");
    } catch (err: any) {
      setAiError(err?.message || "AI failed");
    } finally {
      setAiLoading(false);
    }
  }

  const saveDraft = useMemo(
    () =>
      debounce(() => {
        try {
          const htmlPages = Array.from(pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page") || []).map((n) => n.innerHTML || defaultHtml());
          const payload = { title, htmlPages, pageSize, orientation, darkPage, ts: Date.now() };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
          setSavedAt(Date.now());
          setDirty(false);
        } catch {}
      }, 800),
    [title, pageSize, orientation, darkPage]
  );

  useEffect(() => {
    if (isDirty) saveDraft();
  }, [isDirty, saveDraft]);

  // Toolbar actions
  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    setDirty(true);
  };

  const insertTableWithSize = (rows: number, cols: number) => {
    restoreSelection();
    let html = '<table style="width:100%; border-collapse:collapse;">';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #e5e7eb; padding:8px;">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    document.execCommand("insertHTML", false, html);
    setDirty(true);
    setShowInsert(false);
    setShowTableGrid(false);
  };

  const insertChartPlaceholder = () => {
    restoreSelection();
    const html = '<div style="width:100%;height:220px;border:1px dashed #cbd5e1;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#64748b;">Chart placeholder</div>';
    document.execCommand("insertHTML", false, html);
    setDirty(true);
  };

  const insertTable = () => {
    setShowTableModal(true);
  };

  const confirmInsertTable = () => {
    restoreSelection();
    const rows = Math.max(1, Number(tableRows));
    const cols = Math.max(1, Number(tableCols));
    let html = '<table style="width:100%; border-collapse:collapse;">';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #e5e7eb; padding:8px;">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    document.execCommand("insertHTML", false, html);
    setDirty(true);
    setShowTableModal(false);
  };

  const applyHeading = (tag: string) => exec("formatBlock", tag);
  const applyFontSize = (size: string) => exec("fontSize", size);
  const applyFont = (family: string) => exec("fontName", family);

  const createLink = () => {
    const sel = window.getSelection();
    const selectedText = sel && sel.rangeCount > 0 ? sel.toString() : "";
    setLinkText(selectedText);
    setLinkUrl("");
    setShowLinkModal(true);
  };
  const unlink = () => exec("unlink");
  const clearFormatting = () => exec("removeFormat");
  const applyColor = (color: string) => exec("foreColor", color);
  const applyBg = (color: string) => exec("hiliteColor", color);

  // Format helpers
  const increaseIndent = () => exec("indent");
  const decreaseIndent = () => exec("outdent");
  const setLineHeight = (lh: number) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const wrapper = document.createElement("span");
    wrapper.style.lineHeight = String(lh);
    range.surroundContents(wrapper);
    setDirty(true);
  };

  const onPickImage = () => fileInputRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => exec("insertImage", reader.result as string);
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  };

  const onPaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // 1) If an image is present, paste it as before
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const f = item.getAsFile();
        if (!f) continue;
        const reader = new FileReader();
        reader.onload = () => exec("insertImage", reader.result as string);
        reader.readAsDataURL(f);
        e.preventDefault();
        return;
      }
    }

    // 2) If plain text looks like markdown, convert to HTML before inserting
    const text = e.clipboardData.getData('text/plain');
    if (text) {
      const looksLikeHeading = /(^|\n)\s*#{1,6}\s+/.test(text);
      const looksLikeList = /(^|\n)\s*(\*|-|\d+\.)\s+/.test(text);
      const looksLikeMd = looksLikeHeading || looksLikeList || /\*\*(.+?)\*\*/.test(text);
      if (looksLikeMd && !/<\w+/.test(text)) {
        e.preventDefault();
        const html = markdownToHtml(text);
        document.execCommand('insertHTML', false, html);
        setDirty(true);
      }
    }
  };

  const zoomOut = () => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))));
  const zoomIn = () => setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(2))));

  const toggleOrientation = () => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"));
  const pageDims = getPageDimensions(pageSize, orientation);

  const handlePublish = () => {
    try {
      const htmlPages = Array.from(pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page") || []).map((n) => n.innerHTML || defaultHtml());
      const payload = { title: title || "Untitled document", htmlPages, pageSize, orientation };
      // TODO: integrate backend. For now, confirm publish.
      alert("Published! (stub)\n\nTitle: " + payload.title + "\nPages: " + htmlPages.length);
      setDirty(false);
    } catch (e) {
      alert("Failed to publish (stub)");
    }
  };

  const addPage = () => {
    setPages((p) => p + 1);
    setDirty(true);
    setTimeout(() => {
      const nodes = pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page");
      const last = nodes?.[nodes.length - 1];
      if (last && last.innerHTML.trim() === "") last.innerHTML = defaultHtml();
    }, 0);
  };

  function exportDoc() {
    const htmlPages = Array.from(pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page") || []).map((n) => n.innerHTML || defaultHtml());
    const content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title || "Document"}</title></head><body>${htmlPages
      .map((h) => `<div>${h}</div>`)
      .join('<div style="page-break-after:always"></div>')}</body></html>`;
    const blob = new Blob([content], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(title || "document").replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function exportPdf() {
    const htmlPages = Array.from(pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page") || []).map((n) => n.outerHTML);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" />
    <title>${title || "Document"}</title>
    <style>
      @page { margin: 20mm; }
      body { background: #fff; color: #111827; }
      .docs-page { width: auto; min-height: auto; border: none; box-shadow: none; margin: 0 0 16px 0; padding: 0; }
    </style>
    </head><body>${htmlPages.join('<div style="page-break-after:always"></div>')}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <div className="docs-root">
      {/* Menubar (row 1) */}
      <div className="docs-menubar">
        <div className="docs-menubar-left">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            placeholder="Untitled document"
            className="docs-menubar-title"
          />
          <button className="docs-menubar-icon" title="Star"><FiStar /></button>
        </div>
        <nav className="docs-menu-items" aria-label="Application menu">
          <div className="docs-menu">
            <button className="docs-menu-item" onClick={() => { setShowFile(v=>!v); setShowInsert(false); setShowFormat(false); }}>File</button>
            {showFile && (
              <div className="docs-menu-list" role="menu" onMouseLeave={() => setShowFile(false)}>
                <button role="menuitem" onClick={() => { setPages(1); setTitle(""); }}>New</button>
                <button role="menuitem" onClick={() => alert("Open dialog stub")}>Open…</button>
                <button role="menuitem" onClick={() => {
                  const htmlPages = Array.from(pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page") || []).map((n) => n.innerHTML || defaultHtml());
                  const payload = { title, htmlPages, pageSize, orientation, darkPage, ts: Date.now() };
                  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
                  setSavedAt(Date.now()); setDirty(false);
                  setShowFile(false);
                }}>Save draft</button>
                <button role="menuitem" onClick={() => { setShowFile(false); handlePublish(); }}>Publish</button>
                <div className="docs-menu-sep" />
                <button role="menuitem" onClick={() => { setShowFile(false); exportPdf(); }}>Download → PDF</button>
                <button role="menuitem" onClick={() => { setShowFile(false); exportDoc(); }}>Download → Word (.doc)</button>
              </div>
            )}

      {showLinkModal && (
        <div className="docs-modal" role="dialog" aria-modal="true">
          <div className="docs-modal-card">
            <div className="docs-modal-header">
              <h3>Insert link</h3>
              <button className="docs-btn" onClick={() => setShowLinkModal(false)} title="Close">×</button>
            </div>
            <div className="docs-modal-body">
              <label className="docs-field">
                <span>Text</span>
                <input type="text" value={linkText} onChange={(e)=>setLinkText(e.target.value)} placeholder="Link text" />
              </label>
              <label className="docs-field">
                <span>URL</span>
                <input type="url" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} placeholder="https://example.com" />
              </label>
            </div>
            <div className="docs-modal-actions">
              <button className="docs-primary-btn outline" onClick={()=>setShowLinkModal(false)}>Cancel</button>
              <button className="docs-primary-btn" onClick={() => {
                if (!linkUrl) return;
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0 && sel.toString()) {
                  // Replace selection with anchor
                  const a = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || sel.toString()}</a>`;
                  replaceSelectionWithHtml(a);
                } else {
                  // Insert anchor with text
                  const a = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
                  replaceSelectionWithHtml(a);
                }
                setShowLinkModal(false);
                setDirty(true);
              }}>Insert</button>
            </div>
          </div>
        </div>
      )}

      {showTableModal && (
        <div className="docs-modal" role="dialog" aria-modal="true">
          <div className="docs-modal-card">
            <div className="docs-modal-header">
              <h3>Insert table</h3>
              <button className="docs-btn" onClick={() => setShowTableModal(false)} title="Close">×</button>
            </div>
            <div className="docs-modal-body">
              <label className="docs-field">
                <span>Rows</span>
                <input type="number" min={1} max={20} value={tableRows} onChange={(e)=>setTableRows(Number(e.target.value))} />
              </label>
              <label className="docs-field">
                <span>Columns</span>
                <input type="number" min={1} max={12} value={tableCols} onChange={(e)=>setTableCols(Number(e.target.value))} />
              </label>
            </div>
            <div className="docs-modal-actions">
              <button className="docs-primary-btn outline" onClick={()=>setShowTableModal(false)}>Cancel</button>
              <button className="docs-primary-btn" onClick={confirmInsertTable}>Insert</button>
            </div>
          </div>
        </div>
      )}
          </div>
          <div className="docs-menu">
            <button className="docs-menu-item" onClick={() => { setShowInsert(v=>!v); setShowFile(false); setShowFormat(false); }}>Insert</button>
            {showInsert && (
              <div className="docs-menu-list" role="menu">
                <div className="docs-menu-row" onMouseEnter={() => setShowTableGrid(true)}>
                  <button role="menuitem">Table ▸</button>
                  {showTableGrid && (
                    <div className="docs-submenu" onMouseLeave={() => setShowTableGrid(false)}>
                      <div className="docs-table-grid">
                        {Array.from({length:10}).map((_, r) => (
                          <div key={r} className="docs-grid-row">
                            {Array.from({length:10}).map((__, c) => {
                              const rr = r+1, cc = c+1;
                              const active = rr <= gridHoverRows && cc <= gridHoverCols;
                              return (
                                <span
                                  key={c}
                                  className={`docs-grid-cell ${active ? 'active' : ''}`}
                                  onMouseEnter={() => { setGridHoverRows(rr); setGridHoverCols(cc); }}
                                  onClick={() => insertTableWithSize(rr, cc)}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      <div className="docs-grid-label">{gridHoverRows} × {gridHoverCols}</div>
                    </div>
                  )}
                </div>
                <button role="menuitem" onClick={() => { setShowInsert(false); onPickImage(); }}>Image…</button>
                <button role="menuitem" onClick={() => { setShowInsert(false); createLink(); }}>Link…</button>
                <button role="menuitem" onClick={() => { setShowInsert(false); insertChartPlaceholder(); }}>Chart (placeholder)</button>
              </div>
            )}
          </div>
          <div className="docs-menu">
            <button className="docs-menu-item" onClick={() => { setShowFormat(v=>!v); setShowFile(false); setShowInsert(false); }}>Format</button>
            {showFormat && (
              <div className="docs-menu-list" role="menu" onMouseLeave={() => setShowFormat(false)}>
                <button role="menuitem" onClick={() => { setShowFormat(false); setLineHeight(1.2); }}>Line spacing 1.2</button>
                <button role="menuitem" onClick={() => { setShowFormat(false); setLineHeight(1.5); }}>Line spacing 1.5</button>
                <button role="menuitem" onClick={() => { setShowFormat(false); setLineHeight(1.75); }}>Line spacing 1.75</button>
                <div className="docs-menu-sep" />
                <button role="menuitem" onClick={() => { setShowFormat(false); increaseIndent(); }}>Increase indent</button>
                <button role="menuitem" onClick={() => { setShowFormat(false); decreaseIndent(); }}>Decrease indent</button>
                <div className="docs-menu-sep" />
                <button role="menuitem" onClick={() => { setShowFormat(false); exec("insertUnorderedList"); }}>Bulleted list</button>
                <button role="menuitem" onClick={() => { setShowFormat(false); exec("insertOrderedList"); }}>Numbered list</button>
                <button role="menuitem" onClick={() => { setShowFormat(false); clearFormatting(); }}>Clear formatting</button>
              </div>
            )}
          </div>
          {['Edit','View','Tools','Extensions','Help'].map((m) => (
            <button key={m} className="docs-menu-item" type="button">{m}</button>
          ))}
        </nav>
        <div className="docs-menubar-right">
          <button className="docs-share" title="AI Assistant" onClick={() => setShowAI(v=>!v)}>
            <FiZap />
            <span>AI</span>
          </button>
          <button className="docs-menubar-icon" title="Comments"><FiMessageCircle /></button>
          <div className="docs-share">
            <FiLock />
            <span>Share</span>
          </div>
        </div>
      </div>

      {/* Workspace: main + AI dock */}
      <div className="docs-workspace">
        <div className="docs-main">

      {/* Formatting toolbar (row 2) */}
      <div className="docs-toolbar">
        <div className="docs-toolbar-left" role="toolbar" aria-label="Document formatting toolbar">
          <div className="docs-controls">
            <div className="docs-group">
              <button className="docs-btn" title="Menus"><FiChevronDown /></button>
              <button className="docs-btn" onClick={() => exec("undo")} title="Undo"><FiRotateCcw /></button>
              <button className="docs-btn" onClick={() => exec("redo")} title="Redo"><FiRotateCw /></button>
              <button className="docs-btn" title="Print"><FiType /></button>
            </div>

            {/* Group: styles */}
            <div className="docs-group">
              <select aria-label="Text style" onChange={(e) => applyHeading(e.target.value)} className="docs-select">
                {HEADINGS.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
              <select aria-label="Font" onChange={(e) => applyFont(e.target.value)} className="docs-select">
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>{f.split(",")[0]}</option>
                ))}
              </select>
              <select aria-label="Font size" onChange={(e) => applyFontSize(e.target.value)} className="docs-select">
                {FONT_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Group: inline formatting */}
            <div className="docs-group">
              <button className="docs-btn" onClick={() => exec("bold")} title="Bold (Ctrl+B)"><FiBold /></button>
              <button className="docs-btn" onClick={() => exec("italic")} title="Italic (Ctrl+I)"><FiItalic /></button>
              <button className="docs-btn" onClick={() => exec("underline")} title="Underline (Ctrl+U)"><FiUnderline /></button>
              <button className="docs-btn" onClick={clearFormatting} title="Clear formatting"><FiSlash /></button>
            </div>

            {/* Group: lists */}
            <div className="docs-group">
              <button className="docs-btn" onClick={() => exec("insertUnorderedList")} title="Bulleted list"><FiList /></button>
              <button className="docs-btn" onClick={() => exec("insertOrderedList")} title="Numbered list"><FiList /></button>
            </div>

            {/* Group: alignment */}
            <div className="docs-group">
              <button className="docs-btn" onClick={() => exec("justifyLeft")} title="Align left"><FiAlignLeft /></button>
              <button className="docs-btn" onClick={() => exec("justifyCenter")} title="Align center"><FiAlignCenter /></button>
              <button className="docs-btn" onClick={() => exec("justifyRight")} title="Align right"><FiAlignRight /></button>
              <button className="docs-btn" onClick={() => exec("justifyFull")} title="Justify"><FiAlignJustify /></button>
            </div>

            {/* Group: insert */}
            <div className="docs-group">
              <button className="docs-btn" onClick={createLink} title="Insert link"><FiLink /></button>
              <button className="docs-btn" onClick={unlink} title="Remove link"><FiX /></button>
              <button className="docs-btn" onClick={onPickImage} title="Insert image"><FiImage /></button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              <button className="docs-btn" onClick={insertTable} title="Insert table"><FiGrid /></button>
            </div>

            {/* Group: history */}
            <div className="docs-group">
              <button className="docs-btn" onClick={() => exec("undo")} title="Undo"><FiRotateCcw /></button>
              <button className="docs-btn" onClick={() => exec("redo")} title="Redo"><FiRotateCw /></button>
            </div>

            {/* Group: colors */}
            <div className="docs-group">
              <label className="docs-color" title="Text color">
                <FiDroplet />
                <input type="color" onChange={(e) => applyColor(e.target.value)} aria-label="Text color" />
              </label>
              <label className="docs-color" title="Highlight color">
                <span className="docs-highlight-swatch" />
                <input type="color" onChange={(e) => applyBg(e.target.value)} aria-label="Highlight color" />
              </label>
            </div>
          </div>
        </div>

        <div className="docs-toolbar-right">
          <select aria-label="Page size" value={pageSize} onChange={(e) => { setPageSize(e.target.value as PageSize); setDirty(true); }} className="docs-select">
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
          </select>
          <button className="docs-zoom-btn" onClick={toggleOrientation} title="Toggle orientation">
            {orientation === "portrait" ? <FiType /> : <FiType />}
          </button>
          <button className="docs-zoom-btn" onClick={() => { setDarkPage((v) => !v); setDirty(true); }} title="Toggle page theme">
            {darkPage ? <FiSun /> : <FiMoon />}
          </button>
          <button className="docs-zoom-btn" onClick={addPage} title="Add page"><FiFilePlus /></button>
          <div className="docs-divider" />
          <div className="docs-menu">
            <button className="docs-zoom-btn" onClick={() => setShowDownload((v) => !v)} title="Download">
              <FiDownload />
              <FiChevronDown />
            </button>
            {showDownload && (
              <div className="docs-menu-list" role="menu" onMouseLeave={() => setShowDownload(false)}>
                <button role="menuitem" onClick={() => { setShowDownload(false); exportPdf(); }}>Download as PDF</button>
                <button role="menuitem" onClick={() => { setShowDownload(false); exportDoc(); }}>Download as Word (.doc)</button>
              </div>
            )}
          </div>
          <div className="docs-divider" />
          <button className="docs-zoom-btn" onClick={zoomOut} title="Zoom out"><FiMinus /></button>
          <span className="docs-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="docs-zoom-btn" onClick={zoomIn} title="Zoom in"><FiPlus /></button>

          <div className="docs-divider" />
          <button
            className="docs-primary-btn outline"
            onClick={async () => {
              try {
                const htmlPages = Array.from(pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page") || []).map((n) => n.innerHTML || defaultHtml());
                if (!docId) {
                  const res = await createBlog({ title: title || "Untitled document", htmlPages, status: 'draft' });
                  setDocId(res.id);
                } else {
                  await updateBlog({ id: docId, title: title || "Untitled document", htmlPages, status: 'draft' });
                }
                // notify collab server
                try {
                  const uid = getUserIdFromToken() || 'anon';
                  collabRef.current?.saveDraft(docId || '', uid, { contentHTML: htmlPages.join('<div style="page-break-after:always"></div>') });
                } catch {}
                setSavedAt(Date.now());
                setDirty(false);
              } catch (e: any) {
                alert(e?.message || 'Failed to save');
              }
            }}
          >
            <FiSave />
            <span>Save draft</span>
          </button>
          <button className="docs-primary-btn" onClick={async()=>{
            try {
              const htmlPages = Array.from(pageContainerRef.current?.querySelectorAll<HTMLDivElement>(".docs-page") || []).map((n) => n.innerHTML || defaultHtml());
              if (!docId) {
                const res = await createBlog({ title: title || "Untitled document", htmlPages, status: 'published' });
                setDocId(res.id);
              } else {
                await updateBlog({ id: docId, title: title || "Untitled document", htmlPages, status: 'published' });
              }
              try {
                const uid = getUserIdFromToken() || 'anon';
                collabRef.current?.saveDraft(docId || '', uid, { contentHTML: htmlPages.join('<div style="page-break-after:always"></div>') });
              } catch {}
              setSavedAt(Date.now());
              setDirty(false);
              alert('Published!');
            } catch(e:any) { alert(e?.message || 'Failed to publish'); }
          }}>
            <FiSend />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="docs-canvas" ref={pageContainerRef}>
        {[...Array(pages)].map((_, idx) => (
          <div key={idx} className="docs-page-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
            <div
              className={`docs-page editor-content ${darkPage ? "docs-page-dark" : ""}`}
              contentEditable
              suppressContentEditableWarning
              onInput={() => setDirty(true)}
              onPaste={onPaste}
              onMouseUp={updateSavedRange}
              onKeyUp={updateSavedRange}
              data-placeholder="Start typing…"
              style={{ width: pageDims.width, minHeight: pageDims.height }}
            />
          </div>
        ))}
        <div className="docs-status">{isDirty ? "Saving…" : savedAt ? `Saved ${timeAgo(savedAt)}` : ""}</div>
      </div>
        </div>

        {showAI && (
          <aside className="hidden lg:flex fixed inset-y-0 right-0 w-80 flex-col border-l border-zinc-200 bg-zinc-50/90 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">AI Assistant</p>
                <p className="text-sm font-semibold text-zinc-900">New chat</p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
                onClick={() => setShowAI(false)}
                aria-label="Close AI assistant"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 text-xs text-zinc-600 space-y-3">
              {aiSelection && (
                <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                  <p className="font-medium mb-1">Selected text</p>
                  <p className="line-clamp-4 whitespace-pre-wrap">{aiSelection}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-[11px]">
                {[
                  { key: "write" as const, label: "Write" },
                  { key: "rewrite" as const, label: "Rewrite" },
                  { key: "continue" as const, label: "Continue" },
                  { key: "summarize" as const, label: "Summarize" },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setAiMode(m.key)}
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 font-medium transition-colors ${
                      aiMode === m.key
                        ? "border-zinc-900 bg-zinc-900 text-zinc-50"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <p>
                Ask AI to {aiMode === "write" && "draft"}
                {aiMode === "rewrite" && "rewrite selected"}
                {aiMode === "continue" && "continue"}
                {aiMode === "summarize" && "summarize"} content. Changes are inserted directly into the document.
              </p>
            </div>

            <form onSubmit={handleAiSubmit} className="border-t border-zinc-200 px-3 py-3 space-y-2">
              <textarea
                rows={3}
                className="w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="Ask AI to draft a section, rewrite selected text, or summarize…"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-zinc-300 text-[10px]">⏎</span>
                  <span>to send</span>
                </div>
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black disabled:opacity-60"
                >
                  {aiLoading ? "Thinking…" : "Run"}
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}

function defaultHtml() {
  return "<p><br/></p>";
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

function getPageDimensions(size: PageSize, orientation: Orientation) {
  // Approx at 96dpi
  const A4 = { w: 794, h: 1123 };
  const Letter = { w: 816, h: 1056 };
  const base = size === "A4" ? A4 : Letter;
  const w = orientation === "portrait" ? base.w : base.h;
  const h = orientation === "portrait" ? base.h : base.w;
  return { width: `${w}px`, height: `${h}px` };
}

// Insert chosen AI title into the top of the editor content as H1
function insertTitleIntoEditor(t: string) {
  const first = document.querySelector<HTMLDivElement>(".docs-page");
  if (!first) return;
  const h1 = document.createElement("h1");
  h1.textContent = t;
  const spacer = document.createElement("p");
  spacer.innerHTML = "<br/>";
  first.prepend(spacer);
  first.prepend(h1);
}
