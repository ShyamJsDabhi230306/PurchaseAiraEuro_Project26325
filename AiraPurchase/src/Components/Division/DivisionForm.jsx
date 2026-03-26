import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DivisionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state || null;

  const [form, setForm] = useState({
    id: null,
    divisionName: '',
    remarks: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5181/api/division';

  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.divisionName.trim()) {
      alert('Division name is required');
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        await axios.put(`${API_BASE_URL}/${form.id}`, form);
        setSuccessMessage('Division updated successfully!');
      } else {
        await axios.post(API_BASE_URL, form);
        setSuccessMessage('Division created successfully!');
      }

      setTimeout(() => {
        navigate('/dashboard/division/record');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Failed to save division');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-3">
      <h5>{form.id ? 'Update Division' : 'Create Division'}</h5>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="mb-3">
        <label className="form-label">Division Name</label>
        <input
          type="text"
          name="divisionName"
          value={form.divisionName}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Remarks</label>
        <input
          type="text"
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
        {saving ? 'Saving...' : form.id ? 'Update' : 'Create'}
      </button>
    </div>
  );
}

export default DivisionForm;
