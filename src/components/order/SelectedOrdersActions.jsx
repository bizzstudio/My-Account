import React from "react";
import { Button } from "@windmill/react-ui";
import { IoSwapHorizontalOutline } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { t } from "i18next";

const SelectedOrdersActions = ({ selectedIds, onOpenModal, totalResults, onExport }) => {
  if (selectedIds.length === 0) {
    return null;
  }

  const isAllSelected = totalResults > 0 && selectedIds.length === totalResults;

  return (
    <div className="flex items-center justify-between mb-5 px-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {isAllSelected ? (
          <>
            {t("AllSelected")} ({selectedIds.length} {t("Orders")})
          </>
        ) : (
          <>
            {selectedIds.length} {t("selectedOrders")}
          </>
        )}
      </p>

      <div className="flex gap-2">
        <Button
          onClick={onExport}
          className="bg-mainColor hover:bg-mainColor-dark"
        >
          <FiDownload className="ml-2" size={18} />
          {t("ExportToExcel")}
        </Button>

        <Button
          onClick={onOpenModal}
          className="bg-mainColor hover:bg-mainColor-dark"
        >
          <IoSwapHorizontalOutline className="ml-2" size={18} />
          {t("ChangeStatus")}
        </Button>
      </div>
    </div>
  );
};

export default SelectedOrdersActions;
