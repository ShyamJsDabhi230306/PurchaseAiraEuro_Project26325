import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import {
  Building,
  Box,
  User as UserIcon,
  Plus,
  Minus,
  MapPin,
  FolderTree,
  UserCheck,
  Handshake,
  Package,
  Cpu,
  FileText,
  ShoppingCart,
} from 'lucide-react';

const API = 'http://localhost:5181';

/* Normalize helper (accepts many common API shapes) */
function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items) return payload.items;
  if (payload?.Items) return payload.Items;
  if (payload?.results) return payload.results;
  if (payload?.data) return payload.data;
  if (payload?.pageData) return payload.pageData;
  return [];
}
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
/* Pick a permission row safely */
function pickPerm(r) {
  return {
    userId: toNum(r.userId ?? r.UserId),
    pageId: toNum(r.pageId ?? r.PageId),
    pageName: (r.pageName ?? r.PageName ?? '').toString(),
    isAllowed: !!(r.isAllowed ?? r.IsAllowed ?? r.allowed),
  };
}
/* normalize names: case-insensitive + ignore spaces/_/- and diacritics */
const norm = (s) =>
  s?.toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ''); // "User Rights" ~ "user_rights" ~ "userrights"

/**
 * Loads allowed pageIds/pageNames for current user
 */
function usePermissions() {
  const [loading, setLoading] = useState(true);
  const [allowedIds, setAllowedIds] = useState(() => new Set());
  const [allowedNames, setAllowedNames] = useState(() => new Set());
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        let res;
        try {
          res = await axios.get(`${API}/api/PagePermissions/GetByUserId`, { params: { userId } });
        } catch {
          res = await axios.get(`${API}/api/PagePermissions/${userId}`);
        }
        const rows = normalizeList(res.data).map(pickPerm).filter((r) => r.isAllowed);

        const idSet = new Set();
        const nameSet = new Set();
        for (const r of rows) {
          if (r.pageId != null) idSet.add(r.pageId);
          const n = norm(r.pageName);
          if (n) nameSet.add(n);
        }
        if (!alive) return;
        setAllowedIds(idSet);
        setAllowedNames(nameSet);
      } catch (e) {
        console.error('[Sidebar] load permissions failed:', e);
        if (!alive) return;
        setAllowedIds(new Set());
        setAllowedNames(new Set());
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [userId]);

  const has = (rule) => {
    if (!rule) return false;

    // Allow shorthand: "Company" or ["Company", "Location"]
    if (typeof rule === 'string') return allowedNames.has(norm(rule));
    if (Array.isArray(rule)) return rule.some((r) => has(r));

    if (rule.id != null) return allowedIds.has(rule.id);
    if (rule.name) return allowedNames.has(norm(rule.name));
    if (Array.isArray(rule.any)) return rule.any.some((r) => has(r));
    return false;
  };

  return { loading, has, allowedIds, allowedNames };
}

/**
 * Map routes to permission keys (by name is easiest).
 * The norm() function makes these matches flexible.
 */
