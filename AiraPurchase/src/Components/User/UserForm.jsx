import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const userTypesUrl = 'http://localhost:5181/api/UserTypes';
const companiesUrl = 'http://localhost:5181/api/Company';

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    personName: '',
    userName: '',
    password: '',
    userContact: '',        // ✅ NEW FIELD
    allowLogin: false,
    isApproved: false,
    isDeleted: false,
    companyId: '',
    userTypeId: '',
  });

  const [userTypes, setUserTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(userTypesUrl)
      .then(res => {
        setUserTypes(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error('Error fetching user types', err));

    axios.get('http://localhost:5181/api/company', { params: { pageNumber: 1, pageSize: 100 }})
    .then(res => setCompanies(res.data))
    .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    axios.get(`http://localhost:5181/api/users/${id}`)
      .then(res => {
        const data = res.data;
        setFormData({
          personName: data.personName || '',
          userName: data.userName || '',
          userContact: data.userContact || '', // ✅ LOAD FROM API
          password: '',
          allowLogin: data.allowLogin || false,
          isApproved: data.isApproved || false,
          isDeleted: data.isDeleted || false,
          companyId: data.companyId != null ? data.companyId.toString() : '',
          userTypeId: data.userTypeId != null ? data.userTypeId.toString() : '',
        });
      })
      .catch(err => {
        setError('Failed to load user data');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const companyIdNum = parseInt(formData.companyId, 10);
    const userTypeIdNum = parseInt(formData.userTypeId, 10);

    if (isNaN(companyIdNum) || companyIdNum <= 0) {
      setError('Please select a valid Company');
      return;
    }
    if (isNaN(userTypeIdNum) || userTypeIdNum <= 0) {
      setError('Please select a valid User Type');
      return;
    }

    const payload = {
      personName: formData.personName,
      userName: formData.userName,
      userContact: formData.userContact || null, // ✅ SEND TO API
      allowLogin: formData.allowLogin,
      isApproved: formData.isApproved,
      isDeleted: formData.isDeleted,
      companyId: companyIdNum,
      userTypeId: userTypeIdNum,
      ...(formData.password.trim() !== '' && { password: formData.password }),
    };

    try {
      if (id) {
        payload.userId = Number(id);
        await axios.put(`http://localhost:5181/api/User/${id}`, payload);
        toast.success("User Created Successfully")
      } else {
        await axios.post('http://localhost:5016/api/User', payload);
          toast.success("User Updated Successfully")
      }
      navigate('/dashboard/users/record');
    } catch (err) {
      console.error('Error saving user', err);
    
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  if (loading) return <p>Loading user data…</p>;

  return (
    <div className="card p-4">
      <h5>{id ? 'Edit User' : 'Create New User'}</h5>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Person Name */}
        <div className="mb-3">
          <label className="form-label">Person Name</label>
          <input
            type="text"
            className="form-control"
            name="personName"
            value={formData.personName}
            onChange={handleChange}
            required
          />
        </div>

        {/* User Name */}
        <div className="mb-3">
          <label className="form-label">User Name</label>
          <input
            type="text"
            className="form-control"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
            placeholder='Enter UserName'
          />
        </div>

        {/* ✅ User Contact */}
        <div className="mb-3">
          <label className="form-label">User Contact</label>
          <input
            type="text"
            className="form-control"
            name="userContact"
            value={formData.userContact}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">{id ? 'Change Password (optional)' : 'Password'}</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            {...(!id && { required: true })}
          />
        </div>

        {/* Company dropdown */}
      <div className="mb-3">
  <label className="form-label">Company</label>
  <select
    className="form-select"
    name="companyId"
    value={formData.companyId}
    onChange={handleChange}
    required
  >
    <option value="">Select Company</option>
    {(companies.items ?? []).map(c => (
      <option
        key={c.companyId}
        value={c.companyId?.toString() || ''}
        disabled={c.companyId == null}
      >
        {c.companyName || 'Unnamed Company'}
      </option>
    ))}
  </select>
</div>


        {/* User Type dropdown */}
        <div className="mb-3">
          <label className="form-label">User Type</label>
          <select
            className="form-select"
            name="userTypeId"
            value={formData.userTypeId}
            onChange={handleChange}
            required
          >
            <option value="">Select User Type</option>
            {userTypes.map(ut => (
              <option
                key={ut.userTypeId}
                value={ut.userTypeId?.toString() || ''}
                disabled={ut.userTypeId == null}
              >
                {ut.typeName || 'Unnamed Type'}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        {/* <div className="form-check mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="allowLogin"
            name="allowLogin"
            checked={formData.allowLogin}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="allowLogin">Allow Login</label>
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
        </div> */}

        {/* Submit & Cancel Buttons */}
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard/users/record')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {id ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;
