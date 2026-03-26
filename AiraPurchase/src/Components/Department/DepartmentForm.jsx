// DepartmentForm.jsx (patched)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DepartmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    departmentName: '',
    locationId: ''
  });

  const [locations, setLocations] = useState([]); // normalized: [{id, name}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // helpers
  const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.Items)) return payload.Items;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };
  const normalizeLocations = (arr) =>
    arr.map((l) => ({
      id: l.locationId ?? l.LocationId ?? l.id ?? l.Id,
      name: l.locationName ?? l.LocationName ?? l.name ?? l.Name ?? 'Unnamed Location',
    })).filter(l => l.id != null);

  // TRY MULTIPLE "GET BY ID" ROUTES UNTIL ONE WORKS
  const fetchDepartmentById = async (deptId) => {
    const base = 'http://localhost:5181/api';
    const candidates = [
      `${base}/Department/${deptId}`,         // typical REST: GET /Department/{id}
      `${base}/department/${deptId}`,         // lowercase controller
      `${base}/Department/Get/${deptId}`,     // named action: Get
      `${base}/Department/GetById/${deptId}`, // named action: GetById
      // query-based
      { url: `${base}/Department`, params: { id: deptId } },
      { url: `${base}/department`, params: { id: deptId } },
    ];

    let lastErr;
    for (const c of candidates) {
      try {
        const res = typeof c === 'string'
          ? await axios.get(c)
          : await axios.get(c.url, { params: c.params });
        return res.data ?? {};
      } catch (e) {
        lastErr = e;
        // keep trying next candidate
      }
    }
    throw lastErr ?? new Error('No matching GET route for Department by id');
  };

  // Fetch locations once
  useEffect(() => {
    axios.get('http://localhost:5181/api/locations', { params: { pageNumber: 1, pageSize: 1000 } })
      .then(res => setLocations(normalizeLocations(getItems(res.data))))
      .catch(e => {
        console.error('Failed to load locations', e);
        toast.error('Failed to load locations');
        setError('Failed to load locations');
      });
  }, []);

  // Fetch existing department (edit)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const d = await fetchDepartmentById(id);
        if (cancelled) return;

        const departmentName = d.departmentName ?? d.DepartmentName ?? '';
        const locationId = d.locationId ?? d.LocationId ?? '';

        setFormData({
          departmentName,
          locationId: locationId !== '' ? String(locationId) : '',
        });
      } catch (e) {
        console.error('Failed to load department', e);
        toast.error('Failed to load department (405 usually means wrong GET route).');
        setError('Failed to load department');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.departmentName.trim() || !formData.locationId) {
      toast.warning('All fields are required');
      return;
    }

    const payload = {
      departmentName: formData.departmentName.trim(),
      locationId: parseInt(formData.locationId, 10),
    };

    try {
      if (id) {
        // PUT is correct for update; your backend must expose [HttpPut("{id}")]
        await axios.put(`http://localhost:5181/api/Department/${id}`, payload);
        toast.success('Department updated successfully');
      } else {
        await axios.post(`http://localhost:5181/api/Department`, payload);
        toast.success('Department created successfully');
      }
      setTimeout(() => navigate('/dashboard/departmentMaster/record'), 1000);
    } catch (err) {
      console.error('Error saving department:', err?.response?.data || err?.message);
      toast.error('Error saving department: ' + (err?.response?.data?.message || err?.message));
      setError('Error saving department');
    }
  };

  if (loading) return <p>Loading department...</p>;

  return (
    <div className="card p-4">
      <h5>{id ? 'Edit Department' : 'Create Department'}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Department Name</label>
          <input
            type="text"
            className="form-control"
            name="departmentName"
            value={formData.departmentName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <select
            className="form-select"
            name="locationId"
            value={formData.locationId}
            onChange={handleChange}
            required
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={String(loc.id)}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard/departmentMaster/record')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {id ? 'Update' : 'Create'}
          </button>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default DepartmentForm;
