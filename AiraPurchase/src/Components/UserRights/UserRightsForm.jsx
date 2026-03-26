import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const usersUrl = 'http://localhost:5181/api/users';
const companiesUrl = 'http://localhost:5181/api/company';
const locationsUrl = 'http://localhost:5181/api/locations';
const departmentsUrl = 'http://localhost:5181/api/Department';

function normalizeItems(payload) {
    // Accepts: array OR { items / Items / results / data } OR anything with a sensible list
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.items)) return payload.items;
    if (payload && Array.isArray(payload.Items)) return payload.Items;
    if (payload && Array.isArray(payload.results)) return payload.results;
    if (payload && Array.isArray(payload.data)) return payload.data;
    // Sometimes APIs return paged shape with PageData etc.
    if (payload && Array.isArray(payload.pageData)) return payload.pageData;
    return [];
}

function normalizeId(x) {
    return x?.id ?? x?.Id ?? x?.userId ?? x?.UserId ?? x?.departmentId ?? x?.DepartmentId
        ?? x?.companyId ?? x?.CompanyId ?? x?.locationId ?? x?.LocationId;
}

function normalizeCompanyId(x) {
    return x?.companyId ?? x?.CompanyId ?? null;
}

function normalizeLocationId(x) {
    return x?.locationId ?? x?.LocationId ?? null;
}

function normalizeUserDisplay(x) {
    return x?.personName ?? x?.PersonName ?? x?.userName ?? x?.UserName ?? 'Unnamed User';
}

function normalizeDepartmentName(x) {
    return x?.departmentName ?? x?.DepartmentName ?? 'Unnamed Department';
}

function normalizeCompanyName(x) {
    return x?.companyName ?? x?.CompanyName ?? 'Unnamed Company';
}

function normalizeLocationName(x) {
    return x?.locationName ?? x?.LocationName ?? 'Unnamed Location';
}

