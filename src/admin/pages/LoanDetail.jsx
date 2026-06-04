// admin/pages/LoanDetail.jsx — ניהול הלוואה עם לשוניות (5.4/5.5/5.6)
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../services/adminService";
import useAdminAuth from "../hooks/useAdminAuth";
import { Loading, ErrorState } from "@/portal/components/ui/States";
import Badge from "@/portal/components/ui/Badge";
import Tabs from "@/portal/components/ui/Tabs";
import { LOAN_STATUS_LABELS, LOAN_STATUS_TONE } from "@/portal/lib/labels";

import DetailsTab from "../components/loan-manage/DetailsTab";
import BalancesTab from "../components/loan-manage/BalancesTab";
import TransactionsTab from "../components/loan-manage/TransactionsTab";
import TracksTab from "../components/loan-manage/TracksTab";
import DocumentsTab from "../components/loan-manage/DocumentsTab";

const TAB_DEFS = [
  { key: "details", label: "פרטים" },
  { key: "balances", label: "יתרות" },
  { key: "transactions", label: "תנועות" },
  { key: "tracks", label: "מסלולים" },
  { key: "documents", label: "מסמכים" },
];

export default function LoanDetail() {
  const { id } = useParams();
  const { isSuperAdmin } = useAdminAuth();
  const [active, setActive] = useState("details");
  const { data, loading, error, refetch } = useApi(
    () => AdminService.getLoan(id),
    [id]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const customer = data.customerId;

  return (
    <div className="space-y-5">
      <Link to="/admin/loans" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <FiChevronRight /> חזרה להלוואות
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">הלוואה מס׳ {data.loanNumber}</h1>
        <Badge tone={LOAN_STATUS_TONE[data.status] || "gray"}>
          {LOAN_STATUS_LABELS[data.status] || data.status}
        </Badge>
        {customer && (
          <Link to={`/admin/customers/${customer._id}`} className="text-sm text-brand-600 hover:underline">
            {customer.firstName} {customer.lastName} ({customer.nationalId})
          </Link>
        )}
      </div>

      <Tabs tabs={TAB_DEFS} active={active} onChange={setActive} />

      <div>
        {active === "details" && <DetailsTab loan={data} onSaved={refetch} />}
        {active === "balances" && <BalancesTab loanId={id} onChanged={refetch} />}
        {active === "transactions" && (
          <TransactionsTab
            loanId={id}
            transactions={data.transactions}
            onChanged={refetch}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        {active === "tracks" && (
          <TracksTab loanId={id} tracks={data.tracks} onChanged={refetch} />
        )}
        {active === "documents" && <DocumentsTab loanId={id} />}
      </div>
    </div>
  );
}
