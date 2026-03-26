import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function ContractorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contractor, setContractor] = useState({
    contractorName: '',
    isApproved: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`http://localhost:5181/api/contractors/${id}`)
        .then(res => setContractor(res.data))
        .catch(() => setError('Failed to fetch contractor data'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setContractor(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!contractor.contractorName.trim()) {
      setError('Contractor Name is required');
      return;
    }

    try {
      if (id) {
        await axios.put(`http://localhost:5181/api/contractors/${id}`, contractor);
        toast.success('Contractor Updated Succefully')
      } else {
        await axios.post(`http://localhost:5181/api/contractors`, contractor);
          toast.success('Contractor Created Succefully')
      }
      navigate('/dashboard/contractors/record');
    } catch (err) {
      setError('Failed to save contractor');
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="card p-4">
      <h5>{id ? 'Edit Contractor' : 'Create Contractor'}</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Contractor Name</label>
          <input
            type="text"
            className="form-control"
            name="contractorName"
            value={contractor.contractorName}
            onChange={handleChange}
            required
          />
        </div>
        {/* <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="isApproved"
            name="isApproved"
            checked={contractor.isApproved}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isApproved">Is Approved</label>
        </div> */}
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/contractors/record')}>Cancel</button>
          <button type="submit" className="btn btn-primary">{id ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
}

export default ContractorForm;
