// portal/components/PortalPrivateRoute.jsx — חוסם גישה ללא התחברות לקוח
import React from "react";
import { Navigate } from "react-router-dom";
import usePortalAuth from "../hooks/usePortalAuth";

export default function PortalPrivateRoute({ children }) {
  const { userInfo, isCustomer } = usePortalAuth();
  if (!userInfo || !isCustomer) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
