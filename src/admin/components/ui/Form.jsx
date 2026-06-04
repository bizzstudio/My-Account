// admin/components/ui/Form.jsx — שדות טופס משותפים לאדמין
import React from "react";
import { Spinner } from "@/portal/components/ui/States";

const baseInput =
  "w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export function TextField({ label, register, name, type = "text", required, ...rest }) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input type={type} className={baseInput} {...(register ? register(name, { required }) : {})} {...rest} />
    </div>
  );
}

export function TextArea({ label, register, name, required, rows = 3, ...rest }) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea rows={rows} className={baseInput} {...(register ? register(name, { required }) : {})} {...rest} />
    </div>
  );
}

export function SelectField({ label, register, name, options = [], required, ...rest }) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      )}
      <select className={baseInput} {...(register ? register(name, { required }) : {})} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Button({ children, variant = "primary", loading, className = "", ...rest }) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-600 hover:bg-gray-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
