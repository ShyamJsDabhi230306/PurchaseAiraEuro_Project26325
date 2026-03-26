import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function PartyAccountForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const editData = location.state;

  const [form, setForm] = useState({
    partyACName: '',
    contactPerson: '',
    address: '',
    whatsAppNo: '',
    emailID: '',
    panNo: '',
    gstNo: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5181/api/PartyAccountsApi';

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else if (paramId) {
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/${paramId}`)
        .then((res) => {
          setForm(res.data);
        })
        .catch(() => setError('Failed to load data for editing'))
        .finally(() => setLoading(false));
    }
  }, [editData, paramId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.partyACName.trim()) {
      alert('Party Name is required');
      return;
    }

    setSaving(true);
    try {
      if (paramId) {
        await axios.put(`${API_BASE_URL}/${paramId}`, form);
        setSuccessMessage('Party Account updated successfully!');
      } else {
        await axios.post(API_BASE_URL, form);
        setSuccessMessage('Party Account created successfully!');
      }

      setTimeout(() => {
        navigate('/dashboard/partyaccountmaster/record');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Failed to save Party Account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="card p-3">
      <h5>{paramId ? 'Update Party Account' : 'Create Party Account'}</h5>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="mb-3">
        <label className="form-label">Party Name</label>
        <input
          type="text"
          name="partyACName"
          value={form.partyACName}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Contact Person</label>
        <input
          type="text"
          name="contactPerson"
          value={form.contactPerson}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Address</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">WhatsApp No</label>
        <input
          type="text"
          name="whatsAppNo"
          value={form.whatsAppNo}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email ID</label>
        <input
          type="email"
          name="emailID"
          value={form.emailID}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">PAN No</label>
        <input
          type="text"
          name="panNo"
          value={form.panNo}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">GST No</label>
        <input
          type="text"
          name="gstNo"
          value={form.gstNo}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? 'Saving...' : paramId ? 'Update' : 'Create'}
      </button>
    </div>
  );
}

export default PartyAccountForm;
