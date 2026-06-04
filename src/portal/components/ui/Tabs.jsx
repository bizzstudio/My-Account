// portal/components/ui/Tabs.jsx — סרגל לשוניות נגלל אופקית (מובייל-פרנדלי)
import React from "react";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <div
        role="tablist"
        className="flex min-w-max gap-1 border-b border-gray-200 px-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
