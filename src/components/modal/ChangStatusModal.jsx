import React from "react";
import { Dialog } from "@headlessui/react";
import { IoClose, IoSwapHorizontalOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";

const ChangStatusModal = ({ yes, cancel, status, isSubmitting }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={true} onClose={cancel} className="relative z-50" dir="rtl">
      {/* Overlay */}
      <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 pr-2">
              <div className="mt-1 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <IoSwapHorizontalOutline className="h-6 w-6 text-yellow-500" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("AreYouSureChangeStatus")}
                <span className="text-yellow-500 font-bold"> "{status}"</span>?
              </Dialog.Title>
            </div>

            <button
              onClick={cancel}
              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={cancel}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t("Cancel")}
            </button>

            <button
              onClick={yes}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg"
            >
              {t("Confirm")}
            </button>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ChangStatusModal;
