import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const API_BASE = "http://localhost:5181/api";

function SecondInWardForm() {
  const navigate = useNavigate();
  const { id } = useParams();                 // edit id (optional)
  const [search] = useSearchParams();         // read ?outWardId=...

  const editId = useMemo(() => {
    const n = Number(id);
    return Number.isNaN(n) ? null : n;
  }, [id]);

  const preselectOutWardId = search.get("outWardId"); // from queue's Inward button

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [formData, setFormData] = useState({
    outWardId: "",
    statusId: "",
    isApproved: false,
    createdAt: today,
  });

  const [outwards, setOutwards] = useState([]); // for dropdown (1 item when preselected)
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeList = (data) =>
    Array.isArray(data) ? data : data?.items ?? data?.data ?? data?.results ?? [];

  const isPendingName = (name) => /^\s*pend(i)?ng\s*$/i.test(String(name ?? ""));

  // load dropdowns
  useEffect(() => {
    (async () => {
      try {
        // 1) Statuses (exclude Pending)
        const statusRes = await axios.get(`${API_BASE}/Status`);
        const rawStatuses = safeList(statusRes.data);
        const filteredStatuses = rawStatuses.filter((s) => !isPendingName(s.statusName));
        setStatuses(filteredStatuses);

        // 2) OutWard(s)
        // If we were launched from the queue with ?outWardId=, only load THAT record
        // (so the dropdown has exactly one option and is locked).
        if (!editId && preselectOutWardId) {
          // Try to fetch a single outward; if your API has /OutWards/{id}, use it,
          // otherwise fallback to /OutWards and filter client-side.
          let one;
          try {
            const ow = await axios.get(`${API_BASE}/OutWards/${preselectOutWardId}`);
            one = ow.data
              ? [ow.data]
              : [];
          } catch {
            const all = await axios.get(`${API_BASE}/OutWards`);
            const list = safeList(all.data);
            one = list.filter(
              (o) =>
                String(o.outWardId ?? o.OutWardId ?? o.id ?? o.Id) ===
                String(preselectOutWardId)
            );
          }

          setOutwards(one);
          if (one.length > 0) {
            setFormData((prev) => ({ ...prev, outWardId: String(preselectOutWardId) }));
          }
        } else {
          // Edit mode or direct create without param: load all (still works)
          const outwardRes = await axios.get(`${API_BASE}/OutWards`);
          setOutwards(safeList(outwardRes.data));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dropdowns");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectOutWardId, editId]);

  // load record in edit mode
  useEffect(() => {
    if (!editId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/SecondInWard/${editId}`);
        const d = res.data || {};
        setFormData({
          outWardId: String(d.outWardId ?? ""),
          statusId: String(d.statusId ?? ""),
          isApproved: !!d.isApproved,
          createdAt: d.createdAt?.split("T")[0] || today,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load record");
      } finally {
        setLoading(false);
      }
    })();
  }, [editId, today]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.outWardId || !formData.statusId || !formData.createdAt) {
      setError("Please fill all required fields");
      return;
    }

    const payload = {
      outWardId: parseInt(formData.outWardId, 10),
      statusId: parseInt(formData.statusId, 10),
      isApproved: formData.isApproved,
      createdAt: formData.createdAt,
      secondInwardId: editId ?? 0,
    };

    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${API_BASE}/SecondInWard/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE}/SecondInWard`, payload);
      }
      navigate("/dashboard/secondinward/record");
    } catch (err) {
      console.error(err);
      setError("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const outwardLocked = !!preselectOutWardId || !!editId; // lock dropdown when preselected or editing

  return (
    <div className="card p-4">
      <h5>{editId ? "Edit Second InWard" : "Create Second InWard"}</h5>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* OutWard (preselected & locked when coming from the queue) */}
        <div className="mb-3">
          <label className="form-label">ItemName</label>
          <select
            className="form-select"
            name="outWardId"
            value={formData.outWardId}
            onChange={handleChange}
            required
            disabled={outwardLocked}   // ← lock it so user can’t change
          >
            <option value="">OutWard ItemName</option>
            {outwards.map((o) => (
              <option key={o.outWardId ?? o.OutWardId ?? o.id} value={o.outWardId ?? o.OutWardId ?? o.id}>
                {o.itemName ?? o.ItemName}
              </option>
            ))}
          </select>
          {!outwardLocked && (
            <small className="text-muted">Tip: If you came from the queue, this would be preselected.</small>
          )}
        </div>

        {/* Status (user changes this only) */}
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            name="statusId"
            value={formData.statusId}
            onChange={handleChange}
            required
          >
            <option value="">Select Status</option>
            {statuses.map((s) => (
              <option key={s.statusId} value={s.statusId}>
                {s.statusName}
              </option>
            ))}
          </select>
        </div>

        {/* Date: today, locked */}
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            name="createdAt"
            value={formData.createdAt}
            onChange={handleChange}
            required
            min={today}
            max={today}
            disabled           // ← keep it today and read-only
          />
        </div>

        <button className="btn btn-outline-secondary" type="submit" disabled={loading}>
          {loading ? "Saving..." : editId ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
}

export default SecondInWardForm;
