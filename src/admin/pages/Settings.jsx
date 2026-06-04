// admin/pages/Settings.jsx — עדכון פרטי בעל הרישיון (4.9)
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useApi from "@/portal/hooks/useApi";
import AdminService from "../services/adminService";
import { Card, CardBody, CardHeader } from "@/portal/components/ui/Card";
import { Loading, ErrorState } from "@/portal/components/ui/States";
import { TextField, TextArea, Button } from "../components/ui/Form";
import { notifyError, notifySuccess } from "@/utils/toast";

export default function Settings() {
  const { data, loading, error, refetch } = useApi(
    () => AdminService.getLicenseHolder(),
    []
  );
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = async (v) => {
    setSaving(true);
    try {
      await AdminService.updateLicenseHolder(v);
      notifySuccess("הפרטים נשמרו");
      refetch();
    } catch (err) {
      notifyError("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">הגדרות — פרטי בעל הרישיון</h1>
      <Card>
        <CardHeader title="פרטי החברה / בעל הרישיון" />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="שם בעל הרישיון" register={register} name="name" />
            <TextField label="מספר מזהה" register={register} name="identifier" />
            <TextField label="מען" register={register} name="address" />
            <TextField label="דוא״ל" register={register} name="email" type="email" />
            <TextField label="טלפון" register={register} name="phone" />
            <div className="sm:col-span-2">
              <TextArea label="פנייה לממונה על פניות הציבור" register={register} name="publicComplaintsOfficer" />
            </div>
            <div className="sm:col-span-2">
              <TextArea label="פרטים כלליים על פעילות החברה" register={register} name="companyInfo" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>שמירה</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
