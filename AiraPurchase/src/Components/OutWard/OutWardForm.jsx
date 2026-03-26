import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:5181/api';

function OutWardForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const editId = useMemo(() => {
        if (!id) return null;
        const n = Number(id);
        return Number.isNaN(n) ? null : n;
    }, [id]);

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    const [formData, setFormData] = useState({
        itemId: '',
        contractorId: '',
        operatorId: '',
        statusId: '',  // used only for edit
        departmentId: '',
        isApproved: false,
        issueDate: today,
    });

    const [items, setItems] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [operators, setOperators] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);
    const [error, setError] = useState('');

    const safeData = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.result)) return data.result;
        if (Array.isArray(data.data)) return data.data;
        return [];
    };

    const pick = (obj, keys) => {
        for (const k of keys) {
            if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return undefined;
    };

    // Fetch dropdown data once on mount
    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoadingDropdowns(true);
            try {
                const [
                    itemsRes,
                    contractorsRes,
                    operatorsRes,
                    statusesRes,
                    departmentsRes,
                ] = await Promise.all([
                    axios.get(`${API_BASE}/GetItemDropdown`),
                    axios.get(`${API_BASE}/Contractors`),
                    axios.get(`${API_BASE}/Operator`),
                    axios.get(`${API_BASE}/Status`),
                    axios.get(`${API_BASE}/Department`),
                ]);

                setItems(safeData(itemsRes.data));
                setContractors(safeData(contractorsRes.data));
                setOperators(safeData(operatorsRes.data));
                setStatuses(safeData(statusesRes.data));
                setDepartments(safeData(departmentsRes.data));
            } catch (err) {
                console.error(err);
                setError('Failed to load dropdowns.');
                toast.error('Failed to load dropdowns');
            } finally {
                setLoadingDropdowns(false);
            }
        };

        fetchDropdowns();
    }, []);

    // Fetch the record if editing
    useEffect(() => {
        if (!editId) return;

        const fetchRecord = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/OutWards`);
                const all = safeData(res.data);
                const found = all.find((o) => o.outWardId === editId);

                if (!found) {
                    setError('Record not found.');
                    return;
                }

                setFormData({
                    itemId: String(found.itemId ?? ''),
                    contractorId: String(found.contractorId ?? ''),
                    operatorId: String(found.operatorId ?? ''),
                    statusId: String(found.statusId ?? ''),
                    departmentId: String(found.departmentId ?? ''),
                    isApproved: !!found.isApproved,
                    issueDate: found.issueDate ? String(found.issueDate).split('T')[0] : today,
                });
            } catch (err) {
                console.error(err);
                setError('Failed to load record.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecord();
    }, [editId, today]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const required = ['itemId', 'contractorId', 'operatorId', 'departmentId', 'issueDate'];
        for (const key of required) {
            if (!formData[key]) {
                setError('Please fill all required fields.');
                return;
            }
        }

        if (!operators.some(op => String(pick(op, ['operatorId', 'id'])) === formData.operatorId)) {
            setError('Selected Operator does not exist.');
            return;
        }

        const payload = {
            itemId: parseInt(formData.itemId, 10),
            contractorId: parseInt(formData.contractorId, 10),
            operatorId: parseInt(formData.operatorId, 10),
            ...(editId && { statusId: parseInt(formData.statusId, 10) }),
            departmentId: parseInt(formData.departmentId, 10),
            isApproved: formData.isApproved,
            issueDate: formData.issueDate,
        };

        if (
            [payload.itemId, payload.contractorId, payload.operatorId, payload.departmentId].some(Number.isNaN) ||
            (editId && Number.isNaN(payload.statusId))
        ) {
            setError('Invalid dropdown selection.');
            return;
        }

        setLoading(true);
        try {
            if (editId) {
                await axios.put(`${API_BASE}/OutWards/${editId}`, payload);
            } else {
                await axios.post(`${API_BASE}/OutWards`, payload);
            }
            navigate('/dashboard/outward/record');
        } catch (err) {
            console.error(err);
            setError('Save failed: ' + (err?.response?.data || err.message));
            toast.error('Save failed: ' + (err?.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Dropdown config, show Status dropdown only when editing
    const dropdowns = [
        { label: 'Item', name: 'itemId', options: items, valueKeys: ['itemId', 'id'], labelKeys: ['itemName', 'name'] },
        {
            label: 'Contractor',
            name: 'contractorId',
            options: contractors,
            valueKeys: ['contractorId', 'id'],
            labelKeys: ['contractorName', 'name'],
        },
        {
            label: 'Operator',
            name: 'operatorId',
            options: operators,
            valueKeys: ['operatorId', 'id'],
            labelKeys: ['operatorName', 'name'],
        },
        ...(editId
            ? [{
                label: 'Status',
                name: 'statusId',
                options: statuses,
                valueKeys: ['statusId', 'id'],
                labelKeys: ['statusName', 'name'],
            }]
            : []),
        {
            label: 'Department',
            name: 'departmentId',
            options: departments,
            valueKeys: ['departmentId', 'id'],
            labelKeys: ['departmentName', 'name'],
        },
    ];

    const renderSelect = ({ label, name, options, valueKeys, labelKeys }) => (
        <div className="mb-3" key={name}>
            <label className="form-label">{label}</label>
            <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading || loadingDropdowns}
            >
                <option value="">Select {label}</option>
                {(options || []).map((opt, idx) => {
                    const val = pick(opt, valueKeys);
                    const lbl = pick(opt, labelKeys);
                    if (val === undefined || lbl === undefined) return null;
                    return (
                        <option key={String(val) + '-' + idx} value={String(val)}>
                            {lbl}
                        </option>
                    );
                })}
            </select>
        </div>
    );

    return (
        <div className="card p-4">
            <h5 className="mb-3">{editId ? 'Edit OutWard' : 'Create New OutWard'}</h5>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                {dropdowns.map(renderSelect)}

                <div className="mb-3">
                    <label className="form-label">Issue Date</label>
                    <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                        min={today}
                        max={today}
                        disabled
                    />
                </div>

                <button type="submit" className="btn btn-outline-secondary" disabled={loading}>
                    {loading ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
            </form>
        </div>
    );
}

export default OutWardForm;
