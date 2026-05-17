// src/pages/ConsultantForm.jsx
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import logo from "@/assets/img/logo.jpeg";
import { isValidIsraeliIdOrPassport } from "@/utils/israeliId";
import { defaultLoan } from "@/hooks/Product/useProductSubmit";
// VITE_APP_API_BASE_URL = "http://localhost:3031/api" — מסירים את /api בסוף
const API_BASE = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:3031/api";
const BACKEND_URL = API_BASE.replace(/\/api$/, "");

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition text-right font-semibold text-gray-700"
      >
        <span>{title}</span>
        <span className="text-gray-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="p-5 grid grid-cols-12 gap-4">{children}</div>}
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, children, col = 6 }) => (
  <div className={`col-span-12 md:col-span-${col} flex flex-col gap-1`}>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    {children}
  </div>
);

const inputClass =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a57d45] w-full";

const Input = ({ register, name, type = "text", placeholder, step, registerOptions }) => (
  <input
    {...register(name, registerOptions)}
    type={type}
    placeholder={placeholder}
    step={step}
    className={inputClass}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ConsultantForm = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const lawyerToken = searchParams.get("token"); // מספר רישום עורך הדין (מזהה)
  const lawyerName = searchParams.get("lawyerName") || "";

  const idValidate = (v) => !v || String(v).trim() === "" || isValidIsraeliIdOrPassport(v) || t("InvalidIsraeliId");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      borrowers: [{ borrowerName: "", borrowerLastName: "", borrowerIdNumber: "", borrowerAddress: "", borrowerDateOfBirth: "", borrowerGender: "", borrowerEmail: "", borrowerIsMortgagor: false }],
      registrationDetails: {},
      sellers: [],
      loans: [],
      seniorCreditor: {},
      borrowerBankAccount: {},
      signingDetails: { consultant: "", consultantEmail: "" },
      financingCompanies: [],
      authorizedPerson: [],
      mortgagors: [],
    },
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    if (!lawyerToken) {
      setError("קישור לא תקין — חסר מספר רישום עורך הדין");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/consultant-submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lawyerToken }),
      });
      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg?.message || "שגיאה בשליחה");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Thank You Screen ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6" dir="rtl">
        <img src={logo} alt="לוגו" className="h-20 mb-8 object-contain" />
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">תודה רבה!</h2>
          <p className="text-gray-500 text-base">
            הפרטים התקבלו בהצלחה ויועברו לעורך הדין.
          </p>
        </div>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white py-10 px-4" dir="rtl">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img src={logo} alt="לוגו" className="h-20 object-contain" />
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#a57d45] px-8 py-6 text-white">
          <h1 className="text-2xl font-bold">טופס פרטי לווה</h1>
          {lawyerToken && (
            <p className="text-xl font-bold mt-2">מס׳ רישום עורך הדין: {lawyerToken}</p>
          )}
          {lawyerName && (
            <p className="text-xl font-bold mt-2">שם עורך הדין: {lawyerName}</p>
          )}
          <p className="text-base font-bold mt-1">
            אנא מלאו את הפרטים הבאים. לאחר השליחה הם יועברו ישירות לעורך הדין.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">

          {/* ══ פרטי יועץ ══ */}
          <Section title="פרטי יועץ משכנתאות">
            <Field label="שם יועץ"><Input register={register} name="signingDetails.consultant" placeholder="שם יועץ" /></Field>
            <Field label="אימייל יועץ"><Input register={register} name="signingDetails.consultantEmail" type="email" placeholder="דוא״ל יועץ" /></Field>
          </Section>

          {/* ══ לווים ══ */}
          <Section title="פרטי הלווים">
            <div className="col-span-12 flex justify-end mb-2">
              <button
                type="button"
                onClick={() => {
                  const cur = watch("borrowers") || [];
                  setValue("borrowers", [...cur, { borrowerName: "", borrowerLastName: "", borrowerIdNumber: "", borrowerAddress: "", borrowerDateOfBirth: "", borrowerGender: "", borrowerEmail: "", borrowerIsMortgagor: false }]);
                }}
                className="text-base font-bold text-[#a57d45] hover:underline"
              >
                + הוסף לווה
              </button>
            </div>
            {(watch("borrowers") || []).map((_, i) => (
              <div key={i} className="col-span-12 border rounded-xl p-4 bg-gray-50 grid grid-cols-12 gap-4">
                <Field label="שם פרטי" col={3}><Input register={register} name={`borrowers[${i}].borrowerName`} placeholder="שם פרטי" /></Field>
                <Field label="שם משפחה" col={3}><Input register={register} name={`borrowers[${i}].borrowerLastName`} placeholder="שם משפחה" /></Field>
                <Field label="מספר ת.ז / דרכון" col={3}><Input register={register} name={`borrowers[${i}].borrowerIdNumber`} type="text" placeholder="ת.ז או דרכון" registerOptions={{ validate: idValidate }} /></Field>
                {errors?.borrowers?.[i]?.borrowerIdNumber && <div className="col-span-12 text-red-600 text-sm">{errors.borrowers[i].borrowerIdNumber.message}</div>}
                <Field label="כתובת" col={6}><Input register={register} name={`borrowers[${i}].borrowerAddress`} placeholder="כתובת מגורים" /></Field>
                <Field label="תאריך לידה" col={3}><Input register={register} name={`borrowers[${i}].borrowerDateOfBirth`} type="date" /></Field>
                <Field label="מין" col={3}>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-1 text-sm"><input type="radio" value="male" {...register(`borrowers[${i}].borrowerGender`)} /> זכר</label>
                    <label className="flex items-center gap-1 text-sm"><input type="radio" value="female" {...register(`borrowers[${i}].borrowerGender`)} /> נקבה</label>
                  </div>
                </Field>
                <Field label="אימייל" col={6}><Input register={register} name={`borrowers[${i}].borrowerEmail`} type="email" placeholder="דוא״ל" /></Field>
                <Field label={t("BorrowerIsMortgagor")} col={3}>
                  <label className="flex items-center gap-2 text-sm mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value="true"
                      className="rounded border-gray-300 text-[#a57d45] focus:ring-[#a57d45]"
                      {...register(`borrowers[${i}].borrowerIsMortgagor`, {
                        setValueAs: (v) => v === true || v === "true" || v === "on",
                      })}
                    />
                    <span>{t("Yes")}</span>
                  </label>
                </Field>
                {(watch("borrowers") || []).length > 1 && (
                  <div className="col-span-12 flex justify-end">
                    <button type="button" onClick={() => setValue("borrowers", (watch("borrowers") || []).filter((_, j) => j !== i))} className="text-sm text-red-500 hover:underline">הסר לווה</button>
                  </div>
                )}
              </div>
            ))}
          </Section>

          {/* ══ פרטי רישום ══ */}
          <Section title="פרטי רישום הנכס">
            <Field label="דרגת שעבוד" col={6}>
              <select {...register("registrationDetails.lienRank")} className={inputClass}>
                <option value="">בחר...</option>
                <option value="first">דרגה ראשונה</option>
                <option value="second">דרגה שניה</option>
              </select>
            </Field>
            <Field label="סכום שעבוד בדרגה ראשונה" col={6}>
              <Input register={register} name="registrationDetails.firstLienAmount" placeholder="סכום" />
            </Field>
            <Field label="סכום שעבוד בדרגה שניה" col={6}>
              <Input register={register} name="registrationDetails.secondLienAmount" placeholder="סכום" />
            </Field>
            <Field label="גוש"><Input register={register} name="registrationDetails.block" placeholder="גוש" /></Field>
            <Field label="חלקה"><Input register={register} name="registrationDetails.plot" placeholder="חלקה" /></Field>
            <Field label="תת חלקה"><Input register={register} name="registrationDetails.subPlot" placeholder="תת חלקה" /></Field>
            <Field label="מגרש"><Input register={register} name="registrationDetails.land" placeholder="מגרש" /></Field>
            <Field label="תוכנית"><Input register={register} name="registrationDetails.plan" placeholder="תוכנית" /></Field>
            <Field label="חוזה"><Input register={register} name="registrationDetails.contract" placeholder="חוזה" /></Field>
            <Field label="שם משכנתא"><Input register={register} name="registrationDetails.mortgageName" placeholder="שם משכנתא" /></Field>
            <Field label="ח.פ חברת משכנתא"><Input register={register} name="registrationDetails.mortgageCompanyId" placeholder="ח.פ" /></Field>
            <Field label="לשכה"><Input register={register} name="registrationDetails.office" placeholder="לשכה" /></Field>
            <Field label="מרשם"><Input register={register} name="registrationDetails.registry" placeholder="מרשם" /></Field>
            <Field label='שטח במ"ר'>
              <Input register={register} name="registrationDetails.plotArea" placeholder='שטח במ"ר' />
            </Field>
            <Field label='מספר חוזה רמ"י'>
              <Input register={register} name="registrationDetails.ramiContractNumber" placeholder='חוזה רמ"י' />
            </Field>
            <Field label="מס׳ מגרש"><Input register={register} name="registrationDetails.lotNumber" placeholder="מס׳ מגרש" /></Field>
            <Field label="מספר בקשה"><Input register={register} name="registrationDetails.applicationNumber" placeholder="מספר בקשה" /></Field>
            <Field label="זכות"><Input register={register} name="registrationDetails.right" placeholder="זכות" /></Field>
            <Field label="חלקים"><Input register={register} name="registrationDetails.parts" placeholder="חלקים" /></Field>
            <Field label="סוג נכס"><Input register={register} name="registrationDetails.propertyType" placeholder="סוג נכס" /></Field>
            <Field label="רחוב"><Input register={register} name="registrationDetails.street" placeholder="רחוב" /></Field>
            <Field label="מספר בית" col={3}><Input register={register} name="registrationDetails.houseNumber" placeholder="מספר בית" /></Field>
            <Field label="מספר דירה" col={3}><Input register={register} name="registrationDetails.apartmentNumber" placeholder="מספר דירה" /></Field>
            <Field label="קומה" col={3}><Input register={register} name="registrationDetails.floor" placeholder="קומה" /></Field>
            <Field label="כיוון" col={3}><Input register={register} name="registrationDetails.direction" placeholder="כיוון" /></Field>
            <Field label="כניסה"><Input register={register} name="registrationDetails.entrance" placeholder="כניסה" /></Field>
            <Field label="יחידה"><Input register={register} name="registrationDetails.unit" placeholder="יחידה" /></Field>
            <Field label="ישוב"><Input register={register} name="registrationDetails.settlement" placeholder="ישוב" /></Field>
          </Section>

          {/* ══ מוכרים ══ */}
          <Section title="פרטי המוכרים">
            <div className="col-span-12 flex justify-end mb-2">
              <button type="button" onClick={() => setValue("sellers", [...(watch("sellers") || []), { sellerName: "", sellerIdType: "", sellerIdNumber: "", sellerAddress: "" }])} className="text-sm text-[#a57d45] hover:underline">+ הוסף מוכר</button>
            </div>
            {(watch("sellers") || []).map((_, i) => (
              <div key={i} className="col-span-12 border rounded-xl p-4 bg-gray-50 grid grid-cols-12 gap-4">
                <Field label="שם מוכר" col={3}><Input register={register} name={`sellers[${i}].sellerName`} placeholder="שם מוכר" /></Field>
                <Field label="סוג מזהה" col={3}><Input register={register} name={`sellers[${i}].sellerIdType`} placeholder="ת.ז / ח.פ" /></Field>
                <Field label="מספר מזהה" col={3}><Input register={register} name={`sellers[${i}].sellerIdNumber`} type="text" placeholder="מספר מזהה" registerOptions={{ validate: idValidate }} /></Field>
                {errors?.sellers?.[i]?.sellerIdNumber && <div className="col-span-12 text-red-600 text-sm">{errors.sellers[i].sellerIdNumber.message}</div>}
                <Field label="כתובת" col={3}><Input register={register} name={`sellers[${i}].sellerAddress`} placeholder="כתובת" /></Field>
                <div className="col-span-12 flex justify-end">
                  <button type="button" onClick={() => setValue("sellers", (watch("sellers") || []).filter((_, j) => j !== i))} className="text-sm text-red-500 hover:underline">הסר מוכר</button>
                </div>
              </div>
            ))}
          </Section>

          {/* ══ חברות מימון ══ */}
          <Section title="פרטי חברות מימון">
            <div className="col-span-12 flex justify-end mb-2">
              <button type="button" onClick={() => setValue("financingCompanies", [...(watch("financingCompanies") || []), { name: "", idNumber: "" }])} className="text-sm text-[#a57d45] hover:underline">+ הוסף חברת מימון</button>
            </div>
            {(watch("financingCompanies") || []).map((_, i) => (
              <div key={i} className="col-span-12 border rounded-xl p-4 bg-gray-50 grid grid-cols-12 gap-4">
                <Field label="שם חברה"><Input register={register} name={`financingCompanies[${i}].name`} placeholder="שם חברה" /></Field>
                <Field label='ח.פ / ת"ז'><Input register={register} name={`financingCompanies[${i}].idNumber`} placeholder="מספר מזהה" registerOptions={{ validate: idValidate }} /></Field>
                {errors?.financingCompanies?.[i]?.idNumber && <div className="col-span-12 text-red-600 text-sm">{errors.financingCompanies[i].idNumber.message}</div>}
                <div className="col-span-12 flex justify-end">
                  <button type="button" onClick={() => setValue("financingCompanies", (watch("financingCompanies") || []).filter((_, j) => j !== i))} className="text-sm text-red-500 hover:underline">הסר חברה</button>
                </div>
              </div>
            ))}
          </Section>

          {/* ══ הלוואות ══ */}
          <Section title="פרטי הלוואות">
            <div className="col-span-12 flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setValue("loans", [...(watch("loans") || []), { ...defaultLoan }])}
                className="text-sm text-[#a57d45] hover:underline"
              >
                + הוסף הלוואה
              </button>
            </div>
            {(watch("loans") || []).map((_, i) => (
              <div key={i} className="col-span-12 border rounded-xl p-4 bg-gray-50 grid grid-cols-12 gap-4">
                <Field label="שם מסלול הריבית" col={3}><Input register={register} name={`loans[${i}].loanPlan`} placeholder="מסלול" /></Field>
                <Field label="מועד שמירת הריבית" col={3}><Input register={register} name={`loans[${i}].interestLockDate`} type="date" /></Field>
                <Field label="שיעור הפריים" col={3}><Input register={register} name={`loans[${i}].primeRate`} placeholder="%" /></Field>
                <Field label="שם מסלול הפירעון" col={3}><Input register={register} name={`loans[${i}].repaymentTrackName`} placeholder="מסלול פירעון" /></Field>
                <Field label="שיעור הריבית הנומינלית" col={3}><Input register={register} name={`loans[${i}].loanInterestRate`} placeholder="למשל 3.5%" /></Field>
                <Field label="הריבית המתואמת" col={3}><Input register={register} name={`loans[${i}].adjustedInterestRate`} placeholder="למשל 4%" /></Field>
                <Field label="שיעור עלות ממשית של האשראי" col={3}><Input register={register} name={`loans[${i}].realCreditCostRate`} placeholder="%" /></Field>
                <Field label="מרכיב הריבית במסלול פריים" col={3}><Input register={register} name={`loans[${i}].primeMargin`} placeholder="מרווח" /></Field>
                <Field label="הצמדה למדד" col={3}>
                  <select {...register(`loans[${i}].indexLinked`)} className={inputClass}>
                    <option value="">בחר...</option>
                    <option value="yes">כן</option>
                    <option value="no">לא</option>
                  </select>
                </Field>
                <Field label="עמלת הקמה" col={3}><Input register={register} name={`loans[${i}].establishmentFee`} placeholder="סכום" /></Field>
                <Field label="הסכום שיקבל הלווה בפועל" col={3}><Input register={register} name={`loans[${i}].borrowerReceivesAmount`} placeholder="סכום" /></Field>
                <Field label="תשלום מעבר לאשראי עד סוף התקופה" col={3}>
                  <Input register={register} name={`loans[${i}].excessPaymentBeyondCredit`} placeholder="סכום" />
                </Field>
                <Field label='סה״כ ישולם עד סוף התקופה' col={3}>
                  <Input register={register} name={`loans[${i}].totalPayableEndOfTerm`} placeholder="סכום" />
                </Field>
                <Field label="מטרת ההלוואה" col={6}><Input register={register} name={`loans[${i}].loanPurpose`} placeholder="מטרה" /></Field>
                <Field label="סכום הלוואה" col={3}><Input register={register} name={`loans[${i}].loanAmount`} placeholder="סכום" /></Field>
                <Field label="שינוי הלוואה" col={3}><Input register={register} name={`loans[${i}].loanChange`} placeholder="שינוי" /></Field>
                <Field label="סעיף" col={3}><Input register={register} name={`loans[${i}].clause`} placeholder="סעיף" /></Field>
                <Field label="מספר חודשים" col={3}><Input register={register} name={`loans[${i}].loanMonths`} placeholder="חודשים" /></Field>
                <Field label="הלוואה מתואמת (סכום)" col={3}><Input register={register} name={`loans[${i}].adjustedLoan`} placeholder="מתואמת" /></Field>
                <Field label="הלוואה ריאלית" col={3}><Input register={register} name={`loans[${i}].realLoan`} placeholder="ריאלית" /></Field>
                <Field label="תאריך יצירה" col={3}><Input register={register} name={`loans[${i}].loanCreation`} type="date" /></Field>
                <Field label="מספר הלוואה" col={3}><Input register={register} name={`loans[${i}].loanNumber`} placeholder="מספר הלוואה" /></Field>
                <Field label="מספר משכנתא" col={3}><Input register={register} name={`loans[${i}].mortgageNumber`} placeholder="מספר משכנתא" /></Field>
                <div className="col-span-12 flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#a57d45] focus:ring-[#a57d45]"
                      {...register(`loans[${i}].lienFirst`, {
                        setValueAs: (v) => v === true || v === "true" || v === "on",
                      })}
                    />
                    דרגה ראשונה
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#a57d45] focus:ring-[#a57d45]"
                      {...register(`loans[${i}].lienSecond`, {
                        setValueAs: (v) => v === true || v === "true" || v === "on",
                      })}
                    />
                    דרגה שניה
                  </label>
                </div>
                <div className="col-span-12 flex justify-end">
                  <button type="button" onClick={() => setValue("loans", (watch("loans") || []).filter((_, j) => j !== i))} className="text-sm text-red-500 hover:underline">הסר הלוואה</button>
                </div>
              </div>
            ))}
          </Section>

          {/* ══ נושה בכיר ══ */}
          <Section title="פרטי נושה בכיר">
            <Field label="שם נושה בכיר" col={4}><Input register={register} name="seniorCreditor.seniorCreditorName" placeholder="שם" /></Field>
            <Field label="סוג מזהה" col={4}><Input register={register} name="seniorCreditor.seniorCreditorIdType" placeholder="ת.ז / ח.פ" /></Field>
            <Field label="מספר מזהה" col={4}><Input register={register} name="seniorCreditor.seniorCreditorIdNumber" type="text" placeholder="מספר" registerOptions={{ validate: idValidate }} /></Field>
            {errors?.seniorCreditor?.seniorCreditorIdNumber && <div className="col-span-12 text-red-600 text-sm">{errors.seniorCreditor.seniorCreditorIdNumber.message}</div>}
          </Section>

          {/* ══ חשבון בנק לווה ══ */}
          <Section title="חשבון בנק של הלווה">
            <Field label="מספר חשבון" col={4}><Input register={register} name="borrowerBankAccount.borrowerAccountNumber" type="number" placeholder="מספר חשבון" /></Field>
            <Field label="קוד סניף" col={4}><Input register={register} name="borrowerBankAccount.borrowerBranchCode" type="number" placeholder="קוד סניף" /></Field>
            <Field label="שם הבנק" col={4}><Input register={register} name="borrowerBankAccount.borrowerBankName" placeholder="שם הבנק" /></Field>
          </Section>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#a57d45] hover:bg-[#8a6535] text-white font-bold px-12 py-3 rounded-xl text-lg transition disabled:opacity-60"
            >
              {loading ? "שולח..." : "שלח פרטים"}
            </button>
          </div>

        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">© {new Date().getFullYear()} כל הזכויות שמורות</p>
    </div>
  );
};

export default ConsultantForm;
