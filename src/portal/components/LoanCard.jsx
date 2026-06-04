// portal/components/LoanCard.jsx — שורת הלוואה ברשימה (3.2 / 3.3)
import React from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Badge from "./ui/Badge";
import { formatMoney, formatDate } from "../lib/format";
import { LOAN_STATUS_LABELS, LOAN_STATUS_TONE } from "../lib/labels";

export default function LoanCard({ loan }) {
  return (
    <Link
      to={`/loans/${loan._id}`}
      className="group relative flex items-center gap-3 px-4 py-3.5 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-gray-50 sm:gap-4 sm:px-5"
    >
      {/* מספר הלוואה + סטטוס */}
      <div className="flex min-w-0 shrink-0 items-center gap-2.5">
        <span className="text-base font-bold text-gray-900">
          {loan.loanNumber}
        </span>
        <Badge tone={LOAN_STATUS_TONE[loan.status] || "gray"}>
          {LOAN_STATUS_LABELS[loan.status] || loan.status}
        </Badge>
      </div>

      {/* סה״כ לפירעון */}
      <div className="flex-1 truncate text-sm">
        <span className="text-gray-500">סה״כ לפירעון: </span>
        <span className="font-bold text-brand-700">
          {formatMoney(loan.totalBalance)}
        </span>
      </div>

      {/* תאריך עדכון + חץ */}
      <span className="hidden shrink-0 text-xs text-gray-500 sm:inline">
        מעודכן לתאריך: {formatDate(loan.asOfDate)}
      </span>
      <FiChevronLeft className="shrink-0 text-gray-400" />

      {/* תקציר — בועה צפה במעבר עכבר */}
      <div className="pointer-events-none absolute right-4 top-full z-20 mt-2 w-72 max-w-[calc(100%-2rem)] origin-top translate-y-1 scale-95 opacity-0 transition duration-150 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100">
        {/* חץ הבועה */}
        <div className="absolute right-6 -top-1.5 h-3 w-3 rotate-45 border-l border-t border-gray-100 bg-white" />
        <div className="relative rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
          <div className="mb-2 text-xs font-semibold text-gray-400">תקציר הלוואה</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div>
              <div className="text-xs text-gray-500">סכום מקורי</div>
              <div className="font-medium text-gray-800">
                {formatMoney(loan.originalAmount)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">יתרת קרן</div>
              <div className="font-medium text-gray-800">
                {formatMoney(loan.principalBalance)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">יתרת ריבית</div>
              <div className="font-medium text-gray-800">
                {formatMoney(loan.interestBalance)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500 sm:hidden">
            <span>מעודכן לתאריך</span>
            <span>{formatDate(loan.asOfDate)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
