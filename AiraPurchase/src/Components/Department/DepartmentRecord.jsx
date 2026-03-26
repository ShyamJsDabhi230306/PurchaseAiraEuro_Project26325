// DepartmentRecord.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:5181/api';
const ENDPOINT = `${API_BASE}/Department`;
const PAGE_SIZE = 10;

function DepartmentRecord() {
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(7);

  const navigate = useNavigate();
  const location = useLocation();

  // read API response in a robust way (array or envelope)
  const readEnvelope = (data) => {
    // If backend returns a plain array: use it directly
    if (Array.isArray(data)) {
      return { items: data, totalItems: data.length };
    }
    // Common envelope shapes
    const items =
      data?.items ??
      data?.Items ??
      data?.results ??
      data?.data ??
      data?.Data ??
      [];
    const total =
      (typeof data?.totalItems === 'number' ? data.totalItems : data?.TotalItems) ??
      data?.total ??
      data?.count ??
      (Array.isArray(items) ? items.length : 0);
    return { items: Array.isArray(items) ? items : [], totalItems: Number(total) || 0 };
  };

  const normalize = (d) => ({
    id: d?.id ?? d?.Id ?? d?.departmentId ?? d?.DepartmentId,
    departmentName: d?.departmentName ?? d?.DepartmentName ?? '',
    locationName: d?.locationName ?? d?.LocationName ?? '',
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(ENDPOINT, {
        // if your API supports pagination, these will be used,
        // otherwise they will be ignored by the server and we'll still handle the array
        params: { pageNumber: currentPage, pageSize: PAGE_SIZE },
      });

      // DEBUG if needed:
      // console.log('Departments API response:', res.data);

      const { items, totalItems } = readEnvelope(res.data);
      const normalized = items
        .map(normalize)
        .filter((x) => x.id != null); // keep only valid ids

      setDepartments(normalized);
      setTotalItems(Number.isFinite(totalItems) ? totalItems : normalized.length);
    } catch (err) {
      console.error(err);
      setError('Error fetching departments');
      toast.error('Error fetching departments');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments, location.key]);

  const onPageChange = (p) => {
    if (p !== currentPage) {
      setCurrentPage(p);
      toast.info(`Page ${p}`);
    }
  };

  const filteredDepartments = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) => (d.departmentName ?? '').toLowerCase().includes(q));
  }, [departments, filter]);

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this department?');
    if (!ok) return;
    try {
      // NOTE: keep casing consistent with your GET endpoint
      await axios.delete(`${ENDPOINT}/${id}`);
      toast.success('Department deleted');
      fetchDepartments(); // refresh current page
    } catch (err) {
      console.error(err);
      setError('Error deleting department');
      toast.error('Error deleting department');
    }
  };

  // rows numbering is based on current page from the server
  const rowStart = (currentPage - 1) * PAGE_SIZE + 1;
  const rowEnd = Math.min(currentPage * PAGE_SIZE, totalItems);

  return (
    <div className="card p-3">
      <h5>Department Master Record</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Filter by Department Name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="btn btn-primary ms-auto"
          onClick={() => navigate('/dashboard/departmentMaster/create')}
        >
          Create New Department
        </button>
      </div>

      {loading ? (
        <div className="text-center my-4">Loading...</div>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Department Name</th>
                <th>Location Name</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((d, idx) => (
                  <tr key={d.id ?? idx}>
                    <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td>{d.departmentName}</td>
                    <td>{d.locationName}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          toast.success('Redirecting to Edit Page...');
                          setTimeout(() => {
                            navigate(`/dashboard/departmentMaster/edit/${d.id}`);
                          }, 700);
                        }}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-fill me-1"></i>
                      </button>

                      {/* Enable if you want delete in UI */}
                      {/* <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(d.id)}
                        title="Delete"
                      >
                        Delete
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalItems > 0 && (
            <div className="d-flex align-items-center justify-content-between mt-3">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
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

export default DepartmentRecord;
