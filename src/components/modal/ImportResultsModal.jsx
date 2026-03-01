// src/components/modal/ImportResultsModal.jsx
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
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const ImportResultsModal = ({ isOpen, onClose, results, isLoading, stage, onUpload }) => {
    const { t } = useTranslation();

    const successCount = results?.success || 0;
    const failureCount = results?.failure || 0;
    const errors = results?.errors || [];
    const totalCount = results?.total || 0;

    const hasFailures = failureCount > 0;
    const hasSuccess = successCount > 0;
    const isProcessing = isLoading || stage === 'processing' || stage === 'uploading';
    const isCompleted = stage === 'completed' && !isLoading;
    const isReady = !stage && !isLoading && totalCount > 0;
    const isValidationError = stage === 'validation_error';
    const validationError = results?.validationError || null;

    return (
        <Modal isOpen={isOpen} onClose={isProcessing ? undefined : onClose}>
            {/* Header with icon and close button */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-t-lg border-b border-gray-200 dark:border-gray-600 flex items-center justify-between" style={{ direction: "rtl" }}>
                <div className="flex items-center gap-3">
                    {isValidationError ? (
                        <MdErrorOutline className="text-2xl text-red-500 dark:text-red-400" />
                    ) : hasFailures ? (
                        <MdErrorOutline className="text-2xl text-red-500 dark:text-red-400" />
                    ) : hasSuccess ? (
                        <MdCheckCircle className="text-2xl text-green-500 dark:text-green-400" />
                    ) : (
                        <MdInfoOutline className="text-2xl text-blue-500 dark:text-blue-400" />
                    )}
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {isValidationError ? 'שגיאה בקובץ הייבוא' : t("ImportResults")}
                    </h2>
                </div>
                {!isProcessing && (
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors duration-150 focus:outline-none"
                        aria-label={t("Close")}
                    >
                        <IoClose className="text-xl text-gray-600 dark:text-gray-300" />
                    </button>
                )}
            </div>

            <ModalBody className="custom-modal px-8 pt-6 pb-4 bg-white dark:bg-gray-800" style={{ direction: "rtl" }}>
                
                {/* Processing State */}
                {isProcessing && (
                    <div className="mb-6 text-center py-8">
                        <div className="flex flex-col items-center gap-4">
                            <img
                                src={spinnerLoadingImage}
                                alt="Loading"
                                width={48}
                                height={48}
                                className="inline-block saturate-0"
                            />
                            <div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    {stage === 'uploading' ? t("UploadingFile") : t("Processing")}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {stage === 'uploading' ? t("UploadingFileDescription") : t("ProcessingDescription")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Validation Error State */}
                {isValidationError && validationError && (
                    <div className="flex flex-col gap-4" style={{ direction: 'rtl' }}>
                        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <MdErrorOutline className="text-red-500 text-2xl shrink-0" />
                            <div>
                                <p className="font-semibold text-red-700 dark:text-red-400">הקובץ שהועלה אינו תואם לפורמט הנדרש</p>
                                <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">
                                    {validationError.recognized.length === 0
                                        ? 'לא נמצאה אף עמודה מוכרת — ודא שהכותרות תואמות לשמות הנדרשים'
                                        : `זוהו ${validationError.recognized.length} עמודות מוכרות מתוך ${validationError.recognized.length + validationError.unrecognized.length} בסך הכל`}
                                </p>
                            </div>
                        </div>

                        {validationError.missingRequired.length > 0 && (
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">שדות חובה חסרים:</p>
                                <div className="flex flex-wrap gap-2">
                                    {validationError.missingRequired.map((col) => (
                                        <span key={col} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                                            ✗ {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {validationError.unrecognized.length > 0 && (
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">עמודות לא מוכרות בקובץ:</p>
                                <div className="flex flex-wrap gap-2">
                                    {validationError.unrecognized.map((col) => (
                                        <span key={col} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                                            ⚠ {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">שמות עמודות תקניים (לשימוש בקובץ):</p>
                            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex flex-wrap gap-2">
                                    {validationError.allExpected.map((col) => (
                                        <span key={col} className={`px-2 py-1 rounded text-xs ${
                                            validationError.recognized.includes(col)
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                        }`}>
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">ירוק = נמצא בקובץ שלך | אפור = לא נמצא</p>
                        </div>
                    </div>
                )}

                {/* Ready State - File processed and ready for upload */}
                {isReady && (
                    <div className="mb-6 text-center py-8">
                        <div className="flex flex-col items-center gap-4">
                            <MdCheckCircle className="text-4xl text-green-500 dark:text-green-400" />
                            <div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    {t("FileReadyForUpload")}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {t("FileReadyDescription", { count: totalCount })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Statistics - Only show when completed */}
                {isCompleted && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t("TotalRows")}</div>
                            </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{successCount}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t("Successful")}</div>
                            </div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failureCount}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t("Failed")}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Message - Only show when completed */}
                {isCompleted && hasSuccess && failureCount === 0 && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-right">
                            <MdCheckCircle className="text-green-500 dark:text-green-400 text-xl" />
                            <p className="text-green-700 dark:text-green-300 font-medium">
                                {t("AllItemsImportedSuccessfully")}
                            </p>
                        </div>
                    </div>
                )}

                {/* Errors Section - Only show when completed */}
                {isCompleted && errors.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 text-right">
                            <MdErrorOutline className="text-red-500 dark:text-red-400 text-xl" />
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                                {t("ErrorsDetails")} ({errors.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800 max-h-96">
                            <Table>
                                <thead className="bg-red-50 dark:bg-red-900/20 sticky top-0">
                                    <TableRow>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Row")}</TableCell>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("ProductName")}</TableCell>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("SKU")}</TableCell>
                                        <TableCell className="text-right font-semibold text-gray-700 dark:text-gray-300">{t("Error")}</TableCell>
                                    </TableRow>
                                </thead>
                                <TableBody>
                                    {errors.map((error, index) => (
                                        <TableRow key={index} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                                            <TableCell className="text-right">
                                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm font-medium">
                                                    {error.row || index + 1}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {error.product || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                                                    {error.sku || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                                    <MdErrorOutline className="text-sm" />
                                                    {error.message || error}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* No data message - Only show when completed */}
                {isCompleted && totalCount === 0 && (
                    <div className="mb-6 text-center py-8">
                        <MdInfoOutline className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t("NoDataToImport")}</p>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="justify-end sm:gap-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                {isProcessing ? (
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
                ) : isReady ? (
                    <>
                        <Button
                            className="sm:w-auto w-full h-12 hover:bg-white hover:border-gray-50 dark:text-gray-600"
                            layout="outline"
                            onClick={onClose}
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            className="sm:w-auto w-full h-12"
                            onClick={onUpload}
                        >
                            {t("UploadToSystem")}
                        </Button>
                    </>
                ) : isValidationError ? (
                    <Button
                        className="sm:w-auto w-full h-12 hover:bg-white hover:border-gray-50 dark:text-gray-600"
                        layout="outline"
                        onClick={onClose}
                    >
                        {t("Close")}
                    </Button>
                ) : (
                    <Button
                        className="sm:w-auto w-full h-12 hover:bg-white hover:border-gray-50 dark:text-gray-600"
                        layout="outline"
                        onClick={onClose}
                    >
                        {t("Close")}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
};

export default ImportResultsModal;