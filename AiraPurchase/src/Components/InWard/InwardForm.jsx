import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = 'http://localhost:5181/api';

function InwardForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editId = useMemo(() => {
    const n = Number(id);
    return Number.isNaN(n) ? null : n;
  }, [id]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [formData, setFormData] = useState({
    itemId: '',
    contractorId: '',
    statusId: '',
    createdAt: today,
    isApproved: false,
  });

  const [items, setItems] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [error, setError] = useState('');

  const safeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [itemsRes, contractorsRes, statusesRes] = await Promise.all([
          axios.get(`${API_BASE}/Item`),
          axios.get(`${API_BASE}/Contractors`),
          axios.get(`${API_BASE}/Status`),
        ]);

        setItems(safeArray(itemsRes.data));
        setContractors(safeArray(contractorsRes.data));
        setStatuses(safeArray(statusesRes.data));
      } catch (err) {
        console.error(err);
        setError('Failed to load dropdowns.');
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (!editId) return;
    const fetchRecord = async () => {
      try {
        const res = await axios.get(`${API_BASE}/Inwards/${editId}`);
        const inward = res.data;
        setFormData({
          itemId: String(inward.itemId),
          contractorId: String(inward.contractorId),
          statusId: String(inward.statusId),
          createdAt: inward.createdAt?.split('T')[0] || today,
          isApproved: inward.isApproved ?? false,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch record');
      }
    };
    fetchRecord();
  }, [editId, today]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { itemId, contractorId, statusId, createdAt } = formData;

    if (!itemId || !contractorId || !statusId || !createdAt) {
      setError('Please fill all required fields');
      return;
    }

    const payload = {
      itemId: Number(itemId),
      contractorId: Number(contractorId),
      statusId: Number(statusId),
      createdAt,
      isApproved: formData.isApproved,
      isDeleted: false,
      inwardId: editId || 0,
    };

    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${API_BASE}/Inwards/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE}/Inwards`, payload);
      }
      navigate('/dashboard/inward/record');
    } catch (err) {
      console.error(err);
      setError('Failed to save data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <h5>{editId ? 'Edit Inward' : 'Create New Inward'}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {loadingDropdowns ? (
        <div>Loading dropdowns...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Item</label>
            <select
              className="form-select"
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              required
            >
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item.itemId || item.id} value={item.itemId || item.id}>
                  {item.itemName || item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label>Contractor</label>
            <select
              className="form-select"
              name="contractorId"
              value={formData.contractorId}
              onChange={handleChange}
              required
            >
              <option value="">Select Contractor</option>
              {contractors.map((c) => (
                <option key={c.contractorId || c.id} value={c.contractorId || c.id}>
                  {c.contractorName || c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label>Status</label>
            <select
              className="form-select"
              name="statusId"
              value={formData.statusId}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              {statuses.map((s) => (
                <option key={s.statusId || s.id} value={s.statusId || s.id}>
                  {s.statusName || s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label>Created At</label>
            <input
              type="date"
              name="createdAt"
              className="form-control"
              value={formData.createdAt}
              onChange={handleChange}
              required
              max={today}
              min={today}
            />
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="isApproved"
              name="isApproved"
              checked={formData.isApproved}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="isApproved">Is Approved</label>
          </div>

          <button type="submit" className="btn btn-outline-secondary  d-flex justify-content-end " disabled={loading}>
            {loading ? 'Saving...' : editId ? 'Update' : 'Create'}
          </button>
        </form>
      )}
    </div>
  );
}

export default InwardForm;
