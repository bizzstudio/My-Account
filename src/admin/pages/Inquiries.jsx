// admin/pages/Inquiries.jsx — ניהול פניות (5.7)
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../services/adminService";
import { Card, CardBody } from "@/portal/components/ui/Card";
import Badge from "@/portal/components/ui/Badge";
import { Loading, ErrorState, EmptyState } from "@/portal/components/ui/States";
import Modal from "../components/ui/Modal";
import { TextArea, SelectField, Button } from "../components/ui/Form";
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_TONE } from "@/portal/lib/labels";
import { formatDate } from "@/portal/lib/format";
import { notifyError, notifySuccess } from "@/utils/toast";

const STATUS_FILTERS = [
  { value: "", label: "הכל" },
  { value: "open", label: "פתוחות" },
  { value: "in_progress", label: "בטיפול" },
  { value: "closed", label: "סגורות" },
];

const STATUS_OPTIONS = [
  { value: "open", label: "פתוחה" },
  { value: "in_progress", label: "בטיפול" },
  { value: "closed", label: "סגורה" },
];

export default function Inquiries() {
  const [status, setStatus] = useState("");
  const { data, loading, error, refetch } = useApi(
    () => AdminService.listInquiries(status),
    [status]
  );
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const openRespond = (inq) => {
    setActive(inq);
    reset({ adminResponse: inq.adminResponse || "", status: inq.status });
  };

  const onSubmit = async (v) => {
    setSaving(true);
    try {
      await AdminService.updateInquiry(active._id, v);
      notifySuccess("הפנייה עודכנה");
      setActive(null);
      refetch();
    } catch (err) {
      notifyError("שגיאה בעדכון");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">פניות</h1>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                status === f.value ? "bg-brand-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="לא נמצאו פניות" />
      ) : (
        <div className="space-y-3">
          {data.map((inq) => (
            <Card key={inq._id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {inq.inquiryNumber && <span className="text-xs text-gray-400">#{inq.inquiryNumber}</span>}
                      <h4 className="truncate font-semibold text-gray-900">{inq.subject}</h4>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {inq.customerId ? `${inq.customerId.firstName} ${inq.customerId.lastName}` : ""}
                      {inq.loanId ? ` · הלוואה ${inq.loanId.loanNumber}` : ""} · {formatDate(inq.createdAt)}
                    </div>
                  </div>
                  <Badge tone={INQUIRY_STATUS_TONE[inq.status] || "gray"}>
                    {INQUIRY_STATUS_LABELS[inq.status] || inq.status}
                  </Badge>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{inq.message}</p>
                {inq.adminResponse && (
                  <div className="mt-3 rounded-xl bg-gray-50 p-3">
                    <div className="mb-1 text-xs font-medium text-brand-600">מענה · {formatDate(inq.respondedAt)}</div>
                    <p className="whitespace-pre-wrap text-sm text-gray-700">{inq.adminResponse}</p>
                  </div>
                )}
                <div className="mt-3">
                  <Button variant="secondary" onClick={() => openRespond(inq)}>מענה / עדכון סטטוס</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!active}
        title="מענה לפנייה"
        onClose={() => setActive(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActive(null)}>ביטול</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saving}>שמירה</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextArea label="מענה החברה" register={register} name="adminResponse" rows={5} />
          <SelectField label="סטטוס" register={register} name="status" options={STATUS_OPTIONS} />
        </form>
      </Modal>
    </div>
  );
}
