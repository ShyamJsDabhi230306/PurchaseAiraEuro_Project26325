// src/utils/permissions.js
import axios from "axios";
const API = "http://localhost:5181";

const norm = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.items) return payload.items;
  if (payload?.Items) return payload.Items;
  if (payload?.results) return payload.results;
  if (payload?.data) return payload.data;
  if (payload?.pageData) return payload.pageData;
  return [];
};

export async function getAllowedRoutesForUser(userId) {
  if (!userId) return new Set();

  // 1) user permissions
  const permRes = await axios.get(`${API}/api/PagePermissions/${userId}`);
  const perms = norm(permRes.data) || [];

  // If DTO includes route
  const directRoutes = perms
    .filter((r) => r.isAllowed === true || r.IsAllowed === true)
    .map((r) => r.pageRout || r.PageRout)
    .filter(Boolean);

  if (directRoutes.length > 0) {
    return new Set(directRoutes.map(normalizeRoute));
  }

  // 2) fallback: map PageId -> PageRout via /api/Pages
  const pagesRes = await axios.get(`${API}/api/Pages`);
  const pages = norm(pagesRes.data) || [];

  const idToRoute = new Map(
    pages.map((p) => [
      Number(p.pageId ?? p.PageId),
      String(p.pageRout ?? p.PageRout ?? ""),
    ])
  );

  const allowed = new Set();
  perms.forEach((r) => {
    const ok = r.isAllowed === true || r.IsAllowed === true;
    const pid = Number(r.pageId ?? r.PageId);
    if (ok && idToRoute.has(pid)) {
      allowed.add(normalizeRoute(idToRoute.get(pid)));
    }
  });

  return allowed;
}

function normalizeRoute(route) {
  if (!route) return "";
  let r = route.trim();
  if (!r.startsWith("/")) r = "/" + r;

  // Your NavLinks live under /dashboard; if DB routes are bare,
  // add the prefix so they match the Sidebar paths.
  if (!r.toLowerCase().startsWith("/dashboard")) {
    r = "/dashboard" + (r === "/" ? "" : r);
  }

  // unify case and slashes
  r = r.replace(/\/{2,}/g, "/").toLowerCase();
  return r;
}
