// loan-tabs/InquiriesTab.jsx — פניות הקשורות להלוואה (4.8)
import React from "react";
import useApi from "../../hooks/useApi";
import MeService from "../../services/meService";
import { Loading, ErrorState } from "../ui/States";
import InquiryList from "../InquiryList";
import InquiryForm from "../InquiryForm";

export default function InquiriesTab({ loanId, defaultSubject }) {
  const { data, loading, error, refetch } = useApi(
    () => MeService.getInquiries(),
    []
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // סינון לפניות הקשורות להלוואה זו
  const related = (data || []).filter(
    (inq) => String(inq.loanId) === String(loanId)
  );

  return (
    <div className="space-y-4">
      <InquiryForm
        fixedLoanId={loanId}
        defaultSubject={defaultSubject}
        onCreated={refetch}
      />
      <div>
        <h3 className="mb-3 text-base font-semibold text-gray-800">
          פניות בנושא הלוואה זו
        </h3>
        <InquiryList
          inquiries={related}
          emptyText="לא נפתחו פניות עבור הלוואה זו"
        />
      </div>
    </div>
  );
}
