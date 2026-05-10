// src/components/order/OrderCard.jsx
import { Avatar } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";
import dayjs from "dayjs";
import { formatPrice } from "@/utils/numberUtils";

import EditDeleteButton from "@/components/table/EditDeleteButton";
import CheckBox from "@/components/form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import SelectStatus from "../form/selectOption/SelectStatus";

const OrderCard = ({ order, isCheck, setIsCheck, handleClick, toggleDrawerData }) => {
  const { state: userState } = useContext(UserContext);
  const { userInfo } = userState || {};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <CheckBox
          type="checkbox"
          name={String(order?._id)}
          id={String(order?._id)}
          handleClick={handleClick}
          isChecked={isCheck?.includes(String(order?._id))}
        />
        <EditDeleteButton
          id={order._id}
          product={order}
          isSubmitting={toggleDrawerData.isSubmitting}
          handleUpdate={toggleDrawerData.handleUpdate}
          handleModalOpen={toggleDrawerData.handleModalOpen}
          title={order?.displayOrderNumber || t("Order")}
        />
      </div>

      <div className="flex items-center gap-2.5 mb-3">
        <Avatar className="bg-gray-50" src={order?.cart?.[0]?.image || 'https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png'} alt="order" />
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {order?.customerDetails?.customerName || "-"}
          </h2>
          <p className="text-sm text-gray-500">{order?.customerDetails?.customerPhone}</p>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("OrderNumber")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{order?.displayOrderNumber || "-"}</span>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("City")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{order?.customerDetails?.address?.city || "-"}</span>
        </div>

        <div className="flex justify-between items-start gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("ProductName")}:</span>
          <div className="text-sm text-gray-900 dark:text-gray-100 flex flex-col gap-1 text-right">
            {order?.cart?.length > 0 ? (
              order.cart.map((item, index) => (
                <div key={index}>{item?.description || "-"}</div>
              ))
            ) : (
              "-"
            )}
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Total")}:</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">₪{order?.price?.finalPrice != null ? formatPrice(order.price.finalPrice) : "-"}</span>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Status")}:</span>
          <div className="min-w-[140px]">
            <SelectStatus order={order} />
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("DeliveryType")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">{order?.deliveryType != null ? t(`DeliveryType_${order.deliveryType}`) : "-"}</span>
        </div>

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Date")}:</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {order?.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : "-"}
          </span>
        </div>


      </div>
    </div>
  );
};

export default OrderCard;
