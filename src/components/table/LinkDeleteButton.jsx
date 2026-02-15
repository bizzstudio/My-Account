// LinkDeleteButton.jsx

import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash2, FiZoomIn } from "react-icons/fi";

import Tooltip from "@/components/tooltip/Tooltip";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";

const LinkDeleteButton = ({
  id,
  title,
  handleUpdate,
  handleModalOpen,
  isCheck,
  product,
  parent,
  children,
  specialDrawer,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex justify-center text-center">

        <Link
          to={`/user/${id}`}
          className="p-2 cursor-pointer text-gray-400 hover:text-mainColor-dark focus:outline-none"
        > 
          <Tooltip
            id="view"
            Icon={FiZoomIn}
            title={t("View Details")}
            bgColor="#3c6d16"
          />
        </Link>


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
    </>
  );
};

export default LinkDeleteButton;
