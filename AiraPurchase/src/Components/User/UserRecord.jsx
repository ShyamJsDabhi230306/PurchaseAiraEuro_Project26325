import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserRecord() {
  const [users, setUsers] = useState([]);
  const [filterUserName, setFilterUserName] = useState('');
  const [filterPersonName, setFilterPersonName] = useState('');
  const [filterCompanyName, setFilterCompanyName] = useState('');
  const [filterUserContact, setFilterUserContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(7);
  const pageSize = 10;

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5181/api/users', {
        params: { pageNumber: currentPage, pageSize },
      });

      const data = res.data;

      // Robust parsing: handle array or wrapped payloads
      const items = Array.isArray(data)
        ? data
        : (data.items ?? data.Items ?? data.results ?? data.data ?? []);

      const total =
        (typeof data.totalItems === 'number' ? data.totalItems : data.TotalItems) ??
        data.total ??
        data.count ??
        (Array.isArray(data) ? data.length : items.length);

      // Normalize common field names
      const normalized = items.map((u) => ({
        id: u.id ?? u.Id ?? u.userId ?? u.UserId,
        userName: u.userName ?? u.UserName ?? '',
        personName: u.personName ?? u.PersonName ?? '',
        userContact: u.userContact ?? u.UserContact ?? u.contact ?? u.Contact ?? '',
        companyName: u.companyName ?? u.CompanyName ?? '',
        userTypeName: u.userTypeName ?? u.UserTypeName ?? u.role ?? u.Role ?? '',
        ...u,
      }));

      setUsers(normalized);
      setTotalItems(total);
    } catch (err) {
      console.error(err);
      setError('Error fetching users');
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, location.key]);

  const onPageChange = (p) => {
    if (p !== currentPage) {
      setCurrentPage(p);
      toast.info(`Page ${p}`);
    }
  };

  // Client-side filters (affect current page’s rows; totals come from server)
  const filteredUsers = useMemo(() => {
    const qUser = filterUserName.trim().toLowerCase();
    const qPerson = filterPersonName.trim().toLowerCase();
    const qCompany = filterCompanyName.trim().toLowerCase();
    const qContact = filterUserContact.trim().toLowerCase();

    return users.filter((u) =>
      (u.userName ?? '').toLowerCase().includes(qUser) &&
      (u.personName ?? '').toLowerCase().includes(qPerson) &&
      (u.companyName ?? '').toLowerCase().includes(qCompany) &&
      (u.userContact ?? '').toLowerCase().includes(qContact)
    );
  }, [users, filterUserName, filterPersonName, filterCompanyName, filterUserContact]);

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this user?');
    if (!ok) return;

    try {
      await axios.delete(`http://localhost:5181/api/users/${id}`);
      toast.success('User deleted');
      // Refresh current page
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('Error deleting user');
      toast.error('Error deleting user');
    }
  };

  const rowStart = (currentPage - 1) * pageSize + 1;
  const rowEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="card p-3">
      <h5>User Master Record</h5>

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
            placeholder="Filter by Person Name"
            value={filterPersonName}
            onChange={(e) => setFilterPersonName(e.target.value)}
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
            placeholder="Filter by Contact"
            value={filterUserContact}
            onChange={(e) => setFilterUserContact(e.target.value)}
          />
        </div>
      </div>

      {/* Create */}
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/users/create')}
        >
          Create New User
        </button>
      </div>

      {loading ? (
        <div className="text-center my-4">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>User Name</th>
                <th>Person Name</th>
                <th>Contact</th>
                <th>Company</th>
                <th>User Type</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={u.id ?? i}>
                  <td>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>{u.userName}</td>
                  <td>{u.personName}</td>
                  <td>{u.userContact || '-'}</td>
                  <td>{u.companyName}</td>
                  <td>{u.userTypeName}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => {
                        toast.success('Redirecting to Edit Page...');
                        setTimeout(() => navigate(`/dashboard/users/edit/${u.id}`), 700);
                      }}
                    >
                      <i className="bi bi-pencil-fill me-1"></i>
                    </button>
                    {/* Enable if you want delete */}
                    {/* <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination + page button count selector (show even for 1 page) */}
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
                Showing <strong>{Math.min(rowStart, totalItems)}–{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
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

export default UserRecord;
