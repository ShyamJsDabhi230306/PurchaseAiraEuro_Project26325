import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../context/PermissionsProvider";

export default function ProtectedRoute({ perm, children }) {
  const { ready, can, canNow } = usePermissions();
  const [allowed, setAllowed] = useState(canNow(perm));

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!ready) return;
      const ok = await can(perm);
      if (mounted) setAllowed(ok);
    })();
    return () => { mounted = false; };
  }, [ready, perm, can]);

  if (!ready) return <div className="p-3">Loading permissions…</div>;
  return allowed ? children : <Navigate to="/dashboard" replace />;
}
