import React, { useState } from "react";
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
} from "react-icons/fi";
import { FONT_SIZES, FONT_FAMILIES, HEADINGS, PageSize, Orientation } from "./utils"; // Import from utils

interface ToolbarProps {
  execCommand: (cmd: string, value?: string) => void;
  applyBlockHeading: (tag: string) => void;
  onPickImage: () => void;
  createLink: () => void;
  insertTable: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoom: number;
  pageSize: PageSize;
  setPageSize: (size: PageSize) => void;
  orientation: Orientation;
  toggleOrientation: () => void;
  darkPage: boolean;
  setDarkPage: (dark: boolean) => void;
  addPage: () => void;
  setDirty: (dirty: boolean) => void;
  saveDocument: () => void;
  publishDocument: () => void;
  exportPdf: () => void;
  exportDoc: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  execCommand,
  applyBlockHeading,
  onPickImage,
  createLink,
  insertTable,
  zoomIn,
  zoomOut,
  zoom,
  pageSize,
  setPageSize,
  orientation,
  toggleOrientation,
  darkPage,
  setDarkPage,
  addPage,
  setDirty,
  saveDocument,
  publishDocument,
  exportPdf,
  exportDoc,
}) => {
  const [showDownload, setShowDownload] = useState(false);

  const applyFontSize = (size: string) => execCommand("fontSize", size);
  const applyFont = (family: string) => execCommand("fontName", family);
  const applyColor = (color: string) => execCommand("foreColor", color);
  const applyBg = (color: string) => execCommand("hiliteColor", color);

  return (
    <div className="docs-toolbar">
      <div className="docs-toolbar-left" role="toolbar" aria-label="Document formatting toolbar">
        <div className="docs-controls">
          <div className="docs-group">
            <button className="docs-btn" title="Menus"><FiChevronDown /></button>
            <button className="docs-btn" onClick={() => execCommand("undo")} title="Undo"><FiRotateCcw /></button>
            <button className="docs-btn" onClick={() => execCommand("redo")} title="Redo"><FiRotateCw /></button>
            <button className="docs-btn" title="Print"><FiType /></button>
          </div>

          <div className="docs-group">
            <div className="docs-group">
              <button type="button" className="docs-btn" title="Normal text" onClick={() => applyBlockHeading("P")}>Normal</button>
              <button type="button" className="docs-btn" title="Heading 1" onClick={() => applyBlockHeading("H1")}>H1</button>
              <button type="button" className="docs-btn" title="Heading 2" onClick={() => applyBlockHeading("H2")}>H2</button>
              <button type="button" className="docs-btn" title="Heading 3" onClick={() => applyBlockHeading("H3")}>H3</button>
            </div>

            <select aria-label="Text style" onChange={(e) => applyBlockHeading(e.target.value)} className="docs-select">
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

          <div className="docs-group">
            <button className="docs-btn" onClick={() => execCommand("bold")} title="Bold (Ctrl+B)"><FiBold /></button>
            <button className="docs-btn" onClick={() => execCommand("italic")} title="Italic (Ctrl+I)"><FiItalic /></button>
            <button className="docs-btn" onClick={() => execCommand("underline")} title="Underline (Ctrl+U)"><FiUnderline /></button>
            <button className="docs-btn" onClick={() => execCommand("removeFormat")} title="Clear formatting"><FiSlash /></button>
          </div>

          <div className="docs-group">
            <button className="docs-btn" onClick={() => execCommand("insertUnorderedList")} title="Bulleted list"><FiList /></button>
            <button className="docs-btn" onClick={() => execCommand("insertOrderedList")} title="Numbered list"><FiList /></button>
          </div>

          <div className="docs-group">
            <button className="docs-btn" onClick={() => execCommand("justifyLeft")} title="Align left"><FiAlignLeft /></button>
            <button className="docs-btn" onClick={() => execCommand("justifyCenter")} title="Align center"><FiAlignCenter /></button>
            <button className="docs-btn" onClick={() => execCommand("justifyRight")} title="Align right"><FiAlignRight /></button>
            <button className="docs-btn" onClick={() => execCommand("justifyFull")} title="Justify"><FiAlignJustify /></button>
          </div>

          <div className="docs-group">
            <button className="docs-btn" onClick={createLink} title="Insert link"><FiLink /></button>
            <button className="docs-btn" onClick={() => execCommand("unlink")} title="Remove link"><FiX /></button>
            <button className="docs-btn" onClick={onPickImage} title="Insert image"><FiImage /></button>
            <button className="docs-btn" onClick={insertTable} title="Insert table"><FiGrid /></button>
          </div>

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
        <button className="docs-primary-btn outline" onClick={saveDocument}>
          <FiSave />
          <span>Save draft</span>
        </button>
        <button className="docs-primary-btn" onClick={publishDocument}>
          <FiSend />
          <span>Publish</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;