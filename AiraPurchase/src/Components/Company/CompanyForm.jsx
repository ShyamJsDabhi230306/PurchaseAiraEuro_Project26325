import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    companyName: '',
    isApproved: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch data if editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`http://localhost:5181/api/company/${id}`)
        .then(res => {
          const data = res.data;
          setFormData({
            companyName: data.companyName || '',
            isApproved: data.isApproved || false
          });
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load company');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { ...formData };

    try {
      if (id) {
        await axios.put(`http://localhost:5181/api/company/${id}`, {
          ...payload,
          companyId: parseInt(id)
        });
        toast.success('Company updated successfully!');
      } else {
        await axios.post(`http://localhost:5181/api/company`, payload);
        toast.success('Company created successfully!');
      }

      // Wait for toast to be visible before navigating
      setTimeout(() => {
        navigate('/dashboard/companymaster');
      }, 1000); // 1 second delay
    } catch (err) {
      console.error(err);
      toast.error('Failed to save company!');
    }
  };

  if (loading) return <p>Loading company...</p>;

  return (
    <div className="card p-4">
      <h5>{id ? 'Edit Company' : 'Create New Company'}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Company Name</label>
          <input
            type="text"
            className="form-control"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            name="isApproved"
            checked={formData.isApproved}
            onChange={handleChange}
          />
          <label className="form-check-label">Is Approved</label>
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate('/dashboard/companymaster')}
          >
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            {id ? 'Update Company' : 'Create Company'}
          </button>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default CompanyForm;
