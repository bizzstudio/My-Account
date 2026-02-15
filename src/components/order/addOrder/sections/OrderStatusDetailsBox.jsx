import React from "react";

/**
 * Generic box: displays all order status details (no filtering by type or status).
 * Used for ERROR, NEW, PICKUP_READY and any future status.
 *
 * @param {Object} props
 * @param {Array} props.statusDetails - Array of { type?, message?, code?, createdAt? }
 */
const OrderStatusDetailsBox = ({ statusDetails }) => {
  const items = Array.isArray(statusDetails) ? statusDetails.filter((d) => d != null) : [];
  if (items.length === 0) return null;

  const formatDate = (value) => {
    if (!value) return null;
    const d = typeof value === "string" ? new Date(value) : value;
    if (typeof d.getTime !== "function" || Number.isNaN(d.getTime())) {
      return typeof value === "object" ? "" : String(value);
    }
    return d.toLocaleString("he-IL");
  };

  return (
    <div
      className="col-span-12 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
      role="status"
      dir="rtl"
    >
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
          פרטי סטטוס
        </h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
          {items.map((item, i) => (
            <li key={i}>
              {item.type && (
                <span className="text-gray-500 dark:text-gray-400 text-xs mr-1">
                  [{item.type}]
                </span>
              )}
              {item.message || ""}
              {(item.code || item.createdAt) && (
                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">
                  {item.code && <span>{item.code}</span>}
                  {item.code && item.createdAt && " · "}
                  {item.createdAt && (
                    <span>עודכן: {formatDate(item.createdAt)}</span>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderStatusDetailsBox;
