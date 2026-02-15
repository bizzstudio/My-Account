// components/table/SaveDeleteButton.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { FiTrash2 } from "react-icons/fi";
import Tooltip from "@/components/tooltip/Tooltip";
import { BsCheckCircle } from "react-icons/bs"; // אייקון "שמירה"

const SaveDeleteButton = ({
  id,
  title,
  handleSave,
  isCheck,
  handleModalOpen,
  product,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center text-center gap-2">
      {/* כפתור שמירה */}
      <button
        disabled={isCheck?.length > 0}
        onClick={() => handleSave(id)}
        className="p-2 cursor-pointer text-gray-400 hover:text-mainColor-dark focus:outline-none"
      >
        <Tooltip
          id="save"
          Icon={BsCheckCircle}
          title={t("Save")}
          bgColor="#10B981" // ירוק
        />
      </button>

      {/* כפתור מחיקה */}
      <button
        disabled={isCheck?.length > 0}
        onClick={() => handleModalOpen(id, title, product)}
        className="p-2 cursor-pointer text-gray-400 hover:text-red-600 focus:outline-none"
      >
        <Tooltip
          id="delete"
          Icon={FiTrash2}
          title={t("Delete")}
          bgColor="#EF4444"
        />
      </button>
    </div>
  );
};

export default SaveDeleteButton;