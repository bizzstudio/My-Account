import React from "react";
import { t } from "i18next";

import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";

const OrderOwnerSection = ({ allAdmins, setValue, watch }) => {
  const owner = watch("owner") || "";

  return (
    <div className="grid grid-cols-12 gap-5 mt-2">
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("Owner")} />

        <SelectWithOptions
          options={allAdmins || []}
          value={owner}
          onChange={(value) => {
            const id = value && value._id ? value._id : value;
            setValue("owner", id);
          }}
          placeholder={t("SelectOwner")}
          valueKey="_id"
          labelKey="name"
        />
      </div>
    </div>
  );
};

export default OrderOwnerSection;
