import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE = "http://localhost:5181/api";

function InwardOutwardReport() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({
    itemName: "",
    contractorName: "",
    operatorName: "",
    status: "",
    department: "",
    startDate: "",
    endDate: "",
  });
  // choose which date field the range applies to
  const [dateField, setDateField] = useState("inward"); // 'inward' | 'outward'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalize = (item) => ({
    secondInwardId: item?.secondInwardId ?? item?.SecondInwardId,
    inwardDate: item?.inwardDate ?? item?.InwardDate ?? null,
    outwardId: item?.outwardId ?? item?.OutwardId,
    outwardDate: item?.outwardDate ?? item?.OutwardDate ?? null,
    itemName: item?.itemName ?? item?.ItemName ?? "",
    contractorName: item?.contractorName ?? item?.ContractorName ?? "",
    operatorName: item?.operatorName ?? item?.OperatorName ?? "",
    department: item?.department ?? item?.Department ?? "",
    statusName: item?.statusName ?? item?.StatusName ?? "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/SecondInWard/InwardOutwardReport`);
      const raw = Array.isArray(res.data) ? res.data : res.data?.items || res.data?.data || [];
      const normalized = raw.map(normalize);
      setData(normalized);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch InwardOutwardReport data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseDate = (dateStr) => (dateStr ? new Date(dateStr) : null);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // text filters
      if (
        !row.itemName.toLowerCase().includes(filter.itemName.toLowerCase()) ||
        !row.contractorName.toLowerCase().includes(filter.contractorName.toLowerCase()) ||
        !row.operatorName.toLowerCase().includes(filter.operatorName.toLowerCase()) ||
        !row.department.toLowerCase().includes(filter.department.toLowerCase())
      ) return false;

      // status filter
      if (filter.status) {
        const s = filter.status.toLowerCase();
        const rowStatus = (row.statusName || "").toLowerCase();
        if (s === "approved" && rowStatus !== "approved") return false;
        if (s === "not approved" && rowStatus !== "not approved") return false;
      }

      // date range (inward or outward based on selector)
      const chosenDate =
        dateField === "outward" ? parseDate(row.outwardDate) : parseDate(row.inwardDate);
      const start = parseDate(filter.startDate);
      const end = parseDate(filter.endDate);

      if (start && (!chosenDate || chosenDate < start)) return false;
      if (end) {
        // include the whole end day
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (!chosenDate || chosenDate > endOfDay) return false;
      }

      return true;
    });
  }, [data, filter, dateField]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  // ====== EXPORTS ======
  const handleExportExcel = () => {
    if (filteredData.length === 0) return;

    const sheetData = filteredData.map((r, i) => ({
      "#": i + 1,
      "Item Name": r.itemName,
      "Outward Date": formatDate(r.outwardDate),
      "Contractor": r.contractorName,
      "Operator": r.operatorName,
      "Department": r.department,
      "Inward Date": formatDate(r.inwardDate),
      "Status": r.statusName || "-",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Inward-Outward");
    XLSX.writeFile(wb, `InwardOutwardReport_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleExportPDF = () => {
    if (filteredData.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Inward-Outward Report", 14, 14);

    const head = [["#", "Item Name", "Outward Date", "Contractor", "Operator", "Department", "Inward Date", "Status"]];
    const body = filteredData.map((r, i) => [
      i + 1,
      r.itemName,
      formatDate(r.outwardDate),
      r.contractorName,
      r.operatorName,
      r.department,
      formatDate(r.inwardDate),
      r.statusName || "-",
    ]);

    doc.autoTable({
      startY: 20,
      head,
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 40, 40] },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 40 },
        2: { cellWidth: 28 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { cellWidth: 35 },
        6: { cellWidth: 28 },
        7: { cellWidth: 28 },
      },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        doc.setFontSize(9);
        doc.text(
          `Generated: ${new Date().toLocaleString()}`,
          pageWidth - 5,
          pageSize.getHeight() - 5,
          { align: "right" }
        );
      },
    });

    doc.save(`InwardOutwardReport_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="card p-3">
      <h5>Inward-Outward Report</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="row mb-3 g-2">
        {["itemName", "contractorName", "operatorName", "department"].map((key) => (
          <div className="col-md-2" key={key}>
            <input
              className="form-control"
              placeholder={`Filter by ${key.charAt(0).toUpperCase() + key.slice(1)}`}
              value={filter[key]}
              onChange={(e) => setFilter((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </div>
        ))}

        <div className="col-md-2">
          <select
            className="form-select"
            value={filter.status}
            onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="not approved">Not Approved</option>
          </select>
        </div>

        {/* Date field selector + range */}
        <div className="col-md-2">
          <select
            className="form-select"
            value={dateField}
            onChange={(e) => setDateField(e.target.value)}
            title="Which date to filter by"
          >
            <option value="inward">Filter by Inward Date</option>
            <option value="outward">Filter by Outward Date</option>
          </select>
        </div>

        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            placeholder="Start Date"
            value={filter.startDate}
            onChange={(e) => setFilter((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            placeholder="End Date"
            value={filter.endDate}
            onChange={(e) => setFilter((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      {/* Export buttons */}
      <div className="d-flex gap-2 mb-2">
        <button className="btn btn-success btn-sm" onClick={handleExportExcel}>
          Download Excel
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleExportPDF}>
          Download PDF
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>Outward Date</th>
            <th>Contractor</th>
            <th>Operator</th>
            <th>Department</th>
            <th>Inward Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8}>Loading…</td></tr>
          ) : filteredData.length === 0 ? (
            <tr><td colSpan={8}>No records found.</td></tr>
          ) : (
            filteredData.map((row, idx) => (
              <tr key={row.secondInwardId ?? idx}>
                <td>{idx + 1}</td>
                <td>{row.itemName}</td>
                <td>{row.outwardDate ? new Date(row.outwardDate).toLocaleDateString() : "-"}</td>
                <td>{row.contractorName}</td>
                <td>{row.operatorName}</td>
                <td>{row.department}</td>
                <td>{row.inwardDate ? new Date(row.inwardDate).toLocaleDateString() : "N/A"}</td>
                <td>{row.statusName || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InwardOutwardReport;
