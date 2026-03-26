// src/components/DivisionSelectorModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5181/api";

export default function DivisionSelectorModal({ open, onConfirm, onClose }) {
  const [divisions, setDivisions] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        // supports paged or flat arrays
        const res = await axios.get(`${API_BASE}/Division`, { params: { pageNumber: 1, pageSize: 1000 }});
        const arr = Array.isArray(res.data) ? res.data : (res.data.items ?? res.data.Items ?? []);
        // normalize
        const norm = arr.map(d => ({
          id: d.divisionId ?? d.DivisionId ?? d.id,
          name: d.divisionName ?? d.DivisionName ?? d.name ?? ""
        })).filter(x => x.id != null);
        setDivisions(norm);
      } catch (e) {
        console.error("Failed to load divisions", e);
      }
    })();
  }, [open]);

  if (!open) return null;

  return (
    <div style={backdropStyle}>
      <div style={modalStyle} className="shadow">
        <h5 className="mb-3">Division Selection</h5>
        <label className="form-label">Select Division</label>
        <select
          className="form-select mb-3"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">— Select —</option>
          {divisions.map(d => (
            <option key={d.id} value={String(d.id)}>{d.name}</option>
          ))}
        </select>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!selectedId}
            onClick={() => onConfirm({ divisionId: Number(selectedId), division: divisions.find(x => String(x.id) === selectedId) })}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple inline styles (or move to CSS)
const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1050
};

const modalStyle = {
  width: 540,
  maxWidth: "95vw",
  background: "white",
  borderRadius: 12,
  padding: 20
};
