import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE = 'http://localhost:5181/api';

function InwardRecord() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ itemName: '', contractorName: '', statusName: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Inwards`);
      setData(res.data || []);
    } catch (err) {
      setError('Failed to fetch records');
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.key]);

  const filtered = data.filter((d) =>
    d.itemName.toLowerCase().includes(filter.itemName.toLowerCase()) &&
    d.contractorName.toLowerCase().includes(filter.contractorName.toLowerCase()) &&
    d.statusName.toLowerCase().includes(filter.statusName.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${API_BASE}/Inwards/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  return (
    <div className="card p-3">
      <h5>Inward Records</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row mb-3">
        {['itemName', 'contractorName', 'statusName'].map((key) => (
          <div className="col-md-3" key={key}>
            <input
              className="form-control"
              placeholder={`Filter by ${key}`}
              value={filter[key]}
              onChange={(e) => setFilter((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div className="mb-3 text-end">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard/inward/create')}>Create</button>
      </div>
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Contractor</th>
            <th>Status</th>
            {/* <th>Created At</th>
            <th>Approved</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((inward, i) => (
            <tr key={inward.inwardId}>
              <td>{i + 1}</td>
              <td>{inward.itemName}</td>
              <td>{inward.contractorName}</td>
              <td>{inward.statusName}</td>
              {/* <td>{inward.createdAt?.split('T')[0]}</td>
              <td>{inward.isApproved ? 'Yes' : 'No'}</td> */}
              <td>
                <button
                  className="btn btn-sm btn-outline-secondary me-2 px-4  d-flex justify-content-center"
                  onClick={() => navigate(`/dashboard/inward/edit/${inward.inwardId}`)}
                >
                <i className="bi bi-pencil-fill"></i>   
                </button>
                {/* <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(inward.inwardId)}
                >
                  Delete
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InwardRecord;
