import { Textarea } from "@windmill/react-ui";
import { t } from "i18next";
import React from "react";

const TextAreaCom = ({
  register,
  name,
  label,
  placeholder,
  isRequired = false,
  type,
  value,
}) => {
  return (
    <>
      <Textarea
        className="border text-sm border-gray-200 focus:border-gray-300 block w-full bg-gray-100"
        {...register(`${name}`, {
          required: isRequired ? `${label} ${t("isRequired")}!` : undefined,
        })}
        type={type}
        step={type === "number" ? 'any' : undefined}
        placeholder={placeholder}
        name={name}
        value={value}
        rows="4"
        spellCheck="false"
      />
    </>
  );
};

export default TextAreaCom;
