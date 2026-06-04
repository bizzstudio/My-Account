// admin/components/loan-manage/DetailsTab.jsx — עריכת פרטי הלוואה מלאים (4.1/4.5/4.7/4.9)
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardBody, CardHeader } from "@/portal/components/ui/Card";
import { TextField, SelectField, TextArea, Button } from "../ui/Form";
import AdminService from "../../services/adminService";
import { notifyError, notifySuccess } from "@/utils/toast";

const STATUS_OPTIONS = [
  { value: "active", label: "פעילה" },
  { value: "closed", label: "סגורה" },
  { value: "default", label: "בפיגור" },
  { value: "sold", label: "נמכרה" },
];

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function DetailsTab({ loan, onSaved }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      loanNumber: loan.loanNumber,
      status: loan.status,
      originalAmount: loan.originalAmount,
      originalTermMonths: loan.originalTermMonths,
      currentTermMonths: loan.currentTermMonths || "",
      disbursementDate: toDateInput(loan.disbursementDate),
      nominalInterestRate: loan.nominalInterestRate || "",
      asOfDate: toDateInput(loan.asOfDate),
      linkage: {
        type: loan.linkage?.type || "",
        base: loan.linkage?.base || "",
        changeDate: toDateInput(loan.linkage?.changeDate),
        rateAtOrigination: loan.linkage?.rateAtOrigination ?? "",
        appliesTo: loan.linkage?.appliesTo || "",
      },
      earlyRepayment: {
        payoffAmount: loan.earlyRepayment?.payoffAmount ?? "",
        calculationDate: toDateInput(loan.earlyRepayment?.calculationDate),
        principal: loan.earlyRepayment?.principal ?? "",
        interest: loan.earlyRepayment?.interest ?? "",
        linkage: loan.earlyRepayment?.linkage ?? "",
        fees: loan.earlyRepayment?.fees ?? "",
        instructions: loan.earlyRepayment?.instructions || "",
        contactInfo: loan.earlyRepayment?.contactInfo || "",
      },
      thirdParty: {
        isSold: loan.thirdParty?.isSold || false,
        name: loan.thirdParty?.name || "",
        identifier: loan.thirdParty?.identifier || "",
        phone: loan.thirdParty?.phone || "",
        email: loan.thirdParty?.email || "",
        address: loan.thirdParty?.address || "",
      },
      merchant: {
        name: loan.merchant?.name || "",
        phone: loan.merchant?.phone || "",
        email: loan.merchant?.email || "",
        address: loan.merchant?.address || "",
        contactDetails: loan.merchant?.contactDetails || "",
      },
    },
  });

  const num = (v) => (v === "" || v == null ? undefined : Number(v));

  const onSubmit = async (v) => {
    setSaving(true);
    try {
      const payload = {
        loanNumber: v.loanNumber,
        status: v.status,
        originalAmount: num(v.originalAmount),
        originalTermMonths: num(v.originalTermMonths),
        currentTermMonths: num(v.currentTermMonths),
        disbursementDate: v.disbursementDate || undefined,
        nominalInterestRate: num(v.nominalInterestRate),
        asOfDate: v.asOfDate || undefined,
        linkage: {
          ...v.linkage,
          rateAtOrigination: num(v.linkage.rateAtOrigination),
          changeDate: v.linkage.changeDate || undefined,
        },
        earlyRepayment: {
          ...v.earlyRepayment,
          payoffAmount: num(v.earlyRepayment.payoffAmount),
          principal: num(v.earlyRepayment.principal),
          interest: num(v.earlyRepayment.interest),
          linkage: num(v.earlyRepayment.linkage),
          fees: num(v.earlyRepayment.fees),
          calculationDate: v.earlyRepayment.calculationDate || undefined,
        },
        thirdParty: v.thirdParty,
        merchant: v.merchant,
      };
      await AdminService.updateLoan(loan._id, payload);
      notifySuccess("ההלוואה עודכנה");
      onSaved && onSaved();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה בעדכון");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader title="תקציר ויתרות בסיס" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="מספר הלוואה" register={register} name="loanNumber" />
          <SelectField label="סטטוס" register={register} name="status" options={STATUS_OPTIONS} />
          <TextField label="סכום מקורי" register={register} name="originalAmount" type="number" />
          <TextField label="תקופה מקורית (חודשים)" register={register} name="originalTermMonths" type="number" />
          <TextField label="תקופה נוכחית (חודשים)" register={register} name="currentTermMonths" type="number" />
          <TextField label="מועד העמדה" register={register} name="disbursementDate" type="date" />
          <TextField label="ריבית נומינלית (%)" register={register} name="nominalInterestRate" type="number" step="0.001" />
          <TextField label="תאריך עדכניות מידע" register={register} name="asOfDate" type="date" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="הצמדה (4.5)" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="סוג הצמדה" register={register} name="linkage.type" />
          <TextField label="בסיס הצמדה" register={register} name="linkage.base" />
          <TextField label="מועד שינוי" register={register} name="linkage.changeDate" type="date" />
          <TextField label="שיעור ריבית במתן ההלוואה (%)" register={register} name="linkage.rateAtOrigination" type="number" step="0.001" />
          <TextField label="רכיבים שעליהם חלה ההצמדה" register={register} name="linkage.appliesTo" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="פירעון מוקדם (4.7)" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="יתרה לפירעון מוקדם" register={register} name="earlyRepayment.payoffAmount" type="number" />
          <TextField label="תאריך חישוב" register={register} name="earlyRepayment.calculationDate" type="date" />
          <TextField label="קרן" register={register} name="earlyRepayment.principal" type="number" />
          <TextField label="ריבית" register={register} name="earlyRepayment.interest" type="number" />
          <TextField label="הצמדה" register={register} name="earlyRepayment.linkage" type="number" />
          <TextField label="עמלות" register={register} name="earlyRepayment.fees" type="number" />
          <div className="sm:col-span-2">
            <TextArea label="הוראות לביצוע פירעון" register={register} name="earlyRepayment.instructions" />
          </div>
          <div className="sm:col-span-2">
            <TextArea label="פרטי קשר לבירור" register={register} name="earlyRepayment.contactInfo" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="נמכרה לצד שלישי (4.9)" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input type="checkbox" {...register("thirdParty.isSold")} className="rounded" />
            ההלוואה נמכרה לצד שלישי
          </label>
          <TextField label="שם הצד השלישי" register={register} name="thirdParty.name" />
          <TextField label="מזהה" register={register} name="thirdParty.identifier" />
          <TextField label="טלפון" register={register} name="thirdParty.phone" />
          <TextField label="אימייל" register={register} name="thirdParty.email" />
          <TextField label="כתובת" register={register} name="thirdParty.address" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="מימון עסקה מול בית עסק (4.9)" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="שם בית העסק" register={register} name="merchant.name" />
          <TextField label="טלפון" register={register} name="merchant.phone" />
          <TextField label="אימייל" register={register} name="merchant.email" />
          <TextField label="כתובת" register={register} name="merchant.address" />
          <div className="sm:col-span-2">
            <TextArea label="פרטי התקשרות" register={register} name="merchant.contactDetails" />
          </div>
        </CardBody>
      </Card>

      <div className="sticky bottom-0 bg-gray-50 py-3">
        <Button type="submit" loading={saving}>שמירת שינויים</Button>
      </div>
    </form>
  );
}
