// portal/components/ui/Field.jsx — שורת "תווית: ערך" לתצוגת פרטים
import React from "react";

// רשימת שדות רספונסיבית (תווית מימין, ערך אחריו)
export function FieldList({ children }) {
  return <dl className="divide-y divide-gray-100">{children}</dl>;
}

export function Field({ label, value, children }) {
  const display =
    children !== undefined ? children : value === undefined || value === null || value === "" ? "—" : value;
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 sm:text-end">{display}</dd>
    </div>
  );
}
