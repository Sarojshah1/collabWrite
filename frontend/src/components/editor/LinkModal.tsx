import React from "react";
import { FiX } from "react-icons/fi";

interface LinkModalProps {
  linkText: string;
  setLinkText: (text: string) => void;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const LinkModal: React.FC<LinkModalProps> = ({
  linkText,
  setLinkText,
  linkUrl,
  setLinkUrl,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="docs-modal" role="dialog" aria-modal="true">
      <div className="docs-modal-card">
        <div className="docs-modal-header">
          <h3>Insert link</h3>
          <button className="docs-btn" onClick={onClose} title="Close">
            <FiX />
          </button>
        </div>
        <div className="docs-modal-body">
          <label className="docs-field">
            <span>Text</span>
            <input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Link text" />
          </label>
          <label className="docs-field">
            <span>URL</span>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
          </label>
        </div>
        <div className="docs-modal-actions">
          <button className="docs-primary-btn outline" onClick={onClose}>Cancel</button>
          <button className="docs-primary-btn" onClick={onConfirm}>Insert</button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;