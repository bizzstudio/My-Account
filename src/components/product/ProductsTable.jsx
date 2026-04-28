// src/components/product/ProductsTable.jsx
import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React, { useContext, useState } from "react";
import { t } from "i18next";
import { FiMail, FiFolder } from "react-icons/fi";

// Internal import
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ActiveInActiveButton from "@/components/table/ActiveInActiveButton";
import ProductCard from "./ProductCard";
import CheckBox from "@/components/form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import SendEmailModal from "./SendEmailModal";
import { formatBorrowerDisplayName } from "@/utils/buildWordTemplateData";

const ProductsTable = ({ products, isCheck, setIsCheck, isMobile = false, driveLinks = {} }) => {
  const { state: userState } = useContext(UserContext);
  const { userInfo } = userState;
  const [emailModal, setEmailModal] = useState(null); // { product, driveFolderLink }

  const {
    title,
    serviceId,
    handleModalOpen,
    handleUpdate,
    isSubmitting,
  } = useToggleDrawer();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck((prev) => {
      if (checked) {
        return prev.includes(String(id)) ? prev : [...prev, String(id)];
      } else {
        return prev.filter((item) => String(item) !== String(id));
      }
    });
  };

  const toggleDrawerData = {
    handleModalOpen,
    handleUpdate,
    isSubmitting,
  };

  return (
    <>
      {isCheck?.length < 1 && (
        <DeleteModal id={serviceId} title={title} table="products" />
      )}

      {emailModal && (
        <SendEmailModal
          product={emailModal.product}
          onClose={() => setEmailModal(null)}
        />
      )}

      {isMobile ? (
        // Mobile Card View
        <div>
          {products?.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              handleClick={handleClick}
              toggleDrawerData={toggleDrawerData}
            />
          ))}
        </div>
      ) : (
        // Desktop Table View
        <TableBody>
          {products?.map((product) => (
            <TableRow key={product._id}>
              {/* 1️⃣ Checkbox */}
              <TableCell className="text-center">
                <CheckBox
                  type="checkbox"
                  name={product?._id}
                  id={String(product?._id)}
                  handleClick={handleClick}
                  isChecked={isCheck?.includes(String(product?._id))}
                />
              </TableCell>

              {/* 2️⃣ Actions */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <EditDeleteButton
                    id={product._id}
                    product={product}
                    isSubmitting={isSubmitting}
                    handleUpdate={handleUpdate}
                    handleModalOpen={handleModalOpen}
                    title={product?.base}
                  />
                  <button
                    onClick={() => setEmailModal({ product })}
                    title={t("SendEmail")}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#a57d45] transition"
                  >
                    <FiMail size={16} />
                  </button>
                </div>
              </TableCell>

              {/* 3️⃣ Borrower הראשון בלבד (בטוח גם אם אין Borrowers) */}
              <TableCell className="text-center">
                {formatBorrowerDisplayName(product.borrowers?.[0] || {})}
              </TableCell>
              <TableCell className="text-center">
                {product.borrowers?.[0]?.borrowerIdNumber || "-"}
              </TableCell>
              <TableCell className="text-center">
                {product.signingDetails?.lawyerName || "-"}
              </TableCell>
              <TableCell className="text-center">
                {product.signingDetails?.consultant || "-"}
              </TableCell>
              <TableCell className="text-center">
                {(product.signingDetails?.primaryBacker || product.financingCompanies?.[0]?.name) || "-"}
              </TableCell>

              {/* Drive folder link */}
              <TableCell className="text-center">
                {driveLinks[product._id] ? (
                  <a
                    href={driveLinks[product._id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("OpenDriveFolder")}
                    className="inline-flex items-center gap-1 text-[#a57d45] hover:text-[#8a6535] transition text-sm"
                  >
                    <FiFolder size={16} />
                  </a>
                ) : (
                  <span className="text-gray-300 dark:text-gray-600">
                    <FiFolder size={16} />
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      )}
    </>
  );
};

export default ProductsTable;
