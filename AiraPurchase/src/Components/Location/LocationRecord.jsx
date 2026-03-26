import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


/** ---------------- Pagination (inline) ---------------- */

/** ---------------- LocationRecord ---------------- */
function LocationRecord() {
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(7);
  const pageSize = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5181/api/locations', {
          params: { pageNumber: currentPage, pageSize },
        });

        const data = res.data;

        // Robust parsing: support array or wrapped payloads
        const items = Array.isArray(data)
          ? data
          : (data.Items ?? data.items ?? data.results ?? data.data ?? []);

        const total =
          (typeof data.totalItems === 'number' ? data.totalItems : data.TotalItems) ??
          data.total ??
          data.count ??
          (Array.isArray(data) ? data.length : items.length);

        const normalized = items.map((item) => ({
          locationId: item.locationId ?? item.LocationId ?? item.id ?? item.Id,
          locationName: item.locationName ?? item.LocationName ?? '',
          ...item,
        }));

        setLocations(normalized);
        setTotalItems(total);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Error fetching locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      toast.info(`Page ${page}`);
    }
  };

  // Client-side filter only affects table view, not server paging totals
  const filteredLocations = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => (loc.locationName ?? '').toLowerCase().includes(q));
  }, [locations, filter]);

  const rowStart = (currentPage - 1) * pageSize + 1;
  const rowEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="card p-3">
      <h5>Location Master Record</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Filter by location name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="btn btn-primary ms-auto"
          onClick={() => navigate('/dashboard/locationMaster/create')}
        >
          Create New Location
        </button>
      </div>

      {loading ? (
        <div className="text-center my-4">Loading...</div>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Location Name</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc, idx) => (
                  <tr key={loc.locationId ?? idx}>
                    <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td>{loc.locationName}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          toast.success('Redirecting to Edit Page...');
                          setTimeout(() => {
                            navigate(`/dashboard/locationMaster/edit/${loc.locationId}`);
                          }, 700); // Delay in milliseconds (adjust as needed)
                        }}
                      >
                        <i className="bi bi-pencil-fill me-1"></i>
                      </button>
                      {/* <button
                        className="btn btn-sm btn-danger"
                        onClick={() => toast.info('Delete not implemented yet.')}
                      >
                        Delete
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No locations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination + page button count selector */}
          {totalItems > 0 && (
            <div className="d-flex align-items-center justify-content-between mt-3">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                maxPageButtons={maxPageButtons}
              />

              <div className="d-flex align-items-center">
                <label htmlFor="pageLimit" className="me-2 mb-0">
                  Show pages:
                </label>
                <select
                  id="pageLimit"
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={maxPageButtons}
                  onChange={(e) => setMaxPageButtons(Number(e.target.value))}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>
          )}

          {/* Record count */}
          <div className="text-end text-muted mt-2">
            {totalItems > 0 && (
              <>
                Showing <strong>{Math.min(rowStart, totalItems)}–{rowEnd}</strong> of{' '}
                <strong>{totalItems}</strong> records
              </>
            )}
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default LocationRecord;
