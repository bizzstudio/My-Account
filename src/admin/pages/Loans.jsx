// admin/pages/Loans.jsx — ניהול הלוואות: רשימה (5.4)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../services/adminService";
import { Card } from "@/portal/components/ui/Card";
import Badge from "@/portal/components/ui/Badge";
import { Loading, ErrorState } from "@/portal/components/ui/States";
import { Button } from "../components/ui/Form";
import SearchBox from "../components/ui/SearchBox";
import { LOAN_STATUS_LABELS, LOAN_STATUS_TONE } from "@/portal/lib/labels";
import { formatMoney, formatDate } from "@/portal/lib/format";

export default function Loans() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data, loading, error, refetch } = useApi(
    () => AdminService.listLoans(query ? { search: query } : {}),
    [query]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">הלוואות</h1>
        <Button onClick={() => navigate("/admin/loans/new")}>
          <FiPlus /> הלוואה חדשה
        </Button>
      </div>

      <SearchBox
        placeholder="חיפוש לפי מספר הלוואה, שם לקוח או ת״ז"
        onSearch={setQuery}
      />

      <Card>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">לא נמצאו הלוואות</div>
        ) : (
          <div className="w-full overflow-x-auto md:overflow-visible">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <th className="px-3 py-3 text-start font-semibold">מספר הלוואה</th>
                  <th className="px-3 py-3 text-start font-semibold">לקוח</th>
                  <th className="px-3 py-3 text-start font-semibold">סכום מקורי</th>
                  <th className="px-3 py-3 text-start font-semibold">סטטוס</th>
                  <th className="px-3 py-3 text-start font-semibold">מועד העמדה</th>
                  <th className="px-3 py-3 text-start font-semibold">עדכון אחרון</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((loan) => (
                  <tr
                    key={loan._id}
                    onClick={() => navigate(`/admin/loans/${loan._id}`)}
                    className="group relative cursor-pointer hover:bg-brand-50"
                  >
                    <td className="relative px-3 py-3 font-medium text-gray-900">
                      {loan.loanNumber}
                      {/* תקציר — בועה צפה במעבר עכבר */}
                      <div className="pointer-events-none absolute right-3 top-full z-20 mt-1 w-72 origin-top translate-y-1 scale-95 text-start font-normal opacity-0 transition duration-150 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
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
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {loan.customerId
                        ? `${loan.customerId.firstName} ${loan.customerId.lastName}`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-gray-700">{formatMoney(loan.originalAmount)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={LOAN_STATUS_TONE[loan.status] || "gray"}>
                        {LOAN_STATUS_LABELS[loan.status] || loan.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{formatDate(loan.disbursementDate)}</td>
                    <td className="px-3 py-3 text-gray-700">{formatDate(loan.asOfDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
