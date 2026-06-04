// admin/pages/CustomerDetail.jsx — פרטי לקוח + עריכה + הלוואות משויכות (5.3)
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiChevronRight, FiEdit2, FiPlus } from "react-icons/fi";
import { useForm } from "react-hook-form";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../services/adminService";
import { Card, CardBody, CardHeader } from "@/portal/components/ui/Card";
import { FieldList, Field } from "@/portal/components/ui/Field";
import Badge from "@/portal/components/ui/Badge";
import { Loading, ErrorState, EmptyState } from "@/portal/components/ui/States";
import { LOAN_STATUS_LABELS, LOAN_STATUS_TONE } from "@/portal/lib/labels";
import { formatMoney, formatDate } from "@/portal/lib/format";
import Modal from "../components/ui/Modal";
import { TextField, SelectField, Button } from "../components/ui/Form";
import { notifyError, notifySuccess } from "@/utils/toast";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(
    () => AdminService.getCustomer(id),
    [id]
  );
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const openEdit = () => {
    reset({
      nationalId: data.nationalId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || "",
      address: data.address || "",
      status: data.status,
    });
    setEditOpen(true);
  };

  const onSave = async (values) => {
    setSaving(true);
    try {
      await AdminService.updateCustomer(id, values);
      notifySuccess("הלקוח עודכן");
      setEditOpen(false);
      refetch();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה בעדכון");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <FiChevronRight /> חזרה ללקוחות
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {data.firstName} {data.lastName}
        </h1>
        <Button variant="secondary" onClick={openEdit}>
          <FiEdit2 /> עריכה
        </Button>
      </div>

      <Card>
        <CardHeader title="פרטי לקוח" />
        <CardBody>
          <FieldList>
            <Field label="תעודת זהות" value={data.nationalId} />
            <Field label="טלפון" value={data.phone} />
            <Field label="אימייל" value={data.email} />
            <Field label="כתובת" value={data.address} />
            <Field label="סטטוס">
              <Badge tone={data.status === "active" ? "green" : "red"}>
                {data.status === "active" ? "פעיל" : "חסום"}
              </Badge>
            </Field>
          </FieldList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="הלוואות משויכות"
          action={
            <Button onClick={() => navigate(`/admin/loans/new?customerId=${id}`)}>
              <FiPlus /> הלוואה חדשה
            </Button>
          }
        />
        <CardBody>
          {data.loans && data.loans.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {data.loans.map((loan) => (
                <li key={loan._id}>
                  <Link
                    to={`/admin/loans/${loan._id}`}
                    className="group relative flex items-center justify-between py-3 hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">הלוואה מס׳ {loan.loanNumber}</div>
                      <div className="text-xs text-gray-500">
                        {formatMoney(loan.originalAmount)} · {formatDate(loan.disbursementDate)}
                      </div>
                    </div>
                    <Badge tone={LOAN_STATUS_TONE[loan.status] || "gray"}>
                      {LOAN_STATUS_LABELS[loan.status] || loan.status}
                    </Badge>

                    {/* תקציר — בועה צפה במעבר עכבר */}
                    <div className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-72 max-w-[calc(100%-1rem)] origin-top translate-y-1 scale-95 opacity-0 transition duration-150 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
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
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="אין הלוואות משויכות" />
          )}
        </CardBody>
      </Card>

      <Modal
        open={editOpen}
        title="עריכת לקוח"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>ביטול</Button>
            <Button onClick={handleSubmit(onSave)} loading={saving}>שמירה</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSave)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="תעודת זהות" register={register} name="nationalId" />
          <TextField label="טלפון" register={register} name="phone" />
          <TextField label="שם פרטי" register={register} name="firstName" />
          <TextField label="שם משפחה" register={register} name="lastName" />
          <TextField label="אימייל" register={register} name="email" type="email" />
          <TextField label="כתובת" register={register} name="address" />
          <SelectField
            label="סטטוס"
            register={register}
            name="status"
            options={[
              { value: "active", label: "פעיל" },
              { value: "blocked", label: "חסום" },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
