// portal/components/ui/DataTable.jsx
// טבלה רספונסיבית: גלילה אופקית במובייל, ראש דביק, יישור RTL.
// columns: [{ key, header, align?, render?(row), className? }]
import React from "react";
import { EmptyState } from "./States";

export default function DataTable({ columns, rows, caption, emptyText }) {
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyText || "אין נתונים להצגה"} />;
  }
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`whitespace-nowrap px-3 py-3 text-start font-semibold ${
                  c.align === "end" ? "text-end" : ""
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={row._id || i} className="hover:bg-gray-50">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`whitespace-nowrap px-3 py-3 text-gray-800 ${
                    c.align === "end" ? "text-end" : ""
                  } ${c.className || ""}`}
                >
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
