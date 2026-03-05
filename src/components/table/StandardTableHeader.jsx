import { TableHeader, TableCell } from "@windmill/react-ui";
import CheckBox from "@/components/form/others/CheckBox";
import { t } from "i18next";

const StandardTableHeader = ({ columns, isCheckAll, handleSelectAll, isLoadingAllIds, totalResults }) => {
  return (
    <TableHeader>
      <tr>
        {columns.map((col) => (
          <TableCell key={col.key} className="text-center">
            {col.key === "checkbox" && handleSelectAll ? (
              <div 
                className="flex items-center justify-center gap-1.5" 
                title={t("SelectAllOrdersInFilter", { count: totalResults }) || "בחירת הכול"}
              >
                <CheckBox
                  type="checkbox"
                  name="selectAll"
                  id="selectAll"
                  handleClick={handleSelectAll}
                  isChecked={isCheckAll}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{t("SelectAll") || "הכל"}</span>
                {isLoadingAllIds && (
                  <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
                )}
              </div>
            ) : (
              col.label || ""
            )}
          </TableCell>
        ))}
      </tr>
    </TableHeader>
  );
};

export default StandardTableHeader;
