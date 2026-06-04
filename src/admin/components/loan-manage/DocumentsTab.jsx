// admin/components/loan-manage/DocumentsTab.jsx — ניהול מסמכים (5.6)
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiUpload, FiTrash2, FiEye, FiList } from "react-icons/fi";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../../services/adminService";
import { Card, CardBody, CardHeader } from "@/portal/components/ui/Card";
import { Loading, ErrorState, EmptyState } from "@/portal/components/ui/States";
import { TextField, SelectField, Button } from "../ui/Form";
import Modal from "../ui/Modal";
import { DOCUMENT_TYPE_LABELS } from "@/portal/lib/labels";
import { formatDate } from "@/portal/lib/format";
import requests from "@/services/httpService";
import { notifyError, notifySuccess } from "@/utils/toast";

const TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function DocumentsTab({ loanId }) {
  const { data, loading, error, refetch } = useApi(
    () => AdminService.listDocuments(loanId),
    [loanId]
  );
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logsDoc, setLogsDoc] = useState(null);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { type: "loan_agreement", title: "", visibleToCustomer: true },
  });

  const onUpload = async (v) => {
    if (!file) return notifyError("יש לבחור קובץ");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", v.type);
      if (v.title) fd.append("title", v.title);
      fd.append("visibleToCustomer", v.visibleToCustomer ? "true" : "false");
      if (v.documentDate) fd.append("documentDate", v.documentDate);
      await AdminService.uploadDocument(loanId, fd);
      notifySuccess("המסמך הועלה");
      reset();
      setFile(null);
      refetch();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה בהעלאה");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (doc) => {
    try {
      await AdminService.updateDocument(doc._id, {
        visibleToCustomer: !doc.visibleToCustomer,
      });
      refetch();
    } catch {
      notifyError("שגיאה בעדכון");
    }
  };

  const onDelete = async (doc) => {
    if (!window.confirm("למחוק את המסמך? (מחיקה לוגית)")) return;
    try {
      await AdminService.deleteDocument(doc._id);
      notifySuccess("המסמך נמחק");
      refetch();
    } catch {
      notifyError("שגיאה במחיקה");
    }
  };

  const viewDoc = async (doc) => {
    try {
      const blob = await requests.get(`/admin/documents/${doc._id}/file`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch {
      notifyError("שגיאה בפתיחת המסמך");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="העלאת מסמך" />
        <CardBody>
          <form onSubmit={handleSubmit(onUpload)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="סוג מסמך" register={register} name="type" options={TYPE_OPTIONS} />
            <TextField label="שם מסמך (ריק=שם הקובץ)" register={register} name="title" />
            <TextField label="תאריך מסמך" register={register} name="documentDate" type="date" />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">קובץ (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
              <input type="checkbox" {...register("visibleToCustomer")} className="rounded" />
              גלוי ללקוח
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>
                <FiUpload /> העלאה
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="מסמכים" />
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="לא הועלו מסמכים" />
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.map((doc) => (
              <li key={doc._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs text-brand-600">{DOCUMENT_TYPE_LABELS[doc.type] || "מסמך"}</div>
                  <div className="truncate font-medium text-gray-900">{doc.title}</div>
                  <div className="text-xs text-gray-500">{formatDate(doc.documentDate)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600">
                    <input type="checkbox" checked={doc.visibleToCustomer} onChange={() => toggleVisible(doc)} className="rounded" />
                    גלוי ללקוח
                  </label>
                  <button onClick={() => viewDoc(doc)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" title="צפייה"><FiEye /></button>
                  <button onClick={() => setLogsDoc(doc)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" title="לוג הורדות"><FiList /></button>
                  <button onClick={() => onDelete(doc)} className="rounded-lg border border-gray-200 p-2 text-red-500 hover:bg-red-50" title="מחיקה"><FiTrash2 /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <LogsModal doc={logsDoc} onClose={() => setLogsDoc(null)} />
    </div>
  );
}

function LogsModal({ doc, onClose }) {
  const { data, loading } = useApi(
    () => (doc ? AdminService.getDocumentLogs(doc._id) : Promise.resolve([])),
    [doc?._id]
  );
  return (
    <Modal open={!!doc} title={`לוג הורדות — ${doc?.title || ""}`} onClose={onClose}>
      {loading ? (
        <Loading />
      ) : !data || data.length === 0 ? (
        <EmptyState title="אין רישומי צפייה/הורדה" />
      ) : (
        <ul className="divide-y divide-gray-100 text-sm">
          {data.map((log) => (
            <li key={log._id} className="flex items-center justify-between py-2">
              <span>{log.action === "DOWNLOAD_DOCUMENT" ? "הורדה" : "צפייה"}</span>
              <span className="text-gray-500">{formatDate(log.createdAt)} · {log.ip}</span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
