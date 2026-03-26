import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* -------------------- API -------------------- */
const baseUrl = 'http://localhost:5181';
const api = axios.create({ baseURL: baseUrl });

/* -------------------- Helpers -------------------- */
function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items) return payload.items;
  if (payload?.Items) return payload.Items;
  if (payload?.results) return payload.results;
  if (payload?.Results) return payload.Results;
  if (payload?.data) return payload.data;
  if (payload?.pageData) return payload.pageData;
  if (payload?.response) return payload.response;
  if (payload?.Response) return payload.Response;
  if (payload?.value) return payload.value;
  if (payload && typeof payload === 'object') return Object.values(payload);
  return [];
}
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const pickUser = (u) => ({
  userId: toNum(u.userId ?? u.UserId ?? u.id ?? u.Id),
  userName: u.userName ?? u.UserName ?? u.personName ?? u.PersonName ?? u.name ?? 'User',
});
const pickPage = (p) => ({
  pageId: toNum(p.pageId ?? p.PageId ?? p.id ?? p.Id),
  pageName: p.pageName ?? p.PageName ?? `Page ${p.pageId ?? p.id ?? ''}`,
  group: p.group ?? p.Group ?? 'Other',
});
const pickPerm = (r) => ({
  userId: toNum(r.userId ?? r.UserId),
  pageId: toNum(r.pageId ?? r.PageId),
  isAllowed: !!(r.isAllowed ?? r.IsAllowed ?? r.ALLOWED ?? r.allowed),
});

/* -------------------- Styles (scoped) -------------------- */
const wrap = { maxWidth: 1050, margin: '0 auto' };
const card = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
  border: '1px solid #eef0f4',
};
const header = { fontSize: 22, fontWeight: 700, color: '#2a2f45' };
const tableWrap = { border: '1px solid #e9edf5', borderRadius: 12, overflow: 'hidden' };
const thCell = { background: '#f7f9fc', color: '#6b7280', fontWeight: 600 };

