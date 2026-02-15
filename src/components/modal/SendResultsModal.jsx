// src/components/modal/SendResultsModal.jsx
import React from "react";
import {
    Modal,
    ModalBody,
    ModalFooter,
    Button,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { MdInfoOutline, MdCheckCircle, MdErrorOutline } from "react-icons/md";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const SendResultsModal = ({ isOpen, onClose, results, message }) => {
    const { t } = useTranslation();
    const { showingTranslateValue } = useUtilsFunction();

    const successResults = results?.success || [];
    const failureResults = results?.failure || [];

    const hasFailures = failureResults.length > 0;
    const hasSuccess = successResults.length > 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header with icon and close button */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-t-lg border-b border-gray-200 dark:border-gray-600 flex items-center justify-between" style={{ direction: "rtl" }}>
                <div className="flex items-center gap-3">
                    {hasFailures ? (
                        <MdErrorOutline className="text-2xl text-red-500 dark:text-red-400" />
                    ) : hasSuccess ? (
                        <MdCheckCircle className="text-2xl text-green-500 dark:text-green-400" />
                    ) : (
                        <MdInfoOutline className="text-2xl text-blue-500 dark:text-blue-400" />
                    )}
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {showingTranslateValue(message) || t("Send Results")}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    type="button"
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors duration-150 focus:outline-none"
                    aria-label={t("Close")}
                >
                    <IoClose className="text-xl text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            <ModalBody className="custom-modal px-8 pt-6 pb-4 bg-white dark:bg-gray-800" style={{ direction: "rtl" }}>

                {/* Success Section */}
                {successResults.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 text-right">
                            <MdCheckCircle className="text-green-500 dark:text-green-400 text-xl" />
                            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                                {t("Successfully Sent")} ({successResults.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <Table>
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <TableRow>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Phone Number")}</TableCell>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Status")}</TableCell>
                                    </TableRow>
                                </thead>
                                <TableBody>
                                    {successResults.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <TableCell className="text-right">{item.phone}</TableCell>
                                            <TableCell className="text-right">
                                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                    <MdCheckCircle className="text-sm" />
                                                    {t("Sent")}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Failure Section */}
                {failureResults.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 text-right">
                            <MdErrorOutline className="text-red-500 dark:text-red-400 text-xl" />
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                                {t("Failed to Send")} ({failureResults.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
                            <Table>
                                <thead className="bg-red-50 dark:bg-red-900/20">
                                    <TableRow>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Phone Number")}</TableCell>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Name")}</TableCell>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Reason")}</TableCell>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Error Code")}</TableCell>
                                    </TableRow>
                                </thead>
                                <TableBody>
                                    {failureResults.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                                            <TableCell className="text-right">{item.phone}</TableCell>
                                            <TableCell className="text-right">{item.name || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                                    <MdErrorOutline className="text-sm" />
                                                    {showingTranslateValue(item.reason) || "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm font-medium">
                                                    {item.code || "-"}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* No results message */}
                {successResults.length === 0 && failureResults.length === 0 && (
                    <div className="mb-6 text-center py-8">
                        <MdInfoOutline className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t("No results available")}</p>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="justify-end sm:gap-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <Button
                    className="sm:w-auto hover:bg-white hover:border-gray-50 dark:text-gray-600"
                    layout="outline"
                    onClick={onClose}
                >
                    {t("Close")}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default SendResultsModal;

