import React from "react";
import { t } from "i18next";
import LabelArea from "@/components/form/selectOption/LabelArea";
import InputArea from "@/components/form/input/InputArea";
import Error from "@/components/form/others/Error";
import { FaAddressCard } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";


const CustomerDetailsSection = ({ register, errors, setValue, watch }) => {
  const c = watch("customerDetails") || {};
  const deliveryType = watch("deliveryType");

  // InputArea עושים register ישירות
  return (
    <div className="flex flex-col gap-5">
      {/* פרטי לקוח בסיסיים */}
      <div className="flex flex-col gap-3">
        <FaAddressCard className="text-lg text-gray-700 dark:text-gray-300" />
        <div className="grid grid-cols-12 gap-5">
        <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-4">
          <LabelArea label={t("CustomerName")} />
          <InputArea
            register={register}
            label={t("CustomerName")}
            name="customerDetails.customerName"
            type="text"
            placeholder={t("CustomerName")}
            isRequired={true}
          />
          <Error errorName={errors?.customerDetails?.customerName} />
        </div>

        <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-4">
          <LabelArea label={t("Phone")} />
          <InputArea
            register={register}
            label={t("Phone")}
            name="customerDetails.customerPhone"
            type="tel"
            placeholder={t("Phone")}
            isRequired={true}
          />
          <Error errorName={errors?.customerDetails?.customerPhone} />
        </div>

        <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-4">
          <LabelArea label={t("Email")} />
          <InputArea
            register={register}
            label={t("Email")}
            name="customerDetails.email"
            type="email"
            placeholder={t("Email")}
            isRequired={true}
          />
          <Error errorName={errors?.customerDetails?.email} />
        </div>
        </div>
      </div>

      {/* כתובת - רק אם סוג המשלוח הוא delivery */}
      {deliveryType === "delivery" && (
        <div className="flex flex-col gap-3">
          <MdLocationOn className="text-lg text-gray-700 dark:text-gray-300" />
          <div className="grid grid-cols-12 gap-5">
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-3">
              <LabelArea label={t("City")} />
              <InputArea
                register={register}
                label={t("City")}
                name="customerDetails.address.city"
                type="text"
                placeholder={t("City")}
                isRequired={true}
              />
              <Error errorName={errors?.customerDetails?.address?.city} />
            </div>

            <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-3">
              <LabelArea label={t("StreetAndNumber")} />
              <InputArea
                register={register}
                label={t("StreetAndNumber")}
                name="customerDetails.address.streetAndNumber"
                type="text"
                placeholder={t("StreetAndNumber")}
                isRequired={true}
              />
              <Error errorName={errors?.customerDetails?.address?.streetAndNumber} />
            </div>

            <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-3">
              <LabelArea label={t("Floor")} />
              <InputArea
                register={register}
                label={t("Floor")}
                name="customerDetails.address.floor"
                type="text"
                placeholder={t("Floor")}
                isRequired={true}
              />
              <Error errorName={errors?.customerDetails?.address?.floor} />
            </div>

            <div className="flex flex-col gap-1 md:col-span-6 col-span-12 lg:col-span-3">
              <LabelArea label={t("Apartment")} />
              <InputArea
                register={register}
                label={t("Apartment")}
                name="customerDetails.address.apartment"
                type="text"
                placeholder={t("Apartment")}
                isRequired={true}
              />
              <Error errorName={errors?.customerDetails?.address?.apartment} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsSection;