/* ===================================================================
   Rights Editor (flat table + live counters)
=================================================================== */
function RightsEditor({ openUserId, onUserChanged }) {
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]); // “menus”
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [allowed, setAllowed] = useState(() => new Set());     // Set<number> pageId
  const [initialAllowed, setInitialAllowed] = useState(() => new Set()); // snapshot for Cancel

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1) Load users + pages once
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // Users
        let usersRes;
        try {
          usersRes = await api.get('/api/Users', { params: { pageNumber: 1, pageSize: 10000 } });
        } catch {
          usersRes = await api.get('/api/users', { params: { pageNumber: 1, pageSize: 10000 } });
        }
        const us = normalizeList(usersRes.data).map(pickUser).filter(u => u.userId != null);

        // Pages
        let pagesRes = null;
        const pageEndpoints = ['/api/Pages', '/api/pages', '/api/PageMaster', '/api/pageMaster'];
        for (const ep of pageEndpoints) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const r = await api.get(ep, { params: { pageNumber: 1, pageSize: 10000 } });
            pagesRes = r; break;
          } catch {}
        }
        if (!pagesRes) {
          // infer from permissions if needed
          const rightsRes = await api.get('/api/PagePermissions');
          const perms = normalizeList(rightsRes.data).map(pickPerm);
          const inferred = Array.from(new Set(perms.map(p => p.pageId).filter(Boolean)))
            .map(id => ({ pageId: id, pageName: `Page ${id}`, group: 'Other' }));
          pagesRes = { data: inferred };
        }
        const ps = normalizeList(pagesRes.data)
          .map(pickPage)
          .filter(p => p.pageId != null)
          .sort((a, b) => `${a.pageName}`.localeCompare(`${b.pageName}`));

        if (!alive) return;
        setUsers(us);
        setPages(ps);

        const initId = toNum(openUserId) ?? (us.length ? us[0].userId : null);
        setSelectedUserId(initId);
        onUserChanged?.(initId ?? null);
      } catch (err) {
        console.error('[PagePermissions] load users/pages failed', err);
        toast.error('Failed to load users/pages');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [openUserId, onUserChanged]);

  // 2) Load permissions for the selected user
  const loadUserPerms = useCallback(async (uid) => {
    if (uid == null) return;
    try {
      let res;
      try {
        res = await api.get('/api/PagePermissions/GetByUserId', { params: { userId: uid } });
      } catch {
        res = await api.get(`/api/PagePermissions/${uid}`);
      }
      const rows = normalizeList(res.data).map(pickPerm).filter(r => r.userId === Number(uid));
      const set = new Set(rows.filter(r => r.isAllowed).map(r => r.pageId).filter(Boolean));
      setAllowed(set);
      setInitialAllowed(new Set(set));
    } catch (err) {
      console.error('[PagePermissions] loadUserPerms failed', err);
      toast.error('Failed to load user permissions');
      setAllowed(new Set());
      setInitialAllowed(new Set());
    }
  }, []);

  useEffect(() => {
    if (selectedUserId != null) {
      loadUserPerms(Number(selectedUserId));
      onUserChanged?.(Number(selectedUserId));
    }
  }, [selectedUserId, loadUserPerms, onUserChanged]);

  // counts for “how many rights”
  const totalMenus = pages.length;
  const allowedCount = allowed.size;
  const pct = totalMenus ? Math.round((allowedCount / totalMenus) * 100) : 0;

  // 3) UI Handlers
  const toggleRow = (pid) => {
    pid = Number(pid);
    setAllowed(prev => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid); else next.add(pid);
      return next;
    });
  };

  const selectAll = () => {
    setAllowed(new Set(pages.map(p => Number(p.pageId))));
  };

  const clearAll = () => {
    setAllowed(new Set());
  };

  const onCancel = () => {
    setAllowed(new Set(initialAllowed));
    toast.info('Changes reverted');
  };

  const onSave = async () => {
    if (selectedUserId == null) return;
    setSaving(true);
    const uid = Number(selectedUserId);

    const payload = pages.map(p => ({
      userId: uid,
      pageId: Number(p.pageId),
      isAllowed: allowed.has(Number(p.pageId)),
    }));

    try {
      const attempts = [
        () => api.put('/api/PagePermissions', payload),
        () => api.post('/api/PagePermissions/bulk', payload),
        () => api.post('/api/PagePermissions/Upsert', payload),
      ];
      let success = false;
      for (const fn of attempts) {
        try { await fn(); success = true; break; } catch {}
      }
      if (!success) {
        for (const row of payload) { await api.post('/api/PagePermissions', row); }
      }
      toast.success('Permissions saved');
      setInitialAllowed(new Set(allowed)); // new baseline
    } catch (err) {
      console.error('[PagePermissions] save failed', err);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  /* ----------- Render ----------- */
  return (
    <div className="container-fluid py-3" style={wrap}>
      <ToastContainer />
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <h3 style={header} className="mb-0">User Division Rights</h3>
      </div>

      <div className="p-4" style={card}>
        {/* Select user + live counters */}
        <div className="row g-3 mb-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Select User</label>
            <select
              className="form-select"
              value={selectedUserId ?? ''}
              onChange={(e) => setSelectedUserId(toNum(e.target.value))}
            >
              {users.length === 0 && <option value="">-- No users --</option>}
              {users.map(u => (
                <option key={u.userId} value={u.userId}>{u.userName}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <div className="d-flex justify-content-md-end gap-2">
              <span className="badge bg-primary align-self-center">
                Allowed {allowedCount} / {totalMenus}
              </span>
              <div className="progress" style={{ width: 180, height: 10, alignSelf: 'center' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${pct}%` }}
                  aria-valuenow={pct}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="d-flex gap-2 mb-2">
          <button className="btn btn-sm btn-outline-success" onClick={selectAll}>Select All</button>
          <button className="btn btn-sm btn-outline-danger" onClick={clearAll}>Clear All</button>
        </div>

        {/* Table */}
        <div style={tableWrap}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={thCell} className="px-3">Menu</th>
                  <th style={{...thCell, width: 140}} className="text-center">Can View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="text-muted py-4 px-3">Loading…</td></tr>
                ) : selectedUserId == null ? (
                  <tr><td colSpan={2} className="text-warning py-4 px-3">Please select a user.</td></tr>
                ) : pages.length === 0 ? (
                  <tr><td colSpan={2} className="text-muted py-4 px-3">No menus found.</td></tr>
                ) : (
                  pages.map((p) => {
                    const pid = Number(p.pageId);
                    const checked = allowed.has(pid);
                    return (
                      <tr key={pid}>
                        <td className="px-3">{p.pageName}</td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={checked}
                            onChange={() => toggleRow(pid)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2 justify-content-center mt-4">
          <button className="btn btn-primary px-5" disabled={saving || selectedUserId == null} onClick={onSave}>
            {saving ? 'Saving…' : 'SAVE'}
          </button>
          <button className="btn btn-warning text-white px-5" onClick={onCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   All Users Overview (records) — shows counts and lets you jump to edit
=================================================================== */
function RightsRecords({ onOpenUser, highlightUserId }) {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const rightsRes = await api.get('/api/PagePermissions');
        const rights = normalizeList(rightsRes.data).map(r => ({
          ...r,
          _stamp:
            Date.parse(r.updatedAt ?? r.UpdatedAt ?? r.modifiedOn ?? r.ModifiedOn ?? r.createdAt ?? r.CreatedAt ?? '') ||
            Number(r.id ?? r.Id ?? 0),
          ...pickPerm(r),
        }));

        let usersRes;
        try {
          usersRes = await api.get('/api/Users', { params: { pageNumber: 1, pageSize: 10000 } });
        } catch {
          usersRes = await api.get('/api/users', { params: { pageNumber: 1, pageSize: 10000 } });
        }
        const us = normalizeList(usersRes.data).map(pickUser);

        setRows(rights);
        setUsers(us);
      } catch (err) {
        console.error('[Records] load failed', err);
        toast.error('Failed to load records');
      }
    })();
  }, []);

  const usersById = useMemo(() => {
    const map = new Map();
    for (const u of users) if (u.userId != null) map.set(u.userId, u.userName);
    return map;
  }, [users]);

  const byUser = useMemo(() => {
    const latest = new Map();
    for (const r of rows) {
      if (r.userId == null || r.pageId == null) continue;
      const key = `${r.userId}:${r.pageId}`;
      const prev = latest.get(key);
      if (!prev || (Number(r._stamp) || 0) >= (Number(prev._stamp) || 0)) {
        latest.set(key, r);
      }
    }

    const agg = new Map();
    for (const [, row] of latest.entries()) {
      const uid = row.userId;
      if (!agg.has(uid)) {
        agg.set(uid, { userName: usersById.get(uid) || 'User', allowed: 0 });
      }
      if (row.isAllowed) agg.get(uid).allowed += 1;
    }

    for (const u of users) {
      if (u.userId != null && !agg.has(u.userId)) {
        agg.set(u.userId, { userName: u.userName, allowed: 0 });
      }
    }

    return Array.from(agg.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [rows, usersById, users]);

  return (
    <div className="card mt-4" style={card}>
      <div className="card-body">
        <h5 className="mb-3">All Users Overview</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>User Name</th>
                <th style={{ width: 160 }}>Allowed Pages</th>
                {/* <th style={{ width: 120 }}>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {byUser.length === 0 ? (
                <tr><td colSpan={4}>No records.</td></tr>
              ) : (
                byUser.map(([userId, v], idx) => (
                  <tr
                    key={userId}
                    className={Number(highlightUserId) === Number(userId) ? 'table-primary' : ''}
                  >
                    <td>{idx + 1}</td>
                    <td>{v.userName}</td>
                    <td>{v.allowed}</td>
                    {/* <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onOpenUser(Number(userId))}
                      >
                        Edit
                      </button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   Main PagePermissionsUI — Editor + Overview on the same page
=================================================================== */
export default function PagePermissionsUI() {
  const [openUserId, setOpenUserId] = useState(null);

  return (
    <div>
      <ToastContainer />
      <RightsEditor
        openUserId={openUserId}
        onUserChanged={(uid) => setOpenUserId(uid)}
      />
      <div className="container-fluid" style={wrap}>
        <RightsRecords
          highlightUserId={openUserId}
          onOpenUser={(id) => setOpenUserId(Number(id))}
        />
      </div>
    </div>
  );
}
