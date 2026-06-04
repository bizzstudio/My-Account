// loan-tabs/DocumentsTab.jsx — מסמכים: צפייה / הורדה / הדפסה (4.6)
import React, { useState } from "react";
import { FiEye, FiDownload, FiPrinter } from "react-icons/fi";
import { Card, CardHeader } from "../ui/Card";
import { SkeletonRows, ErrorState, EmptyState } from "../ui/States";
import useApi from "../../hooks/useApi";
import MeService from "../../services/meService";
import { formatDate } from "../../lib/format";
import { DOCUMENT_TYPE_LABELS } from "../../lib/labels";
import { notifyError } from "@/utils/toast";

export default function DocumentsTab({ loanId }) {
  const { data, loading, error, refetch } = useApi(
    () => MeService.getDocuments(loanId),
    [loanId]
  );
  const [busyId, setBusyId] = useState(null);

  // מקבל blob מאובטח ומבצע פעולה (view/download/print)
  const handleAction = async (doc, action) => {
    setBusyId(doc._id + action);
    try {
      const blob = await MeService.getDocumentBlob(
        loanId,
        doc._id,
        action === "download"
      );
      const url = window.URL.createObjectURL(blob);

      if (action === "download") {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${doc.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 4000);
      } else if (action === "print") {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        };
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      }
    } catch (err) {
      notifyError("שגיאה בפתיחת המסמך");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader title="מסמכים" />
      {loading ? (
        <SkeletonRows rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="לא נמצאו מסמכים עבור הלוואה זו" />
      ) : (
        <ul className="divide-y divide-gray-100">
          {data.map((doc) => (
            <li
              key={doc._id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="text-xs text-brand-600">
                  {DOCUMENT_TYPE_LABELS[doc.type] || "מסמך"}
                </div>
                <div className="truncate font-medium text-gray-900">
                  {doc.title}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(doc.documentDate)}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ActionBtn
                  icon={FiEye}
                  label="צפייה"
                  onClick={() => handleAction(doc, "view")}
                  busy={busyId === doc._id + "view"}
                />
                <ActionBtn
                  icon={FiDownload}
                  label="הורדה"
                  onClick={() => handleAction(doc, "download")}
                  busy={busyId === doc._id + "download"}
                />
                <ActionBtn
                  icon={FiPrinter}
                  label="הדפסה"
                  onClick={() => handleAction(doc, "print")}
                  busy={busyId === doc._id + "print"}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ActionBtn({ icon: Icon, label, onClick, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
    >
      <Icon className="text-sm" />
      {label}
    </button>
  );
}
