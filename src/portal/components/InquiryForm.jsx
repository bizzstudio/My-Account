// portal/components/InquiryForm.jsx — פתיחת פנייה חדשה (4.8)
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { Spinner } from "./ui/States";
import MeService from "../services/meService";
import { notifyError, notifySuccess } from "@/utils/toast";

// props:
//  loans?       — רשימת הלוואות לבחירה (אופציונלי)
//  fixedLoanId? — נעילת הפנייה להלוואה מסוימת (לשונית פירעון מוקדם / הלוואה)
//  defaultSubject?
//  onCreated()  — קולבק לרענון הרשימה
export default function InquiryForm({ loans, fixedLoanId, defaultSubject, onCreated }) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loanId: fixedLoanId || "",
      subject: defaultSubject || "",
      message: "",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const body = {
        subject: values.subject.trim(),
        message: values.message.trim(),
        loanId: fixedLoanId || values.loanId || undefined,
      };
      await MeService.createInquiry(body);
      notifySuccess("הפנייה נשלחה בהצלחה");
      reset({ loanId: fixedLoanId || "", subject: "", message: "" });
      onCreated && onCreated();
    } catch (err) {
      notifyError(err?.response?.data?.message?.he || "שגיאה בשליחת הפנייה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="פתיחת פנייה חדשה" />
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* בחירת הלוואה — רק אם לא ננעלה ויש רשימה */}
          {!fixedLoanId && loans && loans.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                הלוואה (אופציונלי)
              </label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                {...register("loanId")}
              >
                <option value="">כללי / ללא שיוך</option>
                {loans.map((l) => (
                  <option key={l._id} value={l._id}>
                    הלוואה מס׳ {l.loanNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              נושא
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              placeholder="נושא הפנייה"
              {...register("subject", { required: true })}
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-red-600">שדה חובה</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              הודעה
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              placeholder="פרטו את פנייתכם"
              {...register("message", { required: true })}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-600">שדה חובה</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading && <Spinner />}
            שליחת פנייה
          </button>
        </form>
      </CardBody>
    </Card>
  );
}
