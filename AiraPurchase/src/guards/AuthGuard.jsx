// src/guards/AuthGuard.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return user && user.userId; // adjust according to your user object structure
  } catch {
    return false;
  }
};

const AuthGuard = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" replace />;
};

export default AuthGuard;
