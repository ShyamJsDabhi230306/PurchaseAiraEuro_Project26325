// src/permissions/PermissionsContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const baseUrl = 'http://localhost:5181';
const api = axios.create({ baseURL: baseUrl });

function pullList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items) return payload.items;
  if (payload?.Items) return payload.Items;
  if (payload?.data) return Array.isArray(payload.data) ? payload.data : (payload.data?.items || []);
  if (payload?.results) return payload.results;
  if (payload?.pageData) return payload.pageData;
  return [];
}

const PermissionsContext = createContext({
  loading: true,
  allowedIds: new Set(),
  canViewId: () => false,
  canViewAny: () => false,
});

export function PermissionsProvider({ userId, children }) {
  const [allowedIds, setAllowedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;

    async function load() {
      if (!userId) {
        // No user? Treat as no permissions, but DO render UI.
        if (!cancel) { setAllowedIds(new Set()); setLoading(false); }
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/PagePermissions/${userId}`);
        const rows = pullList(res.data);
        const ids = new Set(
          rows
            .filter(r => (r.isAllowed ?? r.IsAllowed) === true)
            .map(r => r.pageId ?? r.PageId)
            .filter(id => id != null)
        );
        if (!cancel) setAllowedIds(ids);
      } catch (e) {
        console.error('Permissions load failed', e);
        toast.error('Failed to load permissions');
        // Still turn loading off so UI renders instead of blank screen
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    load();
    return () => { cancel = true; };
  }, [userId]);

  const value = useMemo(() => ({
    loading,
    allowedIds,
    canViewId: (pageId) => allowedIds.has(pageId),
    canViewAny: (...pageIds) => pageIds.some(id => allowedIds.has(id)),
  }), [loading, allowedIds]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
