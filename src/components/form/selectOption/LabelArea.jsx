import React from "react";
import { Label } from "@windmill/react-ui";

const LabelArea = ({ label, oneLine = false, className }) => {
  return (
    // <Label className={`${oneLine ? 'col-span-6' : 'col-span-4 sm:col-span-2 '} font-semibold text-sm`}>
    <Label className={`${className} col-span-6 font-semibold text-sm`}>
      {label}
    </Label>
  );
};

export default LabelArea;
