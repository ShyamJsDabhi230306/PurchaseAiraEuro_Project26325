import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../Pagination/Pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:5181/api";

const asNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const asStr = (v, d = "") => (v == null ? d : String(v));

function SecondInWardRecord() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState({
    itemName: "",
    contractorName: "",
    operatorName: "",
    statusName: "",
    departmentName: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(7);
  const pageSize = 10;

  const navigate = useNavigate();
  const location = useLocation();

  const normalize = (o) => ({
    outWardId: asNum(o.outWardId ?? o.OutWardId ?? o.id ?? o.Id),
    itemName:
      o.itemName ?? o.ItemName ?? o.item?.itemName ?? o.Item?.ItemName ?? "",
    contractorName:
      o.contractorName ??
      o.ContractorName ??
      o.contractor?.contractorName ??
      "",
    operatorName:
      o.operatorName ?? o.OperatorName ?? o.operators?.operatorName ?? "",
    departmentName:
      o.departmentName ??
      o.DepartmentName ??
      o.department?.departmentName ??
      "",
    statusName: o.statusName ?? o.StatusName ?? o.status?.statusName ?? "",
    createdAt: o.createdAt ?? o.CreatedAt ?? null,
  });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/OutWards/PendingForInward`, {
        params: { pageNumber: currentPage, pageSize },
      });

      const data = res.data;
      const items = Array.isArray(data) ? data : data.items ?? [];
      const total =
        (typeof data.totalItems === "number" ? data.totalItems : items.length);

      setRows(items.map(normalize).filter((r) => r.outWardId != null));
      setTotalItems(total);
    } catch (err) {
      console.error(err);
      setError("Failed to load queue");
      toast.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue, location.key]);

  const onPageChange = (p) => {
    if (p !== currentPage) setCurrentPage(p);
  };

  const filtered = useMemo(() => {
    const f = {
      itemName: filter.itemName.trim().toLowerCase(),
      contractorName: filter.contractorName.trim().toLowerCase(),
      operatorName: filter.operatorName.trim().toLowerCase(),
      statusName: filter.statusName.trim().toLowerCase(),
      departmentName: filter.departmentName.trim().toLowerCase(),
    };
    return rows.filter(
      (r) =>
        asStr(r.itemName).toLowerCase().includes(f.itemName) &&
        asStr(r.contractorName).toLowerCase().includes(f.contractorName) &&
        asStr(r.operatorName).toLowerCase().includes(f.operatorName) &&
        asStr(r.statusName).toLowerCase().includes(f.statusName) &&
        asStr(r.departmentName).toLowerCase().includes(f.departmentName)
    );
  }, [rows, filter]);

  const formatDate = (dt) => {
    if (!dt) return "";
    const s = String(dt);
    return s.includes("T") ? s.split("T")[0] : s.substring(0, 10);
  };

  const rowStart = (currentPage - 1) * pageSize + 1;
  const rowEnd = rowStart + filtered.length - 1;

  return (
    <div className="card p-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h4 className="mb-0">📄 Pending OutWards (Inward Queue)</h4>

     
        
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* filters */}
      <div className="row g-2 mb-3">
        {["itemName", "contractorName", "operatorName", "departmentName", "statusName"].map(
          (key) => (
            <div className="col-md-2" key={key}>
              <input
                className="form-control"
                placeholder={`Filter by ${key.replace("Name", "")}`}
                value={filter[key]}
                onChange={(e) => setFilter((p) => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          )
        )}
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th style={{ width: 60 }}>#</th>
            <th>Item</th>
            <th>Contractor</th>
            <th>Operator</th>
            <th>Department</th>
            <th>Status</th>
            <th>Outward Date</th>
            <th style={{ width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="text-center">Loading…</td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center">No pending outwards.</td>
            </tr>
          ) : (
            filtered.map((r, i) => (
              <tr key={r.outWardId}>
                <td>{rowStart + i}</td>
                <td>{r.itemName}</td>
                <td>{r.contractorName}</td>
                <td>{r.operatorName}</td>
                <td>{r.departmentName}</td>
                <td>{r.statusName}</td>
                <td>{formatDate(r.createdAt)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      navigate(
                        `/dashboard/secondinward/create?outWardId=${encodeURIComponent(r.outWardId)}`
                      )
                    }
                    title="Inward this item"
                  >
                    <i className="bi bi-cart me-1" />
                    Inward
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalItems > 0 && (
        <div className="d-flex align-items-center justify-content-between mt-3">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            maxPageButtons={maxPageButtons}
          />
          <div className="d-flex align-items-center">
            {/* <label htmlFor="pageLimit" className="me-2 mb-0">Page buttons:</label>
            <select
              id="pageLimit"
              className="form-select"
              style={{ width: "auto" }}
              value={maxPageButtons}
              onChange={(e) => setMaxPageButtons(Number(e.target.value))}
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={10}>10</option>
            </select> */}
          </div>
        </div>
      )}

      <div className="text-end text-muted mt-2">
        {filtered.length > 0 && (
          <>
            Showing <strong>{rowStart}–{rowEnd}</strong> of <strong>{filtered.length}</strong> in queue
          </>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default SecondInWardRecord;
