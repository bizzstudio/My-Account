// src/components/modal/ConfirmModal.jsx
import React from "react";
import { Button, Input, Textarea, Modal, ModalBody, ModalFooter } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { RiExchangeLine } from "react-icons/ri";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import LabelArea from "../form/selectOption/LabelArea";

const ConfirmModal = ({
  isOpen,
  message,
  confirm,
  cancel,
  isSubmitting,
  showTextarea = false,  // האם להציג TextArea
  textareaRef,
  icon = <RiExchangeLine size={40} />,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={cancel}>
      <ModalBody className="text-center custom-modal px-8 pt-6 pb-1">
        <span className="flex justify-center text-3xl mb-2 text-red-500">
          {icon}
        </span>
        <h2 className="text-xl font-medium">{message}</h2>

        {/* TextArea דינאמי לסיבת סגירת התיק */}
        {showTextarea && (
          <div className="mt-4">
            <label htmlFor="closeReason" className="block text-sm font-medium text-gray-700 dark:text-gray-200 text-right">
              {t("closeReason")}
            </label>
            <Input
              id="closeReason"
              placeholder={t("enterCloseReason")}
              ref={textareaRef}
              className="my-1"
            />
          </div>
        )}
      </ModalBody>

      <ModalFooter className="justify-center sm:gap-3">
        <Button
          className="w-auto hover:bg-white hover:border-gray-50 dark:text-gray-600"
          layout="outline"
          onClick={cancel}
        >
          {t("cancel")}
        </Button>
        <div className="flex justify-end sm:w-fit w-full">
          {isSubmitting ? (
            <Button disabled={true} type="button" className="w-full h-12 sm:w-auto">
              <img
                src={spinnerLoadingImage}
                alt="Loading"
                width={22}
                height={22}
                className="inline-block saturate-0"
              />{" "}
              <span className="font-serif font-light">{t("Processing")}</span>
            </Button>
          ) : (
            <Button onClick={confirm} className="w-full h-12 sm:w-auto">
              {t("confirm")}
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmModal;