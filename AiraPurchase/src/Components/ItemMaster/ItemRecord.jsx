import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const productTypes = [
  { id: 1, label: 'Againest Order' },
  { id: 2, label: 'Consumable' },
];

function ItemRecord() {
  const [items, setItems] = useState([]);
  const [filterProductType, setFilterProductType] = useState('');
  const [filterItemName, setFilterItemName] = useState('');
  const [filterModelCode, setFilterModelCode] = useState('');
  const [filterItemStatus, setFilterItemStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPageButtons, setMaxPageButtons] = useState(23);
  const pageSize = 12;

  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5181/api/item', {
        params: { pageNumber: currentPage, pageSize },
      });

      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : (data.items ?? data.Items ?? data.results ?? data.data ?? []);
      const total =
        (typeof data.totalItems === 'number' ? data.totalItems : data.TotalItems) ??
        data.total ?? data.count ?? (Array.isArray(data) ? data.length : list.length);

      const normalized = list.map((it) => {
        const id = it.id ?? it.Id ?? it.itemId ?? it.ItemId;
        const productTypeRaw = it.productType ?? it.ProductType ?? it.type ?? it.Type;
        const productTypeNum = productTypeRaw != null ? Number(productTypeRaw) : undefined;

        return {
          id,
          productType: isNaN(productTypeNum) ? productTypeRaw : productTypeNum,
          itemName: it.itemName ?? it.ItemName ?? '',
          modelCode: it.modelCode ?? it.ModelCode ?? '',
          itemStatusName: it.itemStatusName ?? it.ItemStatusName ?? it.statusName ?? it.StatusName ?? '',
          date: it.date ?? it.Date ?? it.createdAt ?? it.CreatedAt ?? null,
          ...it,
        };
      });

      setItems(normalized);
      setTotalItems(total);
      toast.success('Items loaded successfully');
    } catch (err) {
      console.error(err);
      setError('Error fetching items');
      toast.error('Error fetching items');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onPageChange = (p) => {
    if (p !== currentPage) {
      setCurrentPage(p);
      toast.info(`Page ${p}`);
    }
  };

  // Filter logic
  const filteredItems = useMemo(() => {
    const nameQuery = filterItemName.trim().toLowerCase();
    const modelQuery = filterModelCode.trim().toLowerCase();
    const statusQuery = filterItemStatus.trim().toLowerCase();
    const dateQuery = filterDate.trim();
    const productTypeQuery = filterProductType;

    return items.filter((item) => {
      const matchType =
        productTypeQuery === '' || String(item.productType) === productTypeQuery;
      const matchName =
        item.itemName.toLowerCase().includes(nameQuery);
      const matchModel =
        item.modelCode.toLowerCase().includes(modelQuery);
      const matchStatus =
        item.itemStatusName?.toLowerCase().includes(statusQuery);
      const matchDate =
        dateQuery === '' || (item.date && item.date.startsWith(dateQuery));

      return matchType && matchName && matchModel && matchStatus && matchDate;
    });
  }, [
    items,
    filterProductType,
    filterItemName,
    filterModelCode,
    filterItemStatus,
    filterDate,
  ]);

  const formatDate = (iso) => {
    if (!iso) return '';
    const s = String(iso);
    return s.includes('T') ? s.split('T')[0] : s.substring(0, 10);
  };

  const typeLabel = (val) => {
    const id = Number(val);
    return productTypes.find((pt) => pt.id === id)?.label || 'Unknown';
  };

  const rowStart = (currentPage - 1) * pageSize + 1;
  const rowEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="card p-3">
      <h5>Item Master Record</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters + Create */}
      <div className="row mb-3">
        <div className="col-md-2">
          <label>Product Type</label>
          <select
            className="form-control"
            value={filterProductType}
            onChange={(e) => setFilterProductType(e.target.value)}
          >
            <option value="">All</option>
            {productTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label>Item Name</label>
          <input
            type="text"
            className="form-control"
            value={filterItemName}
            onChange={(e) => setFilterItemName(e.target.value)}
            placeholder="Search by name"
          />
        </div>

        <div className="col-md-2">
          <label>Model Code</label>
          <input
            type="text"
            className="form-control"
            value={filterModelCode}
            onChange={(e) => setFilterModelCode(e.target.value)}
            placeholder="Search model"
          />
        </div>

        <div className="col-md-2">
          <label>Item Status</label>
          <input
            type="text"
            className="form-control"
            value={filterItemStatus}
            onChange={(e) => setFilterItemStatus(e.target.value)}
            placeholder="Search status"
          />
        </div>

        <div className="col-md-2">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-primary w-100"
            onClick={() => navigate('/dashboard/itemmaster/create')}
          >
            Create New Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-4">Loading items...</div>
      ) : filteredItems.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Product Type</th>
                <th>Item Name</th>
                <th>Model Code</th>
                <th>Item Status</th>
                <th>Date</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, i) => (
                <tr key={item.id ?? i}>
                  <td>{rowStart + i}</td>
                  <td>{typeLabel(item.productType)}</td>
                  <td>{item.itemName}</td>
                  <td>{item.modelCode}</td>
                  <td>{item.itemStatusName || 'N/A'}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        toast.success('Redirecting to Edit Page...');
                        setTimeout(() => navigate(`/dashboard/itemmaster/edit/${item.id}`), 700);
                      }}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex align-items-center justify-content-between mt-3">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
              maxPageButtons={maxPageButtons}
            />

            <div className="d-flex align-items-center">
              <label htmlFor="pageLimit" className="me-2 mb-0">Show pages:</label>
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

          <div className="text-end text-muted mt-2">
            {totalItems > 0 && (
              <>Showing <strong>{rowStart}–{rowEnd}</strong> of <strong>{totalItems}</strong> records</>
            )}
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default ItemRecord;
