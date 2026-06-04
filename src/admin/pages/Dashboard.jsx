// admin/pages/Dashboard.jsx — דשבורד ניהול + בדיקת חוסרים (5.2)
import React from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiClock,
  FiMessageSquare,
} from "react-icons/fi";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../services/adminService";
import { Loading, ErrorState } from "@/portal/components/ui/States";

function Stat({ icon: Icon, label, value, tone = "indigo", to }) {
  const tones = {
    indigo: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  const body = (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="text-xl" />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useApi(() => AdminService.getDashboard());
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">דשבורד ניהול</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat icon={FiUsers} label="לקוחות" value={data.customersCount} to="/admin/customers" />
        <Stat icon={FiFileText} label="הלוואות" value={data.loansCount} to="/admin/loans" />
        <Stat icon={FiFileText} label="הלוואות פעילות" value={data.activeLoansCount} tone="emerald" />
        <Stat icon={FiMessageSquare} label="פניות פתוחות" value={data.openInquiries} tone="amber" to="/admin/inquiries" />
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
          <FiAlertTriangle className="text-amber-500" />
          בדיקת חוסרים
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={FiFileText} label="הלוואות ללא מסמכים" value={data.loansWithoutDocuments} tone="red" />
          <Stat icon={FiClock} label="הלוואות ללא תאריך עדכון" value={data.loansWithoutAsOf} tone="red" />
          <Stat
            icon={FiClock}
            label={`מידע לא מעודכן (>${data.staleDays} ימים)`}
            value={data.loansStale}
            tone="amber"
          />
        </div>
      </div>
    </div>
  );
}