const MENU = [
  {
    key: 'companymaster',
    icon: <Building size={18} />,
    title: 'Company Master',
    items: [
      { label: 'Company Records', to: '/dashboard/companymaster/record', perm: { name: 'Company' } },
      { label: ' Create Company ', to: '/dashboard/companymaster/create', perm: { name: 'Company' } },
    ],
  },
  {
    key: 'locationmaster',
    icon: <MapPin size={18} />,
    title: 'Location Master',
    items: [
      { label: 'Location Records', to: '/dashboard/locationMaster/record', perm: { name: 'Location' } },
      { label: 'Create Location', to: '/dashboard/locationMaster/create', perm: { name: 'Location' } },
    ],
  },
  {
    key: 'departmentmaster',
    icon: <FolderTree size={18} />,
    title: 'Department Master',
    items: [
      { label: 'Department Records', to: '/dashboard/departmentMaster/record', perm: { name: 'Department' } },
      { label: 'Create Department', to: '/dashboard/departmentMaster/create', perm: { name: 'Department' } },
    ],
  },
  {
    key: 'usermaster',
    icon: <UserIcon size={18} />,
    title: 'User Master',
    items: [
      { label: 'User Records', to: '/dashboard/users/record', perm: { name: 'User' } },
      { label: 'Create User', to: '/dashboard/users/create', perm: { name: 'User' } },
    ],
  },
  {
    key: 'userrights',
    icon: <UserCheck size={18} />,
    title: 'User Rights',
    items: [
      { label: 'User Rights Records', to: '/dashboard/userrights/record', perm: { name: 'UserRights' } },
      { label: 'Create User Right', to: '/dashboard/userrights/create', perm: { name: 'UserRights' } },
      { label: 'Page Permissions', to: '/dashboard/userrights/pagepermissions', perm: { name: 'PagePermission' } },
    ],
  },
  {
    key: 'item',
    icon: <Box size={18} />,
    title: 'Item Master',
    items: [
      { label: 'Item Records', to: '/dashboard/itemmaster/record', perm: { name: 'Items' } },
      { label: 'Create Item', to: '/dashboard/itemmaster/create', perm: { name: 'Items' } },
    ],
  },
  {
    key: 'contractors',
    icon: <Handshake size={18} />,
    title: 'Contractor Master',
    items: [
      { label: 'Contractor Records', to: '/dashboard/contractors/record', perm: { name: 'Contractor' } },
      { label: 'Create Contractor', to: '/dashboard/contractors/create', perm: { name: 'Contractor' } },
    ],
  },
  {
    key: 'operator',
    icon: <Cpu size={18} />,
    title: 'Operator Master',
    items: [
      { label: 'Operator Records', to: '/dashboard/operator/record', perm: { name: 'Operator' } },
      { label: 'Create Operator', to: '/dashboard/operator/create', perm: { name: 'Operator' } },
    ],
  },
  { divider: 'TRANSACTION' },
  {
    key: 'outward',
    icon: <Package size={18} />,
    title: 'Outward Master',
    items: [
      { label: 'Outward Records', to: '/dashboard/outward/record', perm: { name: 'OutWard' } },
      { label: 'Create Outward', to: '/dashboard/outward/create', perm: { name: 'OutWard' } },
    ],
  },
  {
    key: 'secondinward',
    icon: <ShoppingCart size={18} />,
    title: 'Inward Master',
    items: [
      { label: 'InWard Records', to: '/dashboard/secondinward/record', perm: { name: 'InWard' } },
      // { label: 'Create InWard', to: '/dashboard/secondinward/create', perm: { name: 'InWard' } },
    ],
  },
  {
    key: 'inwardoutwardreport',
    icon: <FileText size={18} />,
    title: 'Inward Outward Report',
    items: [{ label: 'Report', to: '/dashboard/inwardoutwardreport', perm: { name: 'Report' } }],
  },
];

const Sidebar = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const { loading, has, allowedIds, allowedNames } = usePermissions();

  const toggleSection = (section) =>
    setExpandedSection((prev) => (prev === section ? null : section));

  // Filter sections by whether at least one child is permitted
  const sections = useMemo(() => {
    return MENU.map((sec) => {
      if (sec.divider) return sec; // keep divider rows
      const visibleItems = (sec.items || []).filter((it) => has(it.perm));
      return { ...sec, items: visibleItems, hidden: visibleItems.length === 0 };
    });
  }, [has, loading, allowedIds, allowedNames]);

  return (
    <aside
      className="sidebar bg-light border-end p-4 shadow-sm"
      style={{
        minWidth: '280px',
        height: '100vh',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h6 className="text-secondary fw-bold small mb-4">Master</h6>

      {loading ? (
        <div className="text-muted small">Loading permissions…</div>
      ) : (
        <ul className="list-unstyled">
          {sections.map((sec) => {
            if (sec.divider) {
              return (
                <li className="mb-3" key={`div-${sec.divider}`}>
                  <h6 className="text-secondary fw-bold small mb-4">{sec.divider}</h6>
                </li>
              );
            }
            if (sec.hidden) return null;

            const panelId = `panel-${sec.key}`;

            return (
              <li className="mb-3" key={sec.key}>
                <button
                  className="btn d-flex justify-content-between align-items-center w-100 text-start fw-semibold text-primary"
                  onClick={() => toggleSection(sec.key)}
                  style={{ fontSize: '1rem' }}
                  aria-expanded={expandedSection === sec.key}
                  aria-controls={panelId}
                >
                  <span className="d-flex align-items-center gap-2">
                    {sec.icon}
                    {sec.title}
                  </span>
                  <span>{expandedSection === sec.key ? <Minus size={16} /> : <Plus size={16} />}</span>
                </button>

                {/* React-driven toggle (no Bootstrap JS dependency) */}
                {expandedSection === sec.key && (
                  <div
                    id={panelId}
                    className="ps-3 mt-2 rounded shadow-sm bg-white"
                    style={{ border: '1px solid #f0f0f0' }}
                  >
                    <ul className="list-unstyled small mb-0 py-2">
                      {sec.items.map((it) => (
                        <li
                          key={it.to}
                          className="mb-2"
                          style={{
                            borderLeft: '3px solid transparent',
                            transition: 'all 0.3s',
                          }}
                        >
                          <NavLink
                            to={it.to}
                            className={({ isActive }) =>
                              'nav-link py-2 px-3 rounded d-block ' +
                              (isActive
                                ? 'bg-primary text-white border-start border-3 border-white'
                                : 'text-dark')
                            }
                            style={{ transition: 'background-color 0.3s, color 0.3s' }}
                          >
                            {it.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;
