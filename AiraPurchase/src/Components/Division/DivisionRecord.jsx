import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DivisionRecord() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5181/api/division';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_BASE_URL);
        setDivisions(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load divisions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="card p-3">
      <h5>Division Record</h5>

      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/division/create')}
        >
          Create New Division
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && <div className="spinner-border text-primary" role="status" />}

      {!loading && divisions.length > 0 && (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Division Name</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((division, index) => (
              <tr key={division.id}>
                <td>{index + 1}</td>
                <td>{division.divisionName}</td>
                <td>{division.remarks}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() =>
                      navigate('/dashboard/division/create', { state: division })
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && divisions.length === 0 && !error && (
        <div className="alert alert-info">No divisions found.</div>
      )}
    </div>
  );
}

export default DivisionRecord;
