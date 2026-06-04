// admin/components/loan-manage/BalancesTab.jsx — עדכון יתרות (5.4)
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../../services/adminService";
import { Card, CardBody, CardHeader } from "@/portal/components/ui/Card";
import DataTable from "@/portal/components/ui/DataTable";
import { Loading, ErrorState } from "@/portal/components/ui/States";
import { TextField, Button } from "../ui/Form";
import { formatMoney, formatDate } from "@/portal/lib/format";
import { notifyError, notifySuccess } from "@/utils/toast";

export default function BalancesTab({ loanId, onChanged }) {
  const [saving, setSaving] = useState(false);
  const { data, loading, error, refetch } = useApi(
    () => AdminService.listBalances ? AdminService.listBalances(loanId) : Promise.resolve([]),
    [loanId]
  );
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (v) => {
    setSaving(true);
    try {
      await AdminService.addBalance(loanId, {
        principalBalance: Number(v.principalBalance) || 0,
        interestBalance: Number(v.interestBalance) || 0,
        linkageBalance: v.linkageBalance ? Number(v.linkageBalance) : undefined,
        totalBalance: v.totalBalance ? Number(v.totalBalance) : undefined,
        lastPaymentAmount: v.lastPaymentAmount ? Number(v.lastPaymentAmount) : undefined,
        lastPaymentDate: v.lastPaymentDate || undefined,
        asOfDate: v.asOfDate || undefined,
      });
      notifySuccess("יתרה נוספה");
      reset();
      refetch();
      onChanged && onChanged();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "asOfDate", header: "תאריך", render: (r) => formatDate(r.asOfDate) },
    { key: "principalBalance", header: "קרן", align: "end", render: (r) => formatMoney(r.principalBalance) },
    { key: "interestBalance", header: "ריבית", align: "end", render: (r) => formatMoney(r.interestBalance) },
    { key: "linkageBalance", header: "הצמדה", align: "end", render: (r) => formatMoney(r.linkageBalance) },
    { key: "totalBalance", header: "סה״כ", align: "end", className: "font-semibold", render: (r) => formatMoney(r.totalBalance) },
    { key: "lastPaymentAmount", header: "תשלום אחרון", align: "end", render: (r) => formatMoney(r.lastPaymentAmount) },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="הוספת תמונת יתרות" />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="יתרת קרן" register={register} name="principalBalance" type="number" required />
            <TextField label="יתרת ריבית" register={register} name="interestBalance" type="number" required />
            <TextField label="יתרת הצמדה" register={register} name="linkageBalance" type="number" />
            <TextField label="סה״כ (ריק=חישוב אוטומטי)" register={register} name="totalBalance" type="number" />
            <TextField label="תשלום אחרון" register={register} name="lastPaymentAmount" type="number" />
            <TextField label="תאריך תשלום אחרון" register={register} name="lastPaymentDate" type="date" />
            <TextField label="תאריך עדכניות מידע" register={register} name="asOfDate" type="date" />
            <div className="sm:col-span-3">
              <Button type="submit" loading={saving}>הוספת יתרה</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="היסטוריית יתרות" />
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <DataTable columns={columns} rows={data} emptyText="אין יתרות שנשמרו" />
        )}
      </Card>
    </div>
  );
}
