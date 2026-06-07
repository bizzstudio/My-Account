// portal/pages/Login.jsx — התחברות לקוח: ת"ז + אימייל -> קוד OTP (3.1)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PortalAuthService from "../services/portalAuthService";
import usePortalAuth from "../hooks/usePortalAuth";
import useAdminAuth from "@/admin/hooks/useAdminAuth";
import { Spinner } from "../components/ui/States";
import { notifyError, notifySuccess } from "@/utils/toast";

const msgOf = (err, fallback) => {
  const m = err?.response?.data?.message;
  return m?.he || (typeof m === "string" ? m : fallback);
};

const ADMIN_ROLES = ["admin", "super-admin", "lawyer"];

export default function PortalLogin() {
  const navigate = useNavigate();
  const { login: portalLogin } = usePortalAuth();
  const { login: adminLogin } = useAdminAuth();
  const [step, setStep] = useState("start"); // 'start' | 'otp'
  const [loading, setLoading] = useState(false);
  const [otpToken, setOtpToken] = useState(null);
  const [emailHint, setEmailHint] = useState("");

  const startForm = useForm({ defaultValues: { nationalId: "", email: "" } });
  const otpForm = useForm({ defaultValues: { code: "" } });

  const onStart = async (values) => {
    setLoading(true);
    try {
      const res = await PortalAuthService.start({
        nationalId: values.nationalId.trim(),
        email: values.email.trim(),
      });
      // ת"ז דמו — השרת מחזיר טוקן מלא וכניסה ישירה ללא קוד
      if (res?.token) {
        const isAdmin = ADMIN_ROLES.includes(res.role);
        if (isAdmin) {
          adminLogin(res);
        } else {
          portalLogin(res);
        }
        navigate(res.redirect || (isAdmin ? "/admin" : "/dashboard"), {
          replace: true,
        });
        return;
      }
      // השרת מחזיר תגובה אחידה; נמשיך לשלב הקוד רק אם קיבלנו otpToken
      if (res?.otpToken) {
        setOtpToken(res.otpToken);
        setEmailHint(res.emailHint || "");
        setStep("otp");
        notifySuccess("נשלח קוד אימות לאימייל");
      } else {
        notifyError("הפרטים שהוזנו אינם תואמים. בדקו ונסו שוב.");
      }
    } catch (err) {
      notifyError(msgOf(err, "אירעה שגיאה, נסו שוב מאוחר יותר"));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (values) => {
    setLoading(true);
    try {
      const res = await PortalAuthService.verify({
        otpToken,
        code: values.code.trim(),
      });
      if (res?.token) {
        // ניתוב לפי התפקיד שחזר מהשרת: אדמין -> ניהול, לקוח -> אזור אישי
        const isAdmin = ADMIN_ROLES.includes(res.role);
        if (isAdmin) {
          adminLogin(res);
        } else {
          portalLogin(res);
        }
        const dest = res.redirect || (isAdmin ? "/admin" : "/dashboard");
        navigate(dest, { replace: true });
      } else {
        notifyError("הקוד שגוי");
      }
    } catch (err) {
      notifyError(msgOf(err, "הקוד שגוי או פג תוקף"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent-50 via-brand-50 to-gray-50 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/333.png" alt="Lobby" className="mx-auto mb-4 h-16 w-auto" />
          <h1 className="text-2xl font-bold text-gray-800">כניסה למערכת</h1>
          <p className="mt-1 text-sm text-gray-500">
            התחברות מאובטחת עם תעודת זהות וקוד חד-פעמי
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          {step === "start" ? (
            <form onSubmit={startForm.handleSubmit(onStart)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  תעודת זהות
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="הזינו מספר תעודת זהות"
                  {...startForm.register("nationalId", { required: true })}
                />
                {startForm.formState.errors.nationalId && (
                  <p className="mt-1 text-xs text-red-600">שדה חובה</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  אימייל
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="name@example.com"
                  {...startForm.register("email", { required: true })}
                />
                {startForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">שדה חובה</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {loading && <Spinner />}
                שליחת קוד אימות
              </button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onVerify)} className="space-y-4">
              <p className="text-sm text-gray-600">
                שלחנו קוד בן 6 ספרות {emailHint ? `לכתובת ${emailHint}` : "לאימייל שלך"}.
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  קוד אימות
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-center text-lg tracking-[0.5em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="______"
                  {...otpForm.register("code", { required: true, minLength: 6 })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {loading && <Spinner />}
                כניסה
              </button>
              <button
                type="button"
                onClick={() => setStep("start")}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                חזרה / שליחת קוד מחדש
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          הגישה למידע מותנית בהתחברות מאובטחת. © {new Date().getFullYear()} Lobby
        </p>
      </div>
    </div>
  );
}
