import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../Pagination/Pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:5181/api";

function OutWardRecord() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState({
    itemName: "",
    contractorName: "",
    operatorName: "",
    statusName: "",
    departmentName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(7);
  const pageSize = 10;

  const navigate = useNavigate();
  const location = useLocation();

  const normalize = (item) => ({
    outWardId: item?.OutWardId ?? item?.outWardId ?? item?.Id ?? item?.id,
    itemId: item?.ItemId ?? item?.itemId ?? null,
    contractorId:
      item?.ContractorId ?? item?.contractorId ?? null,
    operatorId:
      item?.OperatorId ??
      item?.operatorId ??
      item?.UserId ??
      item?.userId ??
      null,
    statusId: item?.StatusId ?? item?.statusId ?? null,
    departmentId: item?.DepartmentId ?? item?.departmentId ?? null,
    itemName: item?.ItemName ?? item?.itemName ?? "",
    contractorName:
      item?.ContractorName ?? item?.contractorName ?? "",
    operatorName:
      item?.OperatorName ??
      item?.operatorName ??
      item?.PersonName ??
      item?.personName ??
      "",
    statusName: item?.StatusName ?? item?.statusName ?? "",
    departmentName:
      item?.DepartmentName ?? item?.departmentName ?? "",
    isApproved:
      (item?.IsApproved ?? item?.isApproved ?? false) === true,
    issueDate: item?.CreatedAt ?? item?.createdAt ?? null,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/OutWards`, {
        params: { pageNumber: currentPage, pageSize },
      });

      const data = res.data;
      const items = Array.isArray(data)
        ? data
        : data.items ?? data.Items ?? data.results ?? data.data ?? [];
      const total =
        (typeof data.totalItems === "number"
          ? data.totalItems
          : data.TotalItems) ??
        data.total ??
        data.count ??
        (Array.isArray(data) ? data.length : items.length);

      const normalized = items
        .map(normalize)
        .filter((x) => x.outWardId != null);

      setRows(normalized);
      setTotalItems(total);
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setError("Failed to fetch records");
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData, location.key]);

  // We apply filtering *before* slicing for current page
  const filteredRows = useMemo(() => {
    const f = {
      itemName: filter.itemName.trim().toLowerCase(),
      contractorName: filter.contractorName.trim().toLowerCase(),
      operatorName: filter.operatorName.trim().toLowerCase(),
      statusName: filter.statusName.trim().toLowerCase(),
      departmentName: filter.departmentName.trim().toLowerCase(),
    };

    return rows.filter((o) => {
      return (
        (o.itemName ?? "").toLowerCase().includes(f.itemName) &&
        (o.contractorName ?? "").toLowerCase().includes(
          f.contractorName
        ) &&
        (o.operatorName ?? "").toLowerCase().includes(f.operatorName) &&
        (o.statusName ?? "").toLowerCase().includes(f.statusName) &&
        (o.departmentName ?? "")
          .toLowerCase()
          .includes(f.departmentName)
      );
    });
  }, [rows, filter]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageRows = filteredRows.slice(startIdx, endIdx);

  const onPageChange = (p) => {
    if (p !== currentPage) {
      setCurrentPage(p);
      toast.info(`Page ${p}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${API_BASE}/OutWards/${id}`);
      toast.success("OutWard deleted");
      // After delete, refetch page
      fetchData();
    } catch (err) {
      console.error("Failed to delete record:", err);
      setError("Failed to delete record");
      toast.error("Failed to delete record");
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const s = String(iso);
    return s.includes("T") ? s.split("T")[0] : s.substring(0, 10);
  };

  const rowStart = (safePage - 1) * pageSize + 1;
  const rowEnd = Math.min(safePage * pageSize, totalFiltered);

  return (
    <div className="card p-3">
      <h5>OutWard Records</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="row mb-3">
        {[
          "itemName",
          "contractorName",
          "operatorName",
          "statusName",
          "departmentName",
        ].map((key) => (
          <div className="col-md-2 mb-2" key={key}>
            <input
              className="form-control"
              placeholder={`Filter by ${key.replace("Name", "")}`}
              value={filter[key] ?? ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
            />
          </div>
        ))}
      </div>

      {/* Create New */}
      <div className="d-flex justify-content-end mb-2">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/dashboard/outward/create")}
        >
          Create New OutWard
        </button>
      </div>

      {loading ? (
        <div className="text-center my-4">Loading…</div>
      ) : pageRows.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Item</th>
                <th>Contractor</th>
                <th>Operator</th>
                <th>Status</th>
                <th>Department</th>
                <th>Issue Date</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((o, i) => (
                <tr key={o.outWardId}>
                  <td>{rowStart + i}</td>
                  <td>{o.itemName}</td>
                  <td>{o.contractorName}</td>
                  <td>{o.operatorName}</td>
                  <td>{o.statusName}</td>
                  <td>{o.departmentName}</td>
                  <td>{formatDate(o.issueDate)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() =>
                        navigate(`/dashboard/outward/edit/${o.outWardId}`)
                      }
                      title="Edit"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(o.outWardId)}
                      title="Delete"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalFiltered > pageSize && (
            <div className="d-flex align-items-center justify-content-between mt-3">
              <Pagination
                currentPage={safePage}
                totalItems={totalFiltered}
                pageSize={pageSize}
                onPageChange={onPageChange}
                maxPageButtons={maxPageButtons}
              />

              <div className="text-muted">
                Showing{" "}
                <strong>
                  {rowStart}–{rowEnd}
                </strong>{" "}
                of <strong>{totalFiltered}</strong> records
              </div>
            </div>
          )}
        </>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default OutWardRecord;
