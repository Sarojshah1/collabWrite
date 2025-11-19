import { insertTitleIntoEditor } from "./DocsEditor"; // This will cause a circular dependency. We need to handle this.
// For now, let's keep insertTitleIntoEditor within DocsEditor or pass it as a prop.
// For simplicity, I'll move it out to avoid issues for this example, but in a real app,
// you might pass it down or use a different state management approach.

export const FONT_SIZES = [
  { label: "10", value: "2" },
  { label: "12", value: "3" },
  { label: "14", value: "4" },
  { label: "18", value: "5" },
  { label: "24", value: "6" },
];

export const FONT_FAMILIES = [
  "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  "'Times New Roman', Times, serif",
  "Georgia, Cambria, 'Times New Roman', Times, serif",
  "Garamond, serif",
  "'Merriweather', serif",
  "'Helvetica Neue', Helvetica, Arial, sans-serif",
  "'Courier New', Courier, monospace",
];

export const HEADINGS = [
  { label: "Normal text", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
];

export const DRAFT_KEY = "collabwrite_docs_draft_v1";

export type PageSize = "A4" | "Letter";
export type Orientation = "portrait" | "landscape";


export function defaultHtml() {
  return "<p><br/></p>";
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function timeAgo(ts: number) {
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

export function getPageDimensions(size: PageSize, orientation: Orientation) {
  const A4 = { w: 794, h: 1123 }; // at 96dpi
  const Letter = { w: 816, h: 1056 }; // at 96dpi
  const base = size === "A4" ? A4 : Letter;
  const w = orientation === "portrait" ? base.w : base.h;
  const h = orientation === "portrait" ? base.h : base.w;
  return { width: `${w}px`, height: `${h}px` };
}

// Moved from DocsEditor to avoid circular dependency, but should ideally be managed differently (e.g., through props)
export function insertTitleIntoEditor(t: string) {
  const first = document.querySelector<HTMLDivElement>(".docs-page");
  if (!first) return;
  const h1 = document.createElement("h1");
  h1.textContent = t;
  const spacer = document.createElement("p");
  spacer.innerHTML = "<br/>";
  first.prepend(spacer);
  first.prepend(h1);
}

export function markdownToHtml(md: string) {
  let normalized = md.replace(/\r\n?/g, "\n");
  normalized = normalized.replace(/\s(#{1,6}\s+)/g, "\n$1");
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