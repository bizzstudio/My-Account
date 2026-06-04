// admin/pages/LoanForm.jsx — יצירת הלוואה חדשה (5.4)
import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useForm } from "react-hook-form";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../services/adminService";
import { Card, CardBody, CardHeader } from "@/portal/components/ui/Card";
import { Loading, ErrorState } from "@/portal/components/ui/States";
import { TextField, SelectField, Button } from "../components/ui/Form";
import { notifyError, notifySuccess } from "@/utils/toast";

const STATUS_OPTIONS = [
  { value: "active", label: "פעילה" },
  { value: "closed", label: "סגורה" },
  { value: "default", label: "בפיגור" },
  { value: "sold", label: "נמכרה" },
];

export default function LoanForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetCustomer = params.get("customerId") || "";
  const [saving, setSaving] = useState(false);

  const customersQuery = useApi(() => AdminService.listCustomers(), []);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      customerId: presetCustomer,
      status: "active",
    },
  });

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        originalAmount: Number(values.originalAmount),
        originalTermMonths: Number(values.originalTermMonths) || 0,
        currentTermMonths: values.currentTermMonths ? Number(values.currentTermMonths) : undefined,
        nominalInterestRate: values.nominalInterestRate ? Number(values.nominalInterestRate) : undefined,
      };
      const loan = await AdminService.createLoan(payload);
      notifySuccess("ההלוואה נוצרה");
      navigate(`/admin/loans/${loan._id}`, { replace: true });
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה ביצירת ההלוואה");
    } finally {
      setSaving(false);
    }
  };

  if (customersQuery.loading) return <Loading />;
  if (customersQuery.error)
    return <ErrorState message={customersQuery.error} onRetry={customersQuery.refetch} />;

  const customerOptions = [
    { value: "", label: "— בחרו לקוח —" },
    ...(customersQuery.data || []).map((c) => ({
      value: c._id,
      label: `${c.firstName} ${c.lastName} (${c.nationalId})`,
    })),
  ];

  return (
    <div className="space-y-5">
      <Link to="/admin/loans" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <FiChevronRight /> חזרה להלוואות
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">הלוואה חדשה</h1>

      <Card>
        <CardHeader title="פרטי הלוואה" />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="לקוח" register={register} name="customerId" required options={customerOptions} />
            <TextField label="מספר הלוואה" register={register} name="loanNumber" required />
            <TextField label="סכום הלוואה מקורי" register={register} name="originalAmount" type="number" required />
            <TextField label="תקופה מקורית (חודשים)" register={register} name="originalTermMonths" type="number" />
            <TextField label="תקופה נוכחית (חודשים)" register={register} name="currentTermMonths" type="number" />
            <TextField label="מועד העמדת ההלוואה" register={register} name="disbursementDate" type="date" required />
            <TextField label="ריבית נומינלית (%)" register={register} name="nominalInterestRate" type="number" step="0.001" />
            <TextField label="תאריך עדכניות מידע" register={register} name="asOfDate" type="date" />
            <SelectField label="סטטוס" register={register} name="status" options={STATUS_OPTIONS} />
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>יצירת הלוואה</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
