// src/components/form/FormSubmitActions.jsx
import React from "react";
import { Button } from "@windmill/react-ui";
import { t } from "i18next";

const FormSubmitActions = ({ id, onCancel, isSubmitting, createLabel, updateLabel }) => {
  return (
    <div className="flex justify-end gap-3 mt-6 border-t pt-6">
      <Button layout="outline" onClick={onCancel} disabled={isSubmitting}>
        {t("Cancel")}
      </Button>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("Sending...") : t(id ? updateLabel : createLabel)}
      </Button>
    </div>
  );
};

export default FormSubmitActions;
