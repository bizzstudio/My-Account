// src/components/product/ProductCard.jsx
import { Avatar } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// internal import
import EditDeleteButton from "../table/EditDeleteButton";
import ActiveInActiveButton from "../table/ActiveInActiveButton";
import CheckBox from "../form/others/CheckBox";
import { UserContext } from "@/context/UserContext";

const ProductCard = ({ product, isCheck, setIsCheck, handleClick, toggleDrawerData }) => {
  const { state: userState } = useContext(UserContext);
  const { userInfo } = userState;

  const borrower = product.borrowers?.[0] || {};
  const signingDetails = product.signingDetails || {};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      {/* Header with checkbox and actions */}
      <div className="flex justify-between items-start mb-3">
        <CheckBox
          type="checkbox"
          name={product?._id}
          id={product?._id}
          handleClick={handleClick}
          isChecked={isCheck?.includes(product?._id)}
        />
        <EditDeleteButton
          id={product._id}
          product={product}
          isSubmitting={toggleDrawerData.isSubmitting}
          handleUpdate={toggleDrawerData.handleUpdate}
          handleModalOpen={toggleDrawerData.handleModalOpen}
          title={product?.name}
        />
      </div>

      {/* Product info */}
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar
          className="bg-gray-50"
          src={
            (product.images && product.images.length > 0 ? product.images[0] : null) ||
            "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
          }
          alt="product"
        />
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{product?.name}</h2>
          <p className="text-sm text-gray-500">{product?.sku}</p>
        </div>
      </div>

      {/* Borrower details */}
      <div className="flex flex-col divide-y divide-דgray-200 dark:divide-gray-700">
        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("borrowerName")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{borrower.borrowerName || "-"}</span>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("borrowerIdType")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{borrower.borrowerIdType || "-"}</span>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("lawyerName")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{signingDetails.lawyerName || "-"}</span>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("consultant")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{signingDetails.consultant || "-"}</span>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("primaryBacker")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{signingDetails.primaryBacker || "-"}</span>
        </div>

  
      </div>
    </div>
  );
};

export default ProductCard;
