// admin/components/AdminPrivateRoute.jsx — גישה למנהלים בלבד
import React from "react";
import { Navigate } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";

export default function AdminPrivateRoute({ children }) {
  const { userInfo, isAdmin } = useAdminAuth();
  if (!userInfo || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
