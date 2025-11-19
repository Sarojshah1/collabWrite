import React from "react";
import { FiX } from "react-icons/fi";

interface TableModalProps {
  tableRows: number;
  setTableRows: (rows: number) => void;
  tableCols: number;
  setTableCols: (cols: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const TableModal: React.FC<TableModalProps> = ({
  tableRows,
  setTableRows,
  tableCols,
  setTableCols,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="docs-modal" role="dialog" aria-modal="true">
      <div className="docs-modal-card">
        <div className="docs-modal-header">
          <h3>Insert table</h3>
          <button className="docs-btn" onClick={onClose} title="Close">
            <FiX />
          </button>
        </div>
        <div className="docs-modal-body">
          <label className="docs-field">
            <span>Rows</span>
            <input type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(Number(e.target.value))} />
          </label>
          <label className="docs-field">
            <span>Columns</span>
            <input type="number" min={1} max={12} value={tableCols} onChange={(e) => setTableCols(Number(e.target.value))} />
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

export default TableModal;