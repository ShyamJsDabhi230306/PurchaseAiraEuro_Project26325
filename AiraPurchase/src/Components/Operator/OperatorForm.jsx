import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = 'http://localhost:5181/api';

function OperatorForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editId = useMemo(() => {
    if (!id) return null;
    const n = Number(id);
    return Number.isNaN(n) ? null : n;
  }, [id]);

  const [formData, setFormData] = useState({
    operatorName: '',
    operatorContact: '',
    contractorId: '',
    isApproved: false,
  });

  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [error, setError] = useState('');

  // Safe data helper
  const safeData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  // Fetch contractors dropdown
  useEffect(() => {
    const fetchContractors = async () => {
      setLoadingDropdowns(true);
      try {
        const res = await axios.get(`${API_BASE}/Contractors`);
        setContractors(safeData(res.data));
      } catch {
        setError('Failed to load contractors.');
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchContractors();
  }, []);

  // Fetch existing operator if editing
  useEffect(() => {
    if (!editId) return;
    const fetchOperator = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/Operator/${editId}`);
        const data = res.data;
        setFormData({
          operatorName: data.operatorName || data.OperatorName || '',
          operatorContact: data.operatorContact || data.OperatorContact || '',
          contractorId: String(data.contractorId || data.ContractorId || ''),
          isApproved: data.isApproved || data.IsApproved || false,
        });
        setError('');
      } catch {
        setError('Failed to load operator.');
      } finally {
        setLoading(false);
      }
    };
    fetchOperator();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.operatorName || !formData.operatorContact || !formData.contractorId) {
      setError('Please fill all required fields.');
      return;
    }

    const payload = {
      operatorName: formData.operatorName,
      operatorContact: formData.operatorContact,
      contractorId: parseInt(formData.contractorId, 10),
      isApproved: formData.isApproved,
      createdAt: undefined, // Let server handle this
    };

    if (Number.isNaN(payload.contractorId)) {
      setError('Invalid contractor selection.');
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${API_BASE}/Operator/${editId}`, { operatorId: editId, ...payload });
      } else {
        await axios.post(`${API_BASE}/Operator`, payload);
      }
      navigate('/dashboard/operator/record');
    } catch (err) {
      console.error(err);
      setError('Save failed: ' + (err?.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <h5 className="mb-3">{editId ? 'Edit Operator' : 'Create New Operator'}</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Operator Name</label>
          <input
            type="text"
            name="operatorName"
            value={formData.operatorName}
            onChange={handleChange}
            className="form-control"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Operator Contact</label>
          <input
            type="text"
            name="operatorContact"
            value={formData.operatorContact}
            onChange={handleChange}
            className="form-control"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contractor</label>
          <select
            name="contractorId"
            value={formData.contractorId}
            onChange={handleChange}
            className="form-select"
            required
            disabled={loading || loadingDropdowns}
          >
            <option value="">Select Contractor</option>
            {contractors.map((c) => (
              <option key={c.contractorId || c.id} value={String(c.contractorId || c.id)}>
                {c.contractorName || c.name}
              </option>
            ))}
          </select>
        </div>
{/* 
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            name="isApproved"
            checked={formData.isApproved}
            onChange={handleChange}
            id="isApproved"
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="isApproved">
            Is Approved
          </label>
        </div> */}

        <button type="submit" className="btn btn-outline-secondary" disabled={loading}>
          {loading ? 'Saving...' : editId ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
}

export default OperatorForm;
