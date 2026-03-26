import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = 'http://localhost:5181/api/PartyAccountsApi';

function PartyAccountMaster({ activeTabProp, onTabChange }) {
  const [activeTab, setActiveTab] = useState(activeTabProp || 'party-record');
  const [partyAccounts, setPartyAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  // Form state with backend matching property names
  const [partyACName, setPartyACName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');
  const [whatsAppNo, setWhatsAppNo] = useState('');
  const [emailID, setEmailID] = useState('');
  const [pANNo, setPANNo] = useState('');
  const [gSTNo, setGSTNo] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPartyAccounts();
  }, []);

  useEffect(() => {
    setActiveTab(activeTabProp);
  }, [activeTabProp]);

  // Fetch all party accounts
  const fetchPartyAccounts = async () => {
    try {
      const response = await axios.get(apiUrl);
      setPartyAccounts(response.data);
      setFilteredAccounts(response.data);
      setMessage('');
    } catch (error) {
      console.error('Error fetching party accounts:', error);
      setMessage('Error fetching party accounts');
    }
  };

  // Filter list by search term
  useEffect(() => {
    const filtered = partyAccounts.filter((account) =>
      [
        account.PartyACName,
        account.ContactPerson,
        account.Address,
        account.WhatsAppNo,
        account.EmailID,
        account.PANNo,
        account.GSTNo,
      ]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredAccounts(filtered);
  }, [searchTerm, partyAccounts]);

  const resetForm = () => {
    setPartyACName('');
    setContactPerson('');
    setAddress('');
    setWhatsAppNo('');
    setEmailID('');
    setPANNo('');
    setGSTNo('');
    setEditingId(null);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!partyACName.trim()) {
      alert('Please enter Party AC Name');
      return;
    }

    const payload = {
      PartyACName: partyACName,
      ContactPerson: contactPerson,
      Address: address,
      WhatsAppNo: whatsAppNo,
      EmailID: emailID,
      PANNo: pANNo,
      GSTNo: gSTNo,
    };

    try {
      if (editingId === null) {
        // Create
        await axios.post(apiUrl, payload);
        setMessage('Party account created successfully');
      } else {
        // Update
        await axios.put(`${apiUrl}/${editingId}`, { id: editingId, ...payload });
        setMessage('Party account updated successfully');
      }

      resetForm();
      fetchPartyAccounts();
      onTabChange('party-record');
    } catch (error) {
      console.error('Error saving party account:', error);
      setMessage('Error saving party account');
    }
  };

  const handleEdit = (account) => {
    setEditingId(account.id);
    setPartyACName(account.PartyACName);
    setContactPerson(account.ContactPerson);
    setAddress(account.Address);
    setWhatsAppNo(account.WhatsAppNo);
    setEmailID(account.EmailID);
    setPANNo(account.PANNo);
    setGSTNo(account.GSTNo);
    setMessage('');
    onTabChange('party-create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this party account?')) return;

    try {
      await axios.delete(`${apiUrl}/${id}`);
      setMessage('Party account deleted successfully');
      fetchPartyAccounts();
    } catch (error) {
      console.error('Error deleting party account:', error);
      setMessage('Error deleting party account');
    }
  };

  return (
    <div className="container-fluid mt-4 p-4  rounded" style={{ minHeight: '100vh' }}>
      <h4>Party Account Master</h4>

      {message && <div className="alert alert-info">{message}</div>}

      {activeTab === 'party-record' && (
        <>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search by any field..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <table className="table table-bordered ">
            <thead>
              <tr>
                <th>#</th>
                <th>Party AC Name</th>
                <th>Contact Person</th>
                <th>Address</th>
                <th>WhatsApp No</th>
                <th>Email ID</th>
                <th>PAN No</th>
                <th>GST No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No party accounts found
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account, idx) => (
                  <tr key={account.id}>
                    <td>{idx + 1}</td>
                    <td>{account.PartyACName}</td>
                    <td>{account.ContactPerson}</td>
                    <td>{account.Address}</td>
                    <td>{account.WhatsAppNo}</td>
                    <td>{account.EmailID}</td>
                    <td>{account.PANNo}</td>
                    <td>{account.GSTNo}</td>
                    <td>
                      <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(account)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(account.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'party-create' && (
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label htmlFor="partyACName" className="form-label">
              Party AC Name
            </label>
            <input
              id="partyACName"
              type="text"
              className="form-control"
              placeholder="Enter Party AC Name"
              value={partyACName}
              onChange={(e) => setPartyACName(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="contactPerson" className="form-label">
              Contact Person
            </label>
            <input
              id="contactPerson"
              type="text"
              className="form-control"
              placeholder="Enter Contact Person"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>

          <div className="col-md-12">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <textarea
              id="address"
              className="form-control"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="whatsAppNo" className="form-label">
              WhatsApp No
            </label>
            <input
              id="whatsAppNo"
              type="text"
              className="form-control"
              placeholder="Enter WhatsApp No"
              value={whatsAppNo}
              onChange={(e) => setWhatsAppNo(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="emailID" className="form-label">
              Email ID
            </label>
            <input
              id="emailID"
              type="email"
              className="form-control"
              placeholder="Enter Email ID"
              value={emailID}
              onChange={(e) => setEmailID(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="pANNo" className="form-label">
              PAN No
            </label>
            <input
              id="pANNo"
              type="text"
              className="form-control"
              placeholder="Enter PAN No"
              value={pANNo}
              onChange={(e) => setPANNo(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="gSTNo" className="form-label">
              GST No
            </label>
            <input
              id="gSTNo"
              type="text"
              className="form-control"
              placeholder="Enter GST No"
              value={gSTNo}
              onChange={(e) => setGSTNo(e.target.value)}
            />
          </div>

          <div className="col-md-12 d-flex justify-content-start mt-3">
            <button type="submit" className="btn btn-primary me-2">
              {editingId === null ? 'Save' : 'Update'}
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => {
                resetForm();
                onTabChange('party-record');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PartyAccountMaster;
