// portal/pages/LoanDetails.jsx — עמוד פרטי הלוואה עם לשוניות (3.4)
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import useApi from "../hooks/useApi";
import MeService from "../services/meService";
import { Loading, ErrorState } from "../components/ui/States";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import { LOAN_STATUS_LABELS, LOAN_STATUS_TONE } from "../lib/labels";

import SummaryTab from "../components/loan-tabs/SummaryTab";
import BalancesTab from "../components/loan-tabs/BalancesTab";
import TransactionsTab from "../components/loan-tabs/TransactionsTab";
import TracksTab from "../components/loan-tabs/TracksTab";
import DocumentsTab from "../components/loan-tabs/DocumentsTab";
import EarlyRepaymentTab from "../components/loan-tabs/EarlyRepaymentTab";
import InquiriesTab from "../components/loan-tabs/InquiriesTab";
import LicenseHolderTab from "../components/loan-tabs/LicenseHolderTab";

const TAB_DEFS = [
  { key: "summary", label: "תקציר" },
  { key: "balances", label: "יתרות" },
  { key: "transactions", label: "תנועות והחזרים" },
  { key: "tracks", label: "מסלולים וריבית" },
  { key: "documents", label: "מסמכים" },
  { key: "early-repayment", label: "פירעון מוקדם" },
  { key: "inquiries", label: "פניות" },
  { key: "license-holder", label: "בעל הרישיון" },
];

export default function LoanDetails() {
  const { loanId } = useParams();
  const [active, setActive] = useState("summary");
  const [inquirySubject, setInquirySubject] = useState("");
  const { data, loading, error, refetch } = useApi(
    () => MeService.getLoan(loanId),
    [loanId]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const { summary, balances, tracks, linkage, thirdParty, merchant, licenseHolder } =
    data || {};

  const goToInquiry = () => {
    setInquirySubject(`פנייה בנושא פירעון מוקדם — הלוואה ${summary?.loanNumber || ""}`);
    setActive("inquiries");
  };

  return (
    <div className="space-y-5">
      {/* כותרת + פירורי לחם */}
      <div>
        <Link
          to="/loans"
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <FiChevronRight />
          חזרה לרשימת ההלוואות
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            הלוואה מס׳ {summary?.loanNumber}
          </h1>
          <Badge tone={LOAN_STATUS_TONE[summary?.status] || "gray"}>
            {LOAN_STATUS_LABELS[summary?.status] || summary?.status}
          </Badge>
        </div>
      </div>

      <Tabs tabs={TAB_DEFS} active={active} onChange={setActive} />

      <div>
        {active === "summary" && <SummaryTab summary={summary} />}
        {active === "balances" && <BalancesTab balances={balances} />}
        {active === "transactions" && <TransactionsTab loanId={loanId} />}
        {active === "tracks" && <TracksTab tracks={tracks} linkage={linkage} />}
        {active === "documents" && <DocumentsTab loanId={loanId} />}
        {active === "early-repayment" && (
          <EarlyRepaymentTab loanId={loanId} onOpenInquiry={goToInquiry} />
        )}
        {active === "inquiries" && (
          <InquiriesTab loanId={loanId} defaultSubject={inquirySubject} />
        )}
        {active === "license-holder" && (
          <LicenseHolderTab
            licenseHolder={licenseHolder}
            thirdParty={thirdParty}
            merchant={merchant}
          />
        )}
      </div>
    </div>
  );
}
