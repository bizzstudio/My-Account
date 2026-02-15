import React from "react";
import { Textarea } from "@windmill/react-ui";
import { t } from "i18next";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Error from "@/components/form/others/Error";
import OrderStatusDetailsBox from "./OrderStatusDetailsBox";

const NotesSection = ({ register, errors, watch, statusDetails }) => {
  return (
    <div className="grid grid-cols-12 gap-5 mt-2">
      <OrderStatusDetailsBox statusDetails={statusDetails} />

      <div className="flex flex-col gap-1 col-span-12">
        <LabelArea label={t("CustomerNotes")} />
        <Textarea
          rows={3}
          {...register("customerNotes", {
            // לדוגמה: מקסימום תווים
            maxLength: { value: 200, message: t("maxLengthMessage", { max: 200 }) },
          })}
        />
        <Error errorName={errors.customerNotes} />
      </div>

      <div className="flex flex-col gap-1 col-span-12">
        <LabelArea label={t("OwnerNotes")} />
        <Textarea
          rows={3}
          {...register("ownerNotes", {
            maxLength: { value: 1000, message: t("maxLengthMessage", { max: 1000 }) },
          })}
        />
        <Error errorName={errors.ownerNotes} />
      </div>

    </div>
  );
};

export default NotesSection;
