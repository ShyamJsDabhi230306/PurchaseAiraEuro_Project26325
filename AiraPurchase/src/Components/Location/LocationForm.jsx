// src/pages/locations/LocationForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LocationForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    locationName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    axios.get(`http://localhost:5181/api/locations/${id}`)
      .then(res => {
        setFormData({ locationName: res.data.locationName });
      })
      
      .catch(() => setError('Failed to load location'))
      .finally(() => setLoading(false));
  }, [id]);
  //  toast.success('Location Get successfully!');

  const handleChange = (e) => {
    setFormData({ ...formData, locationName: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.locationName.trim()) {
      setError('Location Name is required');
      return;
    }

    try {
      if (id) {
        await axios.put(`http://localhost:5181/api/locations/${id}`, {
          locationId: parseInt(id),
          locationName: formData.locationName
        });
         toast.success('Location updated successfully!');
      } else {
        await axios.post(`http://localhost:5181/api/locations`, {
          locationName: formData.locationName
        });
         toast.success('Location created successfully!');
      }

      navigate('/dashboard/locationMaster/record');
    } catch (err) {
      console.error(err);
      setError('Error saving location');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="card p-4">
      <h5>{id ? 'edit' : 'create'}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Location Name</label>
          <input
            type="text"
            className="form-control"
            name="locationName"
            value={formData.locationName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard/locationMaster/record')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {id ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LocationForm;  