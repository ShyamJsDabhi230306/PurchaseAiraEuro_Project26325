import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserRightsRecord() {
  const [rights, setRights] = useState([]);
  const [filterUserName, setFilterUserName] = useState('');
  const [filterCompanyName, setFilterCompanyName] = useState('');
  const [filterLocationName, setFilterLocationName] = useState('');
  const [filterDepartmentName, setFilterDepartmentName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(7);
  const pageSize = 10;

  const navigate = useNavigate();
  const location = useLocation();

  const fetchRights = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5181/api/UserRights', {
        params: { pageNumber: currentPage, pageSize },
      });

      const data = res.data;

      // Handle response format: array or paged object
      const items = Array.isArray(data)
        ? data
        : (data.items ?? data.Items ?? data.results ?? data.data ?? []);

      const total =
        (typeof data.totalItems === 'number' ? data.totalItems : data.TotalItems) ??
        data.total ??
        data.count ??
        (Array.isArray(data) ? data.length : items.length);

      // Normalize common field names (case-insensitive)
      const normalized = items.map((r) => ({
        userRightsId: r.userRightsId ?? r.UserRightsId ?? r.id ?? r.Id,
        userId: r.userId ?? r.UserId,
        userName: r.userName ?? r.UserName ?? '',
        companyId: r.companyId ?? r.CompanyId,
        companyName: r.companyName ?? r.CompanyName ?? '',
        locationId: r.locationId ?? r.LocationId,
        locationName: r.locationName ?? r.LocationName ?? '',
        departmentId: r.departmentId ?? r.DepartmentId,
        departmentName: r.departmentName ?? r.DepartmentName ?? '',
        isApproved: r.isApproved ?? r.IsApproved ?? false,
        ...r,
      }));

      setRights(normalized);
      setTotalItems(total);
    } catch (err) {
      console.error(err);
      setError('Error fetching user rights');
      toast.error('Error fetching user rights');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRights();
  }, [fetchRights, location.key]);

  const onPageChange = (p) => {
    if (p !== currentPage) {
      setCurrentPage(p);
      toast.info(`Page ${p}`);
    }
  };

  // Client-side filtering (only affects current page data)
  const filteredRights = useMemo(() => {
    const qUser = filterUserName.trim().toLowerCase();
    const qCompany = filterCompanyName.trim().toLowerCase();
    const qLocation = filterLocationName.trim().toLowerCase();
    const qDepartment = filterDepartmentName.trim().toLowerCase();

    return rights.filter((r) =>
      (r.userName ?? '').toLowerCase().includes(qUser) &&
      (r.companyName ?? '').toLowerCase().includes(qCompany) &&
      (r.locationName ?? '').toLowerCase().includes(qLocation) &&
      (r.departmentName ?? '').toLowerCase().includes(qDepartment)
    );
  }, [rights, filterUserName, filterCompanyName, filterLocationName, filterDepartmentName]);

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this user right?');
    if (!ok) return;

    try {
      await axios.delete(`http://localhost:5181/api/UserRights/${id}`);
      toast.success('User right deleted');
      fetchRights();
    } catch (err) {
      console.error(err);
      setError('Failed to delete user right');
      toast.error('Failed to delete user right');
    }
  };

  const rowStart = (currentPage - 1) * pageSize + 1;
  const rowEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="card p-3">
      <h5>User Rights Master Record</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by User Name"
            value={filterUserName}
            onChange={(e) => setFilterUserName(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Company"
            value={filterCompanyName}
            onChange={(e) => setFilterCompanyName(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Location"
            value={filterLocationName}
            onChange={(e) => setFilterLocationName(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Department"
            value={filterDepartmentName}
            onChange={(e) => setFilterDepartmentName(e.target.value)}
          />
        </div>
      </div>

      {/* Create button */}
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/userrights/create')}
        >
          Create New User Right
        </button>
      </div>

      {loading ? (
        <div className="text-center my-4">Loading user rights...</div>
      ) : filteredRights.length === 0 ? (
        <p>No user rights found.</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>User Name</th>
                <th>Company</th>
                <th>Location</th>
                <th>Department</th>
                {/* Uncomment if needed */}
                {/* <th>Is Approved</th> */}
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRights.map((r, i) => (
                <tr key={r.userRightsId ?? i}>
                  <td>{rowStart + i}</td>
                  <td>{r.userName}</td>
                  <td>{r.companyName}</td>
                  <td>{r.locationName}</td>
                  <td>{r.departmentName}</td>
                  {/* Uncomment if needed */}
                  {/* <td>{r.isApproved ? 'Yes' : 'No'}</td> */}
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => {
                        toast.success('Redirecting to Edit Page...');
                        setTimeout(() => navigate(`/dashboard/userrights/edit/${r.userRightsId}`), 700);
                      }}
                    >
                      <i className="bi bi-pencil-fill me-1"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(r.userRightsId)}
                    >
                      <i className="bi bi-trash-fill me-1"></i>
                    </button>
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

export default UserRightsRecord;
