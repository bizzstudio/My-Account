// portal/pages/Loans.jsx — רשימת הלוואות (3.3)
import React from "react";
import useApi from "../hooks/useApi";
import MeService from "../services/meService";
import LoanCard from "../components/LoanCard";
import { Loading, ErrorState, EmptyState } from "../components/ui/States";

export default function Loans() {
  const { data, loading, error, refetch } = useApi(() => MeService.getLoans());

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">ההלוואות שלי</h1>
      {data && data.length > 0 ? (
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {data.map((loan) => (
            <LoanCard key={loan._id} loan={loan} />
          ))}
        </div>
      ) : (
        <EmptyState title="לא נמצאו הלוואות" />
      )}
    </div>
  );
}
