// portal/pages/Inquiries.jsx — עמוד פניות כללי (4.8)
import React from "react";
import useApi from "../hooks/useApi";
import MeService from "../services/meService";
import { Loading, ErrorState } from "../components/ui/States";
import InquiryList from "../components/InquiryList";
import InquiryForm from "../components/InquiryForm";

export default function Inquiries() {
  const inquiriesQuery = useApi(() => MeService.getInquiries(), []);
  const loansQuery = useApi(() => MeService.getLoans(), []);

  if (inquiriesQuery.loading || loansQuery.loading) return <Loading />;
  if (inquiriesQuery.error)
    return (
      <ErrorState message={inquiriesQuery.error} onRetry={inquiriesQuery.refetch} />
    );

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">פניות</h1>

      <InquiryForm
        loans={loansQuery.data || []}
        onCreated={inquiriesQuery.refetch}
      />

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-800">
          הפניות שלי
        </h2>
        <InquiryList inquiries={inquiriesQuery.data} />
      </div>
    </div>
  );
}
