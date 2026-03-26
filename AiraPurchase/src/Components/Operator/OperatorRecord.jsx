import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:5181/api';

function OperatorRecord() {
  const [operators, setOperators] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [filterContractor, setFilterContractor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(7);
  const pageSize = 10;

  const navigate = useNavigate();
  const location = useLocation();

  const fetchOperators = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/Operator`, {
        params: { pageNumber: currentPage, pageSize },
      });

      const data = res.data;

      // Accept both array and paged object shapes
      const items = Array.isArray(data)
        ? data
        : (data.items ?? data.Items ?? data.results ?? data.data ?? []);

      const total =
        (typeof data.totalItems === 'number' ? data.totalItems : data.TotalItems) ??
        data.total ??
        data.count ??
        (Array.isArray(data) ? data.length : items.length);

      // Normalize fields (handles casing/id variants)
      const normalized = items
        .map((it) => ({
          operatorId: it.operatorId ?? it.OperatorId ?? it.id ?? it.Id,
          operatorName: it.operatorName ?? it.OperatorName ?? '',
          operatorContact: it.operatorContact ?? it.OperatorContact ?? '',
          contractorId: it.contractorId ?? it.ContractorId ?? null,
          contractorName: it.contractorName ?? it.ContractorName ?? '',
          isApproved: it.isApproved ?? it.IsApproved ?? false,
          createdAt: it.createdAt ?? it.CreatedAt ?? null,
          ...it,
        }))
        .filter((x) => x.operatorId != null);

      setOperators(normalized);
      setTotalItems(total);
    } catch (err) {
      console.error(err);
      setError('Error fetching operators');
      toast.error('Error fetching operators');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators, location.key]);

  const onPageChange = (p) => {
    if (p !== currentPage) {
      setCurrentPage(p);
      toast.info(`Page ${p}`);
    }
  };

  // Client-side filter (affects current page only)
  const filtered = useMemo(() => {
    const qName = filterName.trim().toLowerCase();
    const qContact = filterContact.trim().toLowerCase();
    const qContractor = filterContractor.trim().toLowerCase();

    return operators.filter(
      (o) =>
        (o.operatorName ?? '').toLowerCase().includes(qName) &&
        (o.operatorContact ?? '').toLowerCase().includes(qContact) &&
        (o.contractorName ?? '').toLowerCase().includes(qContractor)
    );
  }, [operators, filterName, filterContact, filterContractor]);

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this operator?');
    if (!ok) return;
    try {
      await axios.delete(`${API_BASE}/Operator/${id}`);
      toast.success('Operator deleted');
      // reload current page
      setCurrentPage((p) => p);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete operator');
      toast.error('Failed to delete operator');
    }
  };

  const rowStart = (currentPage - 1) * pageSize + 1;
  const rowEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="card p-3">
      <h5>Operator Master Record</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters + Create */}
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <input
            className="form-control"
            placeholder="Filter by operator name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <input
            className="form-control"
            placeholder="Filter by contact"
            value={filterContact}
            onChange={(e) => setFilterContact(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <input
            className="form-control"
            placeholder="Filter by contractor"
            value={filterContractor}
            onChange={(e) => setFilterContractor(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end mb-2">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/operator/create')}
        >
          Create New Operator
        </button>
      </div>

      {loading ? (
        <div className="text-center my-4">Loading operators...</div>
      ) : filtered.length === 0 ? (
        <p>No operators found.</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Operator Name</th>
                <th>Contact</th>
                <th>Contractor</th>
                {/* <th>Approved</th> */}
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.operatorId ?? i}>
                  <td>{rowStart + i}</td>
                  <td>{o.operatorName}</td>
                  <td>{o.operatorContact}</td>
                  <td>{o.contractorName}</td>
                  {/* <td>{o.isApproved ? 'Yes' : 'No'}</td> */}
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => {
                        toast.success('Redirecting to Edit Page...');
                        setTimeout(() => navigate(`/dashboard/operator/edit/${o.operatorId}`), 700);
                      }}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    {/* Enable if you want delete */}
                    {/* <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(o.operatorId)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination + page button count selector */}
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
                <label htmlFor="pageLimit" className="me-2 mb-0">Show pages:</label>
                <select
                  id="pageLimit"
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={maxPageButtons}
                  onChange={(e) => setMaxPageButtons(Number(e.target.value))}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>
          )}

          {/* Record count */}
          <div className="text-end text-muted mt-2">
            {totalItems > 0 && (
              <>
                Showing <strong>{rowStart}–{rowEnd}</strong> of <strong>{totalItems}</strong> records
              </>
            )}
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default OperatorRecord;
