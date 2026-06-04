// portal/components/ui/Card.jsx — כרטיס בסיסי
import React from "react";

export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}
