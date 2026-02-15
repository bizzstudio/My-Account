import React, { useContext, useMemo, useState } from "react";
import { Modal, ModalBody, ModalFooter, Button } from "@windmill/react-ui";
import { IoSwapHorizontalOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { WindmillContext } from "@windmill/react-ui";
import { SidebarContext } from "@/context/SidebarContext";
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const BulkStatusChangeModal = ({ isOpen, onClose, onConfirm, selectedCount, isSubmitting }) => {
  const { t } = useTranslation();
  const { statuses } = useContext(SidebarContext);
  const { mode } = useContext(WindmillContext);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const options = useMemo(
    () =>
      statuses.map((status) => ({
        value: status._id,
        label: status.label,
        color: status.color,
        isFinal: status.isFinal,
        data: status,
      })),
    [statuses]
  );

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus.data);
    }
  };

  const withAlpha = (hex, alpha = 0.15) => {
    if (!hex?.startsWith("#")) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: 40,
      backgroundColor: mode === "dark" ? "#374151" : "#fff",
      borderColor: mode === "dark" ? "#4B5563" : "#D1D5DB",
      boxShadow: "none",
      ":hover": {
        borderColor: "var(--main-color)",
      },
    }),

    option: (base, state) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      gap: 8,
      backgroundColor: state.isFocused
        ? "var(--main-color-super-light)"
        : base.backgroundColor,
      ":before": {
        content: '""',
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: state.data.color || "#9CA3AF",
        display: "inline-block",
      },
    }),

    menu: (base) => ({
      ...base,
      zIndex: 1000,
    }),

    singleValue: (base, state) => ({
      ...base,
      color: state.data?.color || base.color,
      fontWeight: 500,
    }),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
        <span className="flex justify-center text-3xl mb-6 text-mainColor">
          <IoSwapHorizontalOutline />
        </span>
        <h2 className="text-xl font-medium mb-2">
          {t("ChangeBulkStatus")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t("selectedOrders")}: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedCount}</span>
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
            {t("SelectNewStatus")}
          </label>
          <Select
            value={selectedStatus}
            options={options}
            onChange={setSelectedStatus}
            styles={customStyles}
            placeholder={t("ChooseStatus")}
            isDisabled={isSubmitting}
          />
        </div>

        <div className="mt-4 p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("BulkStatusChangeWarning")}
          </p>
        </div>
      </ModalBody>

      <ModalFooter className="justify-center gap-3">
        <Button
          className="w-auto hover:bg-white hover:border-gray-50"
          layout="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t("Cancel")}
        </Button>
        <div className="flex justify-end">
          {isSubmitting ? (
            <Button
              disabled={true}
              type="button"
              className="w-full h-12 sm:w-auto"
            >
              <img
                src={spinnerLoadingImage}
                alt="Loading"
                width={20}
                height={10}
              />{" "}
              <span className="font-serif mr-0.5 font-light">
                {t("Processing")}
              </span>
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={!selectedStatus}
              className="w-full h-12 sm:w-auto"
            >
              {t("Confirm")}
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default BulkStatusChangeModal;
