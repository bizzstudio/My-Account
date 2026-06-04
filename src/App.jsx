// src/App.jsx — מערכת אחת: פורטל לקוח (אזור אישי) + ניהול (אדמין)
import React, { lazy, Suspense, useContext, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Loading from "./components/preloader/Loading";
import { UserContext } from "./context/UserContext";
import PortalPrivateRoute from "@/portal/components/PortalPrivateRoute";
import AdminPrivateRoute from "@/admin/components/AdminPrivateRoute";

// פורטל לקוח
const PortalLayout = lazy(() => import("@/portal/components/PortalLayout"));
const PortalLogin = lazy(() => import("@/portal/pages/Login"));
const Dashboard = lazy(() => import("@/portal/pages/Dashboard"));
const Loans = lazy(() => import("@/portal/pages/Loans"));
const LoanDetails = lazy(() => import("@/portal/pages/LoanDetails"));
const Inquiries = lazy(() => import("@/portal/pages/Inquiries"));

// ניהול
const AdminLayout = lazy(() => import("@/admin/components/AdminLayout"));
const AdminDashboard = lazy(() => import("@/admin/pages/Dashboard"));
const AdminCustomers = lazy(() => import("@/admin/pages/Customers"));
const AdminCustomerDetail = lazy(() => import("@/admin/pages/CustomerDetail"));
const AdminLoans = lazy(() => import("@/admin/pages/Loans"));
const AdminLoanForm = lazy(() => import("@/admin/pages/LoanForm"));
const AdminLoanDetail = lazy(() => import("@/admin/pages/LoanDetail"));
const AdminInquiries = lazy(() => import("@/admin/pages/Inquiries"));
const AdminSettings = lazy(() => import("@/admin/pages/Settings"));

const App = () => {
  const { state } = useContext(UserContext);
  const { userInfo } = state;
  const role = userInfo?.role;
  const isCustomer = role === "customer";
  const isAdmin = role === "admin" || role === "super-admin";

  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
  }, []);

  return (
    <>
      <ToastContainer />
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* ===== התחברות מאוחדת (אדמין + לקוח) ===== */}
            <Route
              path="/login"
              element={
                isAdmin ? (
                  <Navigate to="/admin" replace />
                ) : isCustomer ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <PortalLogin />
                )
              }
            />
            {/* עמוד האדמין הישן מפנה לכניסה המאוחדת */}
            <Route
              path="/admin/login"
              element={
                <Navigate to={isAdmin ? "/admin" : "/login"} replace />
              }
            />

            {/* ===== אזור לקוח ===== */}
            <Route
              element={
                <PortalPrivateRoute>
                  <PortalLayout />
                </PortalPrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/loans/:loanId" element={<LoanDetails />} />
              <Route path="/inquiries" element={<Inquiries />} />
            </Route>

            {/* ===== אזור ניהול ===== */}
            <Route
              path="/admin"
              element={
                <AdminPrivateRoute>
                  <AdminLayout />
                </AdminPrivateRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="customers/:id" element={<AdminCustomerDetail />} />
              <Route path="loans" element={<AdminLoans />} />
              <Route path="loans/new" element={<AdminLoanForm />} />
              <Route path="loans/:id" element={<AdminLoanDetail />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ===== ברירות מחדל ===== */}
            <Route
              path="/"
              element={
                <Navigate
                  to={isAdmin ? "/admin" : isCustomer ? "/dashboard" : "/login"}
                  replace
                />
              }
            />
            <Route
              path="*"
              element={
                <Navigate
                  to={isAdmin ? "/admin" : isCustomer ? "/dashboard" : "/login"}
                  replace
                />
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
};

export default App;
