import React from "react";
import { Button } from "@windmill/react-ui";
import { t } from "i18next";

const OrderActions = ({ handleSubmit, onSubmit, resetForm, isSubmitting }) => {

  const handleClick = async () => {
    try {
      // משתמשים ב-handleSubmit שמבצע ולידציה לפני onSubmit
      const submitFn = handleSubmit(onSubmit);
      const res = await submitFn();
      if (res) {
        resetForm();
      }
    } catch (err) {
      // הוולידציה של RHF כבר תציג שגיאות דרך ה-errors
    }
  };

  return (
    <div className="flex justify-end gap-3 mt-6 border-t pt-6">
      <Button layout="outline" onClick={() => resetForm()} disabled={isSubmitting}>
        {t("Cancel")}
      </Button>

      <Button onClick={handleClick} disabled={isSubmitting}>
        {isSubmitting ? t("Sending...") : t("CreateOrder")}
      </Button>
    </div>
  );
};

export default OrderActions;
