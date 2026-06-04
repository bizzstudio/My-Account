// admin/pages/Login.jsx — התחברות אדמין: סיסמה + OTP (5.1)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AdminAuthService from "../services/adminAuthService";
import useAdminAuth from "../hooks/useAdminAuth";
import { Spinner } from "@/portal/components/ui/States";
import { notifyError, notifySuccess } from "@/utils/toast";

const msgOf = (err, fallback) => {
  const m = err?.response?.data?.message;
  return m?.he || (typeof m === "string" ? m : fallback);
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [step, setStep] = useState("login"); // 'login' | 'mfa'
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  const loginForm = useForm({ defaultValues: { email: "", password: "" } });
  const mfaForm = useForm({ defaultValues: { code: "" } });

  const onLogin = async (values) => {
    setLoading(true);
    try {
      const res = await AdminAuthService.login(values);
      if (res?.step === "mfa_required" && res?.tempToken) {
        setTempToken(res.tempToken);
        setStep("mfa");
        notifySuccess("נשלח קוד אימות לאימייל");
      } else if (res?.token) {
        login(res);
        navigate("/admin", { replace: true });
      } else {
        notifyError("התחברות נכשלה");
      }
    } catch (err) {
      notifyError(msgOf(err, "האימייל או הסיסמה שגויים"));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (values) => {
    setLoading(true);
    try {
      const res = await AdminAuthService.verifyMfa({
        tempToken,
        code: values.code.trim(),
        rememberDevice: false,
      });
      if (res?.token) {
        login(res);
        navigate("/admin", { replace: true });
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-gray-100 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/333.png" alt="Lobby" className="mx-auto mb-4 h-16 w-auto" />
          <h1 className="text-2xl font-bold text-gray-800">כניסת מנהלים</h1>
          <p className="mt-1 text-sm text-gray-500">ניהול פורטל ההלוואות</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          {step === "login" ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">אימייל</label>
                <input
                  type="email"
                  autoComplete="username"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  {...loginForm.register("email", { required: true })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">סיסמה</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  {...loginForm.register("password", { required: true })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
              >
                {loading && <Spinner />}
                כניסה
              </button>
            </form>
          ) : (
            <form onSubmit={mfaForm.handleSubmit(onVerify)} className="space-y-4">
              <p className="text-sm text-gray-600">הזינו את הקוד בן 6 הספרות שנשלח לאימייל.</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                className="w-full rounded-xl border border-gray-300 px-3 py-3 text-center text-lg tracking-[0.5em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                placeholder="______"
                {...mfaForm.register("code", { required: true, minLength: 6 })}
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
              >
                {loading && <Spinner />}
                אימות וכניסה
              </button>
              <button
                type="button"
                onClick={() => setStep("login")}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                חזרה
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
