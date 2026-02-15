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
                className="flex items-center justify-center gap-1" 
                title={t("SelectAllOrdersInFilter", { count: totalResults })}
              >
                <CheckBox
                  type="checkbox"
                  name="selectAll"
                  id="selectAll"
                  handleClick={handleSelectAll}
                  isChecked={isCheckAll}
                />
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
