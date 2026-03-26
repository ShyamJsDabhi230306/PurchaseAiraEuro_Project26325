import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CompanyRecord() {
  const [companies, setCompanies] = useState([]);
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
    const fetchCompanies = async () => {
      setFetching(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5181/api/company', {
          params: { pageNumber: page, pageSize },
        });

        const data = res.data;

        // Normalize response to handle different APIs
        const items = Array.isArray(data)
          ? data
          : (data.items ?? data.Items ?? data.results ?? data.data ?? []);

        const total =
          (typeof data.totalItems === 'number' ? data.totalItems : data.TotalItems) ??
          data.total ??
          data.count ??
          (Array.isArray(data) ? data.length : items.length);

        const normalized = items.map((c) => ({
          companyId: c.companyId ?? c.CompanyId ?? c.id ?? c.Id,
          companyName: c.companyName ?? c.CompanyName ?? '',
          ...c,
        }));

        setCompanies(normalized);
        setTotalItems(total);
      } catch (err) {
        console.error(err);
        setError('Failed to load companies');
      } finally {
        setFetching(false);
      }
    };

    fetchCompanies();
  }, [location.key, page]);

  const onPageChange = (p) => {
    if (p !== page) {
      setPage(p);
      toast.info(`Page ${p}`);
    }
  };

  // Client-side filter
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => (c.companyName ?? '').toLowerCase().includes(q));
  }, [companies, filter]);

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this company?');
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:5181/api/company/${id}`);
      toast.success('Company deleted');
      setPage((p) => p); // Refresh page data
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete company');
    }
  };

  const rowStart = (page - 1) * pageSize + 1;
  const rowEnd = Math.min(page * pageSize, totalItems);

  return (
    <div className="card p-3">
      <h5>Company Master Record</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Top bar: filter + create */}
      <div className="d-flex align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Filter by company name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="btn btn-primary ms-auto"
          onClick={() => navigate('/dashboard/companymaster/create')}
        >
          Create New Company
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
                <th>Company Name</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((company, i) => (
                  <tr key={company.companyId ?? i}>
                    <td>{(page - 1) * pageSize + i + 1}</td>
                    <td>{company.companyName}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          toast.success('Redirecting to Edit Page...');
                          setTimeout(() => {
                            navigate(`/dashboard/companymaster/edit/${company.companyId}`);
                          }, 700);
                        }}
                      >
                        <i className="bi bi-pencil-fill me-1"></i> Edit
                      </button>

                      {/* Uncomment if delete is needed */}
                      {/* <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(company.companyId)}
                      >
                        Delete
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No companies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination + page button count selector */}
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
                <label htmlFor="pageLimit" className="me-2 mb-0">
                  Show pages:
                </label>
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

export default CompanyRecord;
