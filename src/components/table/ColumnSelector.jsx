// components/table/ColumnSelector.jsx
// components/table/ColumnSelector.jsx
import React from "react";
import DropdownMenu from "@/components/menu/DropdownMenu";
import { LuSettings2 } from "react-icons/lu";
import { t } from "i18next";

/**
 * קומפוננטת בחירת עמודות להצגה בטבלה
 */
const ColumnSelector = ({ columns, visibleColumns, toggleColumn }) => {
  return (
    <div className="relative">
      <DropdownMenu
        title={t("Columns")}
        label={
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 cursor-pointer">
            <LuSettings2 className="text-xl" />
            <span className="text-sm">{t("Columns")}</span>
          </div>
        }
        options={columns.map((col) => ({
          label: (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onClick={(e) => e.stopPropagation()}  // עוצרים את זרימת האירוע
                onChange={() => toggleColumn(col.key)}
              />
              <span>{col.label || t("Unnamed Column")}</span>
            </div>
          ),
          onClick: () => toggleColumn(col.key),
        }))}
      />
    </div>
  );
};

export default ColumnSelector;