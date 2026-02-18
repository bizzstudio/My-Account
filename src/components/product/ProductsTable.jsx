// src/components/product/ProductsTable.jsx
import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// Internal import
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ActiveInActiveButton from "@/components/table/ActiveInActiveButton";
import ProductCard from "./ProductCard";
import CheckBox from "@/components/form/others/CheckBox";
import { UserContext } from "@/context/UserContext";

const ProductsTable = ({ products, isCheck, setIsCheck, isMobile = false }) => {
  const { state: userState } = useContext(UserContext);
  const { userInfo } = userState;

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
                  id={product?._id}
                  handleClick={handleClick}
                  isChecked={isCheck?.includes(product?._id)}
                />
              </TableCell>

              {/* 2️⃣ Actions */}
              <TableCell className="text-center">
                <EditDeleteButton
                  id={product._id}
                  product={product}
                  isSubmitting={isSubmitting}
                  handleUpdate={handleUpdate}
                  handleModalOpen={handleModalOpen}
                  title={product?.base}
                />
              </TableCell>

              {/* 3️⃣ Borrower הראשון בלבד (בטוח גם אם אין Borrowers) */}
              <TableCell className="text-center">
                {product.borrowers?.[0]?.borrowerName || "-"}
              </TableCell>
              <TableCell className="text-center">
                {product.borrowers?.[0]?.borrowerIdNumber || "-"}
              </TableCell>
              <TableCell className="text-center">
                {product.signingDetails.lawyerName || "-"}
              </TableCell>
              <TableCell className="text-center">
                {product.signingDetails.consultant || "-"}
              </TableCell>
              <TableCell className="text-center">
                {product.signingDetails.primaryBacker || "-"}
              </TableCell>
             
            </TableRow>
          ))}
        </TableBody>
      )}
    </>
  );
};

export default ProductsTable;
