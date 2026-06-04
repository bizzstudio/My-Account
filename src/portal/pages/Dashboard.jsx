// portal/pages/Dashboard.jsx — עמוד בית (3.2)
import React from "react";
import { FiFileText, FiDollarSign, FiClock } from "react-icons/fi";
import useApi from "../hooks/useApi";
import MeService from "../services/meService";
import { Loading, ErrorState } from "../components/ui/States";
import { formatMoney, formatDate } from "../lib/format";

function StatCard({ icon: Icon, label, value, tone = "indigo" }) {
  const tones = {
    indigo: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="text-2xl" />
      </div>
      <div className="min-w-0">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="truncate text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi(() => MeService.getDashboard());

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const { customerName, summary } = data || {};

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          שלום, {customerName || "לקוח"} 👋
        </h1>
        <p className="text-sm text-gray-500">ברוכים הבאים לאזור האישי שלכם</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={FiFileText}
          label="הלוואות פעילות"
          value={summary?.activeLoans ?? 0}
          tone="indigo"
        />
        <StatCard
          icon={FiDollarSign}
          label="סה״כ יתרה לפירעון"
          value={formatMoney(summary?.totalBalance)}
          tone="emerald"
        />
        <StatCard
          icon={FiClock}
          label="עדכון אחרון"
          value={formatDate(summary?.lastUpdate)}
          tone="amber"
        />
      </div>

    </div>
  );
}
