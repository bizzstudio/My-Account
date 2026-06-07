// admin/pages/Customers.jsx — ניהול לקוחות (5.3)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { useForm } from "react-hook-form";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../services/adminService";
import { Card } from "@/portal/components/ui/Card";
import DataTable from "@/portal/components/ui/DataTable";
import Badge from "@/portal/components/ui/Badge";
import { Loading, ErrorState } from "@/portal/components/ui/States";
import Modal from "../components/ui/Modal";
import SearchBox from "../components/ui/SearchBox";
import { TextField, SelectField, Button } from "../components/ui/Form";
import { notifyError, notifySuccess } from "@/utils/toast";

export default function Customers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { data, loading, error, refetch } = useApi(
    () => AdminService.listCustomers(query),
    [query]
  );
  const { register, handleSubmit, reset } = useForm();

  const openCreate = () => {
    reset({ nationalId: "", firstName: "", lastName: "", phone: "", email: "", address: "", status: "active" });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await AdminService.createCustomer(values);
      notifySuccess("הלקוח נוצר בהצלחה");
      setModalOpen(false);
      refetch();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה ביצירת לקוח");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "nationalId", header: "ת״ז" },
    { key: "name", header: "שם", render: (r) => `${r.firstName} ${r.lastName}` },
    { key: "phone", header: "טלפון" },
    { key: "email", header: "אימייל", render: (r) => r.email || "—" },
    { key: "loansCount", header: "הלוואות", align: "end" },
    {
      key: "status",
      header: "סטטוס",
      render: (r) => (
        <Badge tone={r.status === "active" ? "green" : "red"}>
          {r.status === "active" ? "פעיל" : "חסום"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">לקוחות</h1>
        <Button onClick={openCreate}>
          <FiPlus /> לקוח חדש
        </Button>
      </div>

      <SearchBox
        placeholder="חיפוש לפי שם, ת״ז, טלפון או אימייל"
        onSearch={setQuery}
      />

      <Card>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <div
            className="cursor-pointer"
            onClick={(e) => {
              const tr = e.target.closest("tr[data-id]");
              if (tr) navigate(`/admin/customers/${tr.dataset.id}`);
            }}
          >
            <DataTableClickable columns={columns} rows={data} />
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title="לקוח חדש"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>ביטול</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saving}>שמירה</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="תעודת זהות" register={register} name="nationalId" required />
          <TextField label="טלפון" register={register} name="phone" required />
          <TextField label="שם פרטי" register={register} name="firstName" required />
          <TextField label="שם משפחה" register={register} name="lastName" required />
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

// טבלה עם data-id לכל שורה (לניווט בלחיצה)
function DataTableClickable({ columns, rows }) {
  if (!rows || rows.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-500">לא נמצאו לקוחות</div>;
  }
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
            {columns.map((c) => (
              <th key={c.key} className={`whitespace-nowrap px-3 py-3 text-start font-semibold ${c.align === "end" ? "text-end" : ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row._id} data-id={row._id} className="hover:bg-brand-50">
              {columns.map((c) => (
                <td key={c.key} className={`whitespace-nowrap px-3 py-3 text-gray-800 ${c.align === "end" ? "text-end" : ""}`}>
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
