// admin/components/loan-manage/TracksTab.jsx — ניהול מסלולים (5.4)
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Card, CardHeader, CardBody } from "@/portal/components/ui/Card";
import { EmptyState } from "@/portal/components/ui/States";
import Modal from "../ui/Modal";
import { TextField, Button } from "../ui/Form";
import AdminService from "../../services/adminService";
import { formatMoney, formatPercent, formatDate } from "@/portal/lib/format";
import { notifyError, notifySuccess } from "@/utils/toast";

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function TracksTab({ loanId, tracks, onChanged }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const openNew = () => {
    setEditing(null);
    reset({ name: "", amount: "", principalBalance: "", interestRate: "", interestChangeFrequency: "", nextInterestChangeDate: "", interestChangeEvents: "", defaultInterestRate: "", linkageType: "", linkageBaseDate: "", linkageAppliesTo: "" });
    setOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    reset({
      name: t.name || "",
      amount: t.amount ?? "",
      principalBalance: t.principalBalance ?? "",
      interestRate: t.interestRate ?? "",
      interestChangeFrequency: t.interestChangeFrequency || "",
      nextInterestChangeDate: toDateInput(t.nextInterestChangeDate),
      interestChangeEvents: t.interestChangeEvents || "",
      defaultInterestRate: t.defaultInterestRate ?? "",
      linkageType: t.linkageType || "",
      linkageBaseDate: toDateInput(t.linkageBaseDate),
      linkageAppliesTo: t.linkageAppliesTo || "",
    });
    setOpen(true);
  };

  const onSubmit = async (v) => {
    setSaving(true);
    const num = (x) => (x === "" || x == null ? undefined : Number(x));
    const payload = {
      name: v.name,
      amount: num(v.amount),
      principalBalance: num(v.principalBalance),
      interestRate: num(v.interestRate),
      interestChangeFrequency: v.interestChangeFrequency,
      nextInterestChangeDate: v.nextInterestChangeDate || undefined,
      interestChangeEvents: v.interestChangeEvents,
      defaultInterestRate: num(v.defaultInterestRate),
      linkageType: v.linkageType,
      linkageBaseDate: v.linkageBaseDate || undefined,
      linkageAppliesTo: v.linkageAppliesTo,
    };
    try {
      if (editing) {
        await AdminService.updateTrack(loanId, editing._id, payload);
        notifySuccess("המסלול עודכן");
      } else {
        await AdminService.addTrack(loanId, payload);
        notifySuccess("המסלול נוסף");
      }
      setOpen(false);
      onChanged && onChanged();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (t) => {
    if (!window.confirm("למחוק את המסלול?")) return;
    try {
      await AdminService.deleteTrack(loanId, t._id);
      notifySuccess("המסלול נמחק");
      onChanged && onChanged();
    } catch (err) {
      notifyError("שגיאה במחיקה");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <FiPlus /> מסלול חדש
        </Button>
      </div>

      {!tracks || tracks.length === 0 ? (
        <EmptyState title="לא הוגדרו מסלולים" />
      ) : (
        tracks.map((t) => (
          <Card key={t._id}>
            <CardHeader
              title={t.name}
              action={
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><FiEdit2 /></button>
                  <button onClick={() => onDelete(t)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><FiTrash2 /></button>
                </div>
              }
            />
            <CardBody className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Info label="סכום במסלול" value={formatMoney(t.amount)} />
              <Info label="יתרת קרן" value={formatMoney(t.principalBalance)} />
              <Info label="ריבית נומינלית" value={formatPercent(t.interestRate)} />
              <Info label="תדירות שינוי" value={t.interestChangeFrequency || "—"} />
              <Info label="מועד שינוי קרוב" value={formatDate(t.nextInterestChangeDate)} />
              <Info label="ריבית פיגורים" value={t.defaultInterestRate != null ? formatPercent(t.defaultInterestRate) : "—"} />
            </CardBody>
          </Card>
        ))
      )}

      <Modal
        open={open}
        title={editing ? "עריכת מסלול" : "מסלול חדש"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saving}>שמירה</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="שם מסלול" register={register} name="name" required />
          <TextField label="סכום במסלול" register={register} name="amount" type="number" />
          <TextField label="יתרת קרן במסלול" register={register} name="principalBalance" type="number" />
          <TextField label="ריבית נומינלית (%)" register={register} name="interestRate" type="number" step="0.001" />
          <TextField label="תדירות שינוי ריבית" register={register} name="interestChangeFrequency" />
          <TextField label="מועד שינוי קרוב" register={register} name="nextInterestChangeDate" type="date" />
          <TextField label="אירועים לשינוי ריבית" register={register} name="interestChangeEvents" />
          <TextField label="ריבית פיגורים (%)" register={register} name="defaultInterestRate" type="number" step="0.001" />
          <TextField label="סוג הצמדה" register={register} name="linkageType" />
          <TextField label="בסיס הצמדה (תאריך)" register={register} name="linkageBaseDate" type="date" />
          <TextField label="רכיבי הצמדה" register={register} name="linkageAppliesTo" />
        </form>
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );
}
