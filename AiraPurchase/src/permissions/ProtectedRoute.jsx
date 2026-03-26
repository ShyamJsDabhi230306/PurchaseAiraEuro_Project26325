// src/permissions/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from './PermissionsContext';

export default function ProtectedRoute({ pageId, children }) {
  const { loading, canViewId } = usePermissions();

  // Show a tiny placeholder instead of returning null
  if (loading) {
    return (
      <div className="p-3 text-muted small">
        Loading permissions…
      </div>
    );
  }

  // Block if user doesn't have the page right
  if (!canViewId(pageId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
