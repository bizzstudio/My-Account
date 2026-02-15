import React, { useEffect, useRef } from "react";
import { t } from "i18next";

import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";

const OrderMetaSection = ({
  id,
  errors,
  setValue,
  watch,
  clearErrors,
  statuses,
  suppliers,
}) => {
  const supplier = watch("supplier") || "";
  const orderStatus = watch("status") || "";
  const deliveryType = watch("deliveryType");
  const sectionRef = useRef(null);

  // בדיקה אם הסטטוס הוא "error" (שגוי)
  const isErrorStatus = statuses?.find(s => s._id === orderStatus)?.name === "error";

  // Default status = "new"
  useEffect(() => {
    if (orderStatus) return;
    if (!Array.isArray(statuses) || statuses.length === 0) return;

    const defaultStatus = statuses.find(
      (s) => s.name === "new" || s.label === "new"
    );

    if (defaultStatus) {
      setValue("status", defaultStatus._id, { shouldDirty: false });
    }
  }, [statuses, orderStatus, setValue]);

  // Scroll to section when any field has an error
  useEffect(() => {
    if (errors.supplier?.message || errors.status?.message) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 50);
    }
  }, [errors.supplier?.message, errors.status?.message]);

  return (
    <div ref={sectionRef} className="grid grid-cols-12 gap-5 mt-2">

      {/* Supplier */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-4">
        <LabelArea label={t("Supplier")} />

        <SelectWithOptions
          options={suppliers || []}
          value={supplier}
          onChange={(value) => {
            setValue("supplier", value, { shouldValidate: true });
            clearErrors("supplier");
          }}
          placeholder={t("Select Supplier")}
          valueKey="_id"
          labelKey="name"
        />

        <Error errorName={errors.supplier} />
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-4">
        <LabelArea label={t("Status")} />

        <SelectWithOptions
          options={statuses || []}
          value={orderStatus}
          onChange={(value) => {
            setValue("status", value, { shouldValidate: true });
            clearErrors("status");
          }}
          valueKey="_id"
          labelKey="label"
          hideEmptyOption={true}
        />

        <Error errorName={errors.status} />
      </div>

      {/* Delivery Type - רק בעריכת הזמנה, אם יש ערך ולא error */}
      {id && deliveryType != null && (
        <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-4">
          <LabelArea label={t("DeliveryType")} />
          <input
            type="text"
            value={t(`DeliveryType_${deliveryType}`)}
            readOnly
            disabled
            className="w-full h-12 px-4 text-sm border rounded-md 
                       bg-gray-100 dark:bg-gray-700 
                       text-gray-700 dark:text-gray-300
                       border-gray-200 dark:border-gray-600
                       cursor-default
                       focus:outline-none"
          />
        </div>
      )}

    </div>
  );
};

export default OrderMetaSection;
