// admin/components/loan-manage/TransactionsTab.jsx — ניהול תנועות (5.5)
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Card, CardHeader } from "@/portal/components/ui/Card";
import { EmptyState } from "@/portal/components/ui/States";
import Modal from "../ui/Modal";
import { TextField, SelectField, TextArea, Button } from "../ui/Form";
import AdminService from "../../services/adminService";
import { formatMoney, formatDate } from "@/portal/lib/format";
import { TRANSACTION_TYPE_LABELS } from "@/portal/lib/labels";
import { notifyError, notifySuccess } from "@/utils/toast";

const TYPE_OPTIONS = Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function TransactionsTab({ loanId, transactions, onChanged, isSuperAdmin }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const openNew = () => {
    setEditing(null);
    reset({
      transactionDate: toDateInput(new Date()),
      type: "monthly_payment",
      principalComponent: 0,
      interestComponent: 0,
      linkageComponent: 0,
      feeComponent: 0,
      totalAmount: "",
      balanceAfter: "",
      description: "",
    });
    setOpen(true);
  };

  const openEdit = (tx) => {
    setEditing(tx);
    reset({
      transactionDate: toDateInput(tx.transactionDate),
      type: tx.type,
      principalComponent: tx.principalComponent,
      interestComponent: tx.interestComponent,
      linkageComponent: tx.linkageComponent,
      feeComponent: tx.feeComponent,
      totalAmount: tx.totalAmount,
      balanceAfter: tx.balanceAfter ?? "",
      description: tx.description || "",
    });
    setOpen(true);
  };

  const onSubmit = async (v) => {
    setSaving(true);
    const num = (x) => (x === "" || x == null ? undefined : Number(x));
    const payload = {
      transactionDate: v.transactionDate || undefined,
      type: v.type,
      principalComponent: Number(v.principalComponent) || 0,
      interestComponent: Number(v.interestComponent) || 0,
      linkageComponent: Number(v.linkageComponent) || 0,
      feeComponent: Number(v.feeComponent) || 0,
      totalAmount: num(v.totalAmount),
      balanceAfter: num(v.balanceAfter),
      description: v.description,
    };
    try {
      if (editing) {
        await AdminService.updateTransaction(loanId, editing._id, payload);
        notifySuccess("התנועה עודכנה");
      } else {
        await AdminService.addTransaction(loanId, payload);
        notifySuccess("התנועה נוספה");
      }
      setOpen(false);
      onChanged && onChanged();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (tx) => {
    if (!window.confirm("למחוק את התנועה? פעולה זו אינה ניתנת לשחזור.")) return;
    try {
      await AdminService.deleteTransaction(loanId, tx._id);
      notifySuccess("התנועה נמחקה");
      onChanged && onChanged();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה במחיקה");
    }
  };

  return (
    <Card>
      <CardHeader
        title="תנועות והחזרים"
        action={
          <Button onClick={openNew}>
            <FiPlus /> תנועה חדשה
          </Button>
        }
      />
      {!transactions || transactions.length === 0 ? (
        <EmptyState title="לא נרשמו תנועות" />
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                {["תאריך", "סוג", "קרן", "ריבית", "הצמדה", "עמלה", "סה״כ", "יתרה אחרי", ""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3 text-start font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-3">{formatDate(tx.transactionDate)}</td>
                  <td className="whitespace-nowrap px-3 py-3">{TRANSACTION_TYPE_LABELS[tx.type] || tx.type}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end">{formatMoney(tx.principalComponent)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end">{formatMoney(tx.interestComponent)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end">{formatMoney(tx.linkageComponent)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end">{formatMoney(tx.feeComponent)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end font-semibold">{formatMoney(tx.totalAmount)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end">{formatMoney(tx.balanceAfter)}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(tx)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="עריכה">
                        <FiEdit2 />
                      </button>
                      {isSuperAdmin && (
                        <button onClick={() => onDelete(tx)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="מחיקה">
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        title={editing ? "עריכת תנועה" : "תנועה חדשה"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saving}>שמירה</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="תאריך" register={register} name="transactionDate" type="date" />
          <SelectField label="סוג תנועה" register={register} name="type" options={TYPE_OPTIONS} />
          <TextField label="קרן" register={register} name="principalComponent" type="number" />
          <TextField label="ריבית" register={register} name="interestComponent" type="number" />
          <TextField label="הצמדה" register={register} name="linkageComponent" type="number" />
          <TextField label="עמלה" register={register} name="feeComponent" type="number" />
          <TextField label="סה״כ (ריק=סכימה)" register={register} name="totalAmount" type="number" />
          <TextField label="יתרה לאחר פעולה" register={register} name="balanceAfter" type="number" />
          <div className="sm:col-span-2">
            <TextArea label="תיאור" register={register} name="description" rows={2} />
          </div>
        </form>
      </Modal>
    </Card>
  );
}
