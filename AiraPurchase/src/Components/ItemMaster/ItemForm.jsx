import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const productTypes = [
  { id: 1, label: 'Againest Order' },
  { id: 2, label: 'Consumable' },
];

function ItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    productType: '',
    itemName: '',
    modelCode: '',
    itemStatusId: '', // status ID selected
    date: '',         // date string in YYYY-MM-DD
  });

  const [itemStatuses, setItemStatuses] = useState([]); // for dropdown
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  // Fetch item statuses on mount
  useEffect(() => {
    const fetchStatuses = async () => {
      setLoadingStatuses(true);
      try {
        // Fix: Correct API endpoint case
        const res = await axios.get('http://localhost:5181/api/StatusForItem');
        // Filter out deleted statuses
        setItemStatuses(res.data.filter(status => !status.isDeleted));
      } catch (err) {
        setError('Failed to load item statuses');
        console.error(err);
      } finally {
        setLoadingStatuses(false);
      }
    };
    fetchStatuses();
  }, []);

  // Fetch item details if editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`http://localhost:5181/api/Item/${id}`)
        .then(res => {
          const data = res.data;
          setFormData({
            productType: data.productType?.toString() || '',
            itemName: data.itemName || '',
            modelCode: data.modelCode || '',
            itemStatusId: data.itemStatusId?.toString() || '',
            date: data.date ? data.date.split('T')[0] : '', // format ISO date to yyyy-mm-dd
          });
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load item data');
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const dataToSend = {
      ...formData,
      productType: Number(formData.productType),
      itemStatusId: formData.itemStatusId ? Number(formData.itemStatusId) : null,
      date: formData.date,
      ...(id && { id: Number(id) }),
    };

    try {
      if (id) {
        await axios.put(`http://localhost:5181/api/Item/${id}`, dataToSend, {
          headers: { 'Content-Type': 'application/json' }
        });
        toast.success("Item Updated Successfully");
      } else {
        await axios.post(`http://localhost:5181/api/Item`, dataToSend, {
          headers: { 'Content-Type': 'application/json' }
        });
        toast.success("Item Created Successfully");

      }
      navigate('/dashboard/itemmaster');
    } catch (err) {
      if (err.response?.data) {
        setError('Failed to save item: ' + JSON.stringify(err.response.data));
      } else {
        setError('Failed to save item');
      }
    }
  };

  if (loading || loadingStatuses) return <p>Loading...</p>;

  return (
    <div className="card p-4">
      <h5>{id ? 'Edit Item' : 'Create New Item'}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Product Type</label>
          <select
            className="form-select"
            name="productType"
            value={formData.productType}
            onChange={handleChange}
            required
          >
            <option value="">Select Product Type</option>
            {productTypes.map(pt => (
              <option key={pt.id} value={pt.id}>{pt.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Item Name</label>
          <input
            type="text"
            className="form-control"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Model Code</label>
          <input
            type="text"
            className="form-control"
            name="modelCode"
            value={formData.modelCode}
            onChange={handleChange}
            required
          />
        </div>

        {/* Item Status Select */}
        <div className="mb-3">
          <label className="form-label">Item Status</label>
          <select
            className="form-select"
            name="itemStatusId"
            value={formData.itemStatusId}
            onChange={handleChange}
            required
          >
            <option value="">Select Item Status</option>
            {itemStatuses.map(status => (
              <option key={status.itemStatusId} value={status.itemStatusId}>
                {status.itemStatusName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard/itemmaster')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {id ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ItemForm;
