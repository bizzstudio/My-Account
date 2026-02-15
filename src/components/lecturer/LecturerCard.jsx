// src/components/lecturer/LecturerCard.jsx
import React, { useContext } from "react";
import { t } from "i18next";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import EditDeleteButton from "../table/EditDeleteButton";
import ActiveInActiveButtonGeneric from "../table/ActiveInActiveButtonGeneric";
import LecturerServices from "@/services/LecturerServices";
import { SidebarContext } from "@/context/SidebarContext";
import notifyApiResponse from "@/utils/notifyApiResponse";
import CheckBox from "../form/others/CheckBox";

const LecturerCard = ({ lecturer, isCheck, handleClick, toggleDrawerData }) => {
    const { showDateFormat } = useUtilsFunction();
    const { setIsUpdate } = useContext(SidebarContext);

    const handleChangeStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus?.toLowerCase() === "active" ? "inactive" : "active";
            const res = await LecturerServices.updateLecturer(id, { status: newStatus });
            setIsUpdate(true);
            notifyApiResponse(res, true);
        } catch (err) {
            notifyApiResponse(err, false);
        }
    };

    // Helper function to display topics
    const displayTopics = (topics) => {
        if (!Array.isArray(topics) || topics.length === 0) return "-";
        return topics.join(", ");
    };

    // Helper function to display trainings count with breakdown
    const displayTrainingsCount = (trainingsCount) => {
        if (!trainingsCount) {
            return (
                <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs">{t('GuardianTrainings')}: 0</span>
                    <span className="text-xs">{t('InfoMeetings')}: 0</span>
                    <span className="text-xs">{t('ExposureLectures')}: 0</span>
                </div>
            );
        }
        
        if (typeof trainingsCount === 'object' && trainingsCount?.byType) {
            const breakdown = [
                `${t('GuardianTrainings')}: ${trainingsCount.byType['guardian-training'] || 0}`,
                `${t('InfoMeetings')}: ${trainingsCount.byType['info-meeting'] || 0}`,
                `${t('ExposureLectures')}: ${trainingsCount.byType['exposure-lecture'] || 0}`
            ];
            
            return (
                <div className="flex flex-col items-end gap-0.5">
                    {breakdown.map((item, index) => (
                        <span key={index} className="text-xs">
                            {item}
                        </span>
                    ))}
                </div>
            );
        }
        
        const total = typeof trainingsCount === 'object' ? trainingsCount?.total || 0 : trainingsCount;
        return <span className="text-sm">{total}</span>;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with checkbox and actions */}
            <div className="flex justify-between items-start mb-3">
                <CheckBox
                    type="checkbox"
                    name={lecturer?._id}
                    id={lecturer?._id}
                    handleClick={handleClick}
                    isChecked={isCheck?.includes(lecturer?._id)}
                />
                <EditDeleteButton
                    id={lecturer._id}
                    lecturer={lecturer}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    title={lecturer?.fullName}
                />
            </div>

            {/* Lecturer info */}
            <div className="flex items-center gap-2.5 mb-3">
                <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {lecturer?.fullName}
                    </h2>
                </div>
            </div>

            {/* Lecturer details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("LecturerPhone")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{lecturer?.phone}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("LecturerIdNumber")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{lecturer?.idNumber}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Email")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{lecturer?.email || "-"}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("TaxStatus")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                        {lecturer?.taxStatus === 'exempt' ? t('TaxExempt') :
                         lecturer?.taxStatus === 'authorized' ? t('TaxAuthorized') : "-"}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Topics")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 text-left max-w-[60%]" title={displayTopics(lecturer?.topics)}>
                        {displayTopics(lecturer?.topics)}
                    </span>
                </div>

                <div className="flex justify-between items-start gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("TrainingsCount")}:</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100 text-right">
                        {displayTrainingsCount(lecturer?.trainingsCount)}
                    </div>
                </div>

                {lecturer?.bankAccount?.bankName && (
                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("BankAccount")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {lecturer?.bankAccount?.bankName} - {lecturer?.bankAccount?.branchNumber}/{lecturer?.bankAccount?.accountNumber}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("CreationDate")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{showDateFormat(lecturer.createdAt)}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Status")}:</span>
                    <ActiveInActiveButtonGeneric
                        id={lecturer?._id}
                        status={lecturer.status}
                        handleChangeStatus={handleChangeStatus}
                    />
                </div>
            </div>
        </div>
    );
};

export default LecturerCard;

