import React, { useState } from "react";
import { FiChevronDown, FiStar, FiMessageCircle, FiLock, FiZap } from "react-icons/fi";
import { FONT_SIZES, FONT_FAMILIES, HEADINGS } from "./utils"; // Import from utils

interface MenubarProps {
  title: string;
  setTitle: (title: string) => void;
  setDirty: (dirty: boolean) => void;
  saveDraft: () => void;
  handlePublish: () => void;
  exportPdf: () => void;
  exportDoc: () => void;
  onPickImage: () => void;
  createLink: () => void;
  insertTable: () => void;
  insertTableWithSize: (rows: number, cols: number) => void;
  insertChartPlaceholder: () => void;
  execCommand: (cmd: string, value?: string) => void;
  applyBlockHeading: (tag: string) => void;
  addPage: () => void;
}

const Menubar: React.FC<MenubarProps> = ({
  title,
  setTitle,
  setDirty,
  saveDraft,
  handlePublish,
  exportPdf,
  exportDoc,
  onPickImage,
  createLink,
  insertTable,
  insertTableWithSize,
  insertChartPlaceholder,
  execCommand,
  applyBlockHeading,
  addPage,
}) => {
  const [showFile, setShowFile] = useState(false);
  const [showInsert, setShowInsert] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [gridHoverRows, setGridHoverRows] = useState(1);
  const [gridHoverCols, setGridHoverCols] = useState(1);

  const setLineHeight = (lh: number) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const wrapper = document.createElement("span");
    wrapper.style.lineHeight = String(lh);
    range.surroundContents(wrapper);
    setDirty(true);
  };

  return (
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
        <button className="docs-menubar-icon" title="Star">
          <FiStar />
        </button>
      </div>
      <nav className="docs-menu-items" aria-label="Application menu">
        <div className="docs-menu">
          <button className="docs-menu-item" onClick={() => { setShowFile(v => !v); setShowInsert(false); setShowFormat(false); }}>File</button>
          {showFile && (
            <div className="docs-menu-list" role="menu" onMouseLeave={() => setShowFile(false)}>
              <button role="menuitem" onClick={() => { addPage(); setTitle(""); setShowFile(false); }}>New</button>
              <button role="menuitem" onClick={() => alert("Open dialog stub")}>Open…</button>
              <button role="menuitem" onClick={() => { saveDraft(); setShowFile(false); }}>Save draft</button>
              <button role="menuitem" onClick={() => { setShowFile(false); handlePublish(); }}>Publish</button>
              <div className="docs-menu-sep" />
              <button role="menuitem" onClick={() => { setShowFile(false); exportPdf(); }}>Download → PDF</button>
              <button role="menuitem" onClick={() => { setShowFile(false); exportDoc(); }}>Download → Word (.doc)</button>
            </div>
          )}
        </div>
        <div className="docs-menu">
          <button className="docs-menu-item" onClick={() => { setShowInsert(v => !v); setShowFile(false); setShowFormat(false); }}>Insert</button>
          {showInsert && (
            <div className="docs-menu-list" role="menu" onMouseLeave={() => setShowInsert(false)}>
              <div className="docs-menu-row" onMouseEnter={() => setShowTableGrid(true)}>
                <button role="menuitem">Table ▸</button>
                {showTableGrid && (
                  <div className="docs-submenu" onMouseLeave={() => setShowTableGrid(false)}>
                    <div className="docs-table-grid">
                      {Array.from({ length: 10 }).map((_, r) => (
                        <div key={r} className="docs-grid-row">
                          {Array.from({ length: 10 }).map((__, c) => {
                            const rr = r + 1, cc = c + 1;
                            const active = rr <= gridHoverRows && cc <= gridHoverCols;
                            return (
                              <span
                                key={c}
                                className={`docs-grid-cell ${active ? 'active' : ''}`}
                                onMouseEnter={() => { setGridHoverRows(rr); setGridHoverCols(cc); }}
                                onClick={() => { insertTableWithSize(rr, cc); setShowInsert(false); setShowTableGrid(false); }}
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
          <button className="docs-menu-item" onClick={() => { setShowFormat(v => !v); setShowFile(false); setShowInsert(false); }}>Format</button>
          {showFormat && (
            <div className="docs-menu-list" role="menu" onMouseLeave={() => setShowFormat(false)}>
              <button role="menuitem" onClick={() => { setShowFormat(false); setLineHeight(1.2); }}>Line spacing 1.2</button>
              <button role="menuitem" onClick={() => { setShowFormat(false); setLineHeight(1.5); }}>Line spacing 1.5</button>
              <button role="menuitem" onClick={() => { setShowFormat(false); setLineHeight(1.75); }}>Line spacing 1.75</button>
              <div className="docs-menu-sep" />
              <button role="menuitem" onClick={() => { setShowFormat(false); execCommand("indent"); }}>Increase indent</button>
              <button role="menuitem" onClick={() => { setShowFormat(false); execCommand("outdent"); }}>Decrease indent</button>
              <div className="docs-menu-sep" />
              <button role="menuitem" onClick={() => { setShowFormat(false); execCommand("insertUnorderedList"); }}>Bulleted list</button>
              <button role="menuitem" onClick={() => { setShowFormat(false); execCommand("insertOrderedList"); }}>Numbered list</button>
              <button role="menuitem" onClick={() => { setShowFormat(false); execCommand("removeFormat"); }}>Clear formatting</button>
            </div>
          )}
        </div>
        {['Edit', 'View', 'Tools', 'Extensions', 'Help'].map((m) => (
          <button key={m} className="docs-menu-item" type="button">{m}</button>
        ))}
      </nav>
      <div className="docs-menubar-right">
        {/* AI button handled in DocsEditor for now for AI Dock visibility */}
        <button className="docs-menubar-icon" title="Comments">
          <FiMessageCircle />
        </button>
        <div className="docs-share">
          <FiLock />
          <span>Share</span>
        </div>
      </div>
    </div>
  );
};

export default Menubar;