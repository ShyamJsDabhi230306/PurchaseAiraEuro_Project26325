import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ContractorRecord() {
  const [contractors, setContractors] = useState([]);
  const [filter, setFilter] = useState('');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(7);
  const pageSize = 10;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchContractors = async () => {
      setFetching(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5181/api/contractors', {
          params: { pageNumber: page, pageSize },
        });

        const data = res.data;

        // Robust parsing (array or wrapped)
        const items = Array.isArray(data)
          ? data
          : (data.items ?? data.Items ?? data.results ?? data.data ?? []);

        const total =
          (typeof data.totalItems === 'number' ? data.totalItems : data.TotalItems) ??
          data.total ??
          data.count ??
          (Array.isArray(data) ? data.length : items.length);

        const normalized = items.map((c) => ({
          contractorId: c.contractorId ?? c.ContractorId ?? c.id ?? c.Id,
          contractorName: c.contractorName ?? c.ContractorName ?? '',
          isApproved: c.isApproved ?? c.IsApproved ?? null,
          createdAt: c.createdAt ?? c.CreatedAt ?? null,
          ...c,
        }));

        setContractors(normalized);
        setTotalItems(total);
      } catch (err) {
        console.error(err);
        setError('Failed to load contractors');
      } finally {
        setFetching(false);
      }
    };

    fetchContractors();
  }, [location.key, page]);

  const onPageChange = (p) => {
    if (p !== page) {
      setPage(p);
      toast.info(`Page ${p}`);
    }
  };

  // Client-side filter (only the visible page’s rows)
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return contractors;
    return contractors.filter((c) => (c.contractorName ?? '').toLowerCase().includes(q));
  }, [contractors, filter]);

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this contractor?');
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:5181/api/contractors/${id}`);
      toast.success('Contractor deleted');
      // reload current page
      setPage((p) => p);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete contractor');
    }
  };

  const rowStart = (page - 1) * pageSize + 1;
  const rowEnd = Math.min(page * pageSize, totalItems);

  return (
    <div className="card p-3">
      <h5>Contractor Master Record</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Top bar: filter + create */}
      <div className="d-flex align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Filter by contractor name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="btn btn-primary ms-auto"
          onClick={() => navigate('/dashboard/contractors/create')}
        >
          Create New Contractor
        </button>
      </div>

      {fetching ? (
        <div className="text-center my-4">Loading...</div>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Contractor Name</th>
                {/* <th>Is Approved</th>
                <th>Created At</th> */}
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c, i) => (
                  <tr key={c.contractorId ?? i}>
                    <td>{(page - 1) * pageSize + i + 1}</td>
                    <td>{c.contractorName}</td>
                    {/* <td>{c.isApproved ? 'Yes' : 'No'}</td>
                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</td> */}
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          toast.success('Redirecting to Edit Page...');
                          setTimeout(() => {
                            navigate(`/dashboard/contractors/edit/${c.contractorId}`);
                          }, 700);
                        }}
                      >
                        <i className="bi bi-pencil-fill me-1"></i>
                      </button>
                      {/* Enable if you want delete */}
                      {/* <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(c.contractorId)}
                      >
                        Delete
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">No contractors found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination + page button count selector (show even for 1 page) */}
          {totalItems > 0 && (
            <div className="d-flex align-items-center justify-content-between mt-3">
              <Pagination
                currentPage={page}
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
                Showing <strong>{Math.min(rowStart, totalItems)}–{rowEnd}</strong> of{' '}
                <strong>{totalItems}</strong> records
              </>
            )}
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default ContractorRecord;
