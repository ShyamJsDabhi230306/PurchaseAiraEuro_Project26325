import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PartyAccountRecord() {
    const [records, setRecords] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:5181/api/PartyAccountsApi';

    useEffect(() => {
        const fetchRecords = async () => {
            setFetching(true);
            try {
                const response = await axios.get(API_BASE_URL);
                setRecords(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load Party Accounts');
            } finally {
                setFetching(false);
            }
        };
        fetchRecords();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                setRecords((prev) => prev.filter((rec) => rec.id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete the record');
            }
        }
    };

    return (
        <div className="card p-3">
            <h5>Party Account Records</h5>
            {error && <div className="alert alert-danger">{error}</div>}

            <button
                className="btn btn-primary mb-2 w-25  "
                onClick={() => navigate('/dashboard/partyaccountmaster/create')}
            >
                + Add New
            </button>

            {fetching ? (
                <p>Loading...</p>
            ) : records.length === 0 ? (
                <p>No records found.</p>
            ) : (
                <table className="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Party Name</th>
                            <th>Address</th>
                            <th>Contact</th>
                            <th>Email</th>
                            <th>PAN</th>
                            <th>GST</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.partyACName}</td>
                                <td>{item.address}</td>
                                <td>{item.contactPerson}</td>
                                <td>{item.emailID}</td>
                                <td>{item.panNo}</td>
                                <td>{item.gstNo}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-secondary me-2"
                                        onClick={() =>navigate(`/dashboard/partyaccountmaster/edit/${item.id}`)}  // fixed here
                                    >
                                        Edit
                                    </button>
                                    {/* <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Delete
                                    </button> */}
                                </td>
                            </tr>
                        ))}


                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PartyAccountRecord;