export default function UserRightsForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        userId: '',
        companyId: '',
        locationId: '',
        departmentId: '',
    });

    const [users, setUsers] = useState([]);         // array, normalized
    const [companies, setCompanies] = useState([]); // array, normalized
    const [locations, setLocations] = useState([]); // array, normalized
    const [departments, setDepartments] = useState([]); // array, normalized

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /** Load dropdown data (robust parsing) */
    useEffect(() => {
        let cancelled = false;

        async function loadAll() {
            try {
                const [uRes, cRes, lRes, dRes] = await Promise.all([
                    // axios.get(usersUrl), // wherever you call
                    axios.get(usersUrl, { params: { pageNumber: 1, pageSize: 50 } }),
                    axios.get(companiesUrl),
                    axios.get(locationsUrl),
                    axios.get(departmentsUrl),
                ]);

                if (cancelled) return;

                const usersArr = normalizeItems(uRes.data).map(u => ({
                    _raw: u,
                    id: normalizeId(u),
                    companyId: normalizeCompanyId(u),
                    display: normalizeUserDisplay(u),
                })).filter(u => u.id != null);

                const companiesArr = normalizeItems(cRes.data).map(c => ({
                    _raw: c,
                    id: normalizeId(c) ?? c?.companyId ?? c?.CompanyId,
                    name: normalizeCompanyName(c),
                })).filter(c => c.id != null);

                const locationsArr = normalizeItems(lRes.data).map(l => ({
                    _raw: l,
                    id: normalizeId(l) ?? l?.locationId ?? l?.LocationId,
                    name: normalizeLocationName(l),
                })).filter(l => l.id != null);

                const departmentsArr = normalizeItems(dRes.data).map(d => ({
                    _raw: d,
                    id: normalizeId(d) ?? d?.departmentId ?? d?.DepartmentId,
                    name: normalizeDepartmentName(d),
                    locationId: normalizeLocationId(d),
                })).filter(d => d.id != null);

                setUsers(usersArr);
                setCompanies(companiesArr);
                setLocations(locationsArr);
                setDepartments(departmentsArr);
            } catch (e) {
                console.error('Error fetching dropdown data', e);
                setError('Failed to load dropdown data');
            }
        }

        loadAll();
        return () => { cancelled = true; };
    }, []);

    /** Load existing record for edit */
    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        async function loadExisting() {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`http://localhost:5181/api/userrights/${id}`);
                toast.success("User Rights Updated Succefully");
                if (cancelled) return;

                const d = res.data ?? {};
                const userId = d.userId ?? d.UserId ?? '';
                const companyId = d.companyId ?? d.CompanyId ?? '';
                const locationId = d.locationId ?? d.LocationId ?? '';
                const departmentId = d.departmentId ?? d.DepartmentId ?? '';

                setFormData({
                    userId: userId !== '' ? String(userId) : '',
                    companyId: companyId !== '' ? String(companyId) : '',
                    locationId: locationId !== '' ? String(locationId) : '',
                    departmentId: departmentId !== '' ? String(departmentId) : '',
                });
            } catch (e) {
                console.error('Error loading user rights for edit', e);
                setError('Failed to load data for edit');
            } finally {
                setLoading(false);
            }
        }

        loadExisting();
        return () => { cancelled = true; };
    }, [id]);

    /** Efficient lookups */
    const userById = useMemo(() => {
        const map = new Map();
        users.forEach(u => map.set(String(u.id), u));
        return map;
    }, [users]);

    const deptById = useMemo(() => {
        const map = new Map();
        departments.forEach(d => map.set(String(d.id), d));
        return map;
    }, [departments]);

    /** Auto-select company on user change & location on department change */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            let next = { ...prev, [name]: value };

            if (name === 'userId') {
                const selUser = userById.get(String(value));
                if (selUser?.companyId != null) {
                    next.companyId = String(selUser.companyId);
                } else {
                    // If user has no companyId, clear company selection
                    next.companyId = '';
                }
            }

            if (name === 'departmentId') {
                const selDept = deptById.get(String(value));
                if (selDept?.locationId != null) {
                    next.locationId = String(selDept.locationId);
                } else {
                    next.locationId = '';
                }
            }

            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const userIdNum = parseInt(formData.userId, 10);
        const companyIdNum = parseInt(formData.companyId, 10);
        const locationIdNum = parseInt(formData.locationId, 10);
        const departmentIdNum = parseInt(formData.departmentId, 10);

        if ([userIdNum, companyIdNum, locationIdNum, departmentIdNum].some(v => isNaN(v) || v <= 0)) {
            setError('Please select valid options for all fields');
            return;
        }

        const payload = {
            userId: userIdNum,
            companyId: companyIdNum,
            locationId: locationIdNum,
            departmentId: departmentIdNum,
        };

        try {
            if (id) {
                await axios.put(`http://localhost:5181/api/userrights/${id}`, payload);
            } else {
                await axios.post(`http://localhost:5181/api/userrights`, payload);
            }
            navigate('/dashboard/userrights/record');
        } catch (err) {
            console.error('Error saving user right:', err);
            setError(err.response?.data?.message || 'Failed to save user right');
        }
    };

    if (loading) return <p>Loading…</p>;

    return (
        <div className="card p-4">
            <h5>{id ? 'Edit User Right' : 'Create New User Right'}</h5>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* User Select */}
                <div className="mb-3">
                    <label>User</label>
                    <select
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="">Select User</option>
                        {users.map(u => (
                            <option key={u.id} value={String(u.id)}>
                                {u.display}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Company Select (auto-filled from user) */}
                <div className="mb-3">
                    <label>Company</label>
                    <select
                        name="companyId"
                        value={formData.companyId}
                        onChange={handleChange}
                        className="form-select"
                        disabled
                    >
                        <option value="">Select Company</option>
                        {companies.map(c => (
                            <option key={c.id} value={String(c.id)}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <div className="form-text">Auto-filled from selected user.</div>
                </div>

                {/* Department Select */}
                <div className="mb-3">
                    <label>Department</label>
                    <select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.id} value={String(d.id)}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Location Select (auto-filled from department) */}
                <div className="mb-3">
                    <label>Location</label>
                    <select
                        name="locationId"
                        value={formData.locationId}
                        onChange={handleChange}
                        className="form-select"
                        disabled
                    >
                        <option value="">Select Location</option>
                        {locations.map(l => (
                            <option key={l.id} value={String(l.id)}>
                                {l.name}
                            </option>
                        ))}
                    </select>
                    <div className="form-text">Auto-filled from selected department.</div>
                </div>

                <button type="submit" className="btn btn-success">
                    {id ? 'Update User Right' : 'Create User Right'}
                </button>
            </form>
        </div>
    );
}
