import React from "react";
import { t } from "i18next";

import LabelArea from "@/components/form/selectOption/LabelArea";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import { formatPrice as _formatPrice } from "@/utils/numberUtils";

const formatPrice = (value) => `₪${_formatPrice(value)}`;

const PricingSection = ({ id, watch, register, errors }) => {
  const isEditMode = Boolean(id);
  const price = watch("price") || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-2 items-stretch">
      {/* Sub Price */}
      <div className="flex flex-col gap-1 min-h-[4.5rem]">
        <LabelArea label={t("SubPrice")} />
        {isEditMode ? (
          <span className="text-sm text-gray-700 dark:text-gray-300 py-2">
            {formatPrice(price.subPrice)}
          </span>
        ) : (
          <InputArea
            name="price.subPrice"
            type="number"
            min={0}
            step="0.01"
            placeholder={t("SubPrice")}
            register={register}
            isRequired={false}
          />
        )}
        <Error errorName={errors?.price?.subPrice} />
      </div>

      {/* Shipping Price */}
      <div className="flex flex-col gap-1 min-h-[4.5rem]">
        <LabelArea label={t("ShippingPrice")} />
        {isEditMode ? (
          <span className="text-sm text-gray-700 dark:text-gray-300 py-2">
            {formatPrice(price.shippingPriceL)}
          </span>
        ) : (
          <InputArea
            name="price.shippingPriceL"
            type="number"
            min={0}
            step="0.01"
            placeholder={t("ShippingPrice")}
            register={register}
            isRequired={false}
          />
        )}
        <Error errorName={errors?.price?.shippingPriceL} />
      </div>

      {/* Final Price */}
      <div className="flex flex-col gap-1 min-h-[4.5rem]">
        <LabelArea label={t("FinalPrice")} />
        {isEditMode ? (
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 py-2">
            {formatPrice(price.finalPrice)}
          </span>
        ) : (
          <InputArea
            name="price.finalPrice"
            type="number"
            min={0}
            step="0.01"
            placeholder={t("FinalPrice")}
            register={register}
            isRequired={false}
            props={{ className: "font-bold" }}
          />
        )}
        <Error errorName={errors?.price?.finalPrice} />
      </div>
    </div>
  );
};

export default PricingSection;
