// src/components/training/TrainingCard.jsx
import React, { useContext, useState } from "react";
import { t } from "i18next";
import dayjs from "dayjs";

// Internal import
import EditDeleteButton from "../table/EditDeleteButton";
import ActiveInActiveButtonGeneric from "../table/ActiveInActiveButtonGeneric";
import TrainingServices from "@/services/TrainingServices";
import { SidebarContext } from "@/context/SidebarContext";
import notifyApiResponse from "@/utils/notifyApiResponse";
import CheckBox from "../form/others/CheckBox";
import ConfirmModal from "../modal/ConfirmModal";
import TrainingTypeBadge from "./TrainingTypeBadge";
import TrainingFormatBadge from "./TrainingFormatBadge";

const TrainingCard = ({ training, isCheck, handleClick, toggleDrawerData }) => {
    const { setIsUpdate } = useContext(SidebarContext);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState({ id: null, currentStatus: null });

    // בדיקה אם הדרכה עתידית
    const isTrainingFuture = (training) => {
        if (!training?.date) return false;
        const now = new Date();
        const trainingDate = dayjs(training.date).toDate();
        return trainingDate >= now;
    };

    const handleChangeStatus = async (id, currentStatus) => {
        // בדיקה אם ההדרכה עתידית ואם משנים ל-inactive
        const newStatus = currentStatus?.toLowerCase() === "active" ? "inactive" : "active";
        const isChangingToInactive = newStatus === "inactive";

        if (isChangingToInactive && isTrainingFuture(training)) {
            // הצגת פופאפ אישור
            setPendingStatusChange({ id, currentStatus });
            setConfirmModalOpen(true);
            return;
        }

        // אם לא צריך אישור, מבצעים את השינוי ישירות
        await performStatusChange(id, newStatus);
    };

    const performStatusChange = async (id, newStatus) => {
        try {
            const res = await TrainingServices.updateTraining(id, { status: newStatus });
            setIsUpdate(true);
            notifyApiResponse(res, true);
        } catch (err) {
            notifyApiResponse(err, false);
        }
    };

    const handleConfirmStatusChange = async () => {
        if (pendingStatusChange.id) {
            const newStatus = pendingStatusChange.currentStatus?.toLowerCase() === "active" ? "inactive" : "active";
            await performStatusChange(pendingStatusChange.id, newStatus);
            setConfirmModalOpen(false);
            setPendingStatusChange({ id: null, currentStatus: null });
        }
    };

    const handleCancelStatusChange = () => {
        setConfirmModalOpen(false);
        setPendingStatusChange({ id: null, currentStatus: null });
    };

    // Helper function to format training date and time
    const formatTrainingDateTime = (date) => {
        if (!date) return "-";
        return dayjs(date).format('DD/MM/YYYY HH:mm');
    };

    // Helper function to format duration
    const formatDuration = (minutes) => {
        if (!minutes) return "-";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) {
            return `${hours} ${t('Hours')} ${mins} ${t('Minutes')}`;
        } else if (hours > 0) {
            return `${hours} ${t('Hours')}`;
        }
        return `${mins} ${t('Minutes')}`;
    };

    return (
        <>
            <ConfirmModal
                isOpen={confirmModalOpen}
                message={t("TrainingCancelConfirmMessage")}
                confirm={handleConfirmStatusChange}
                cancel={handleCancelStatusChange}
                isSubmitting={false}
            />
            <div className={`rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 ${!isTrainingFuture(training)
                ? "opacity-60 bg-gray-50 dark:bg-gray-900/30"
                : "bg-white dark:bg-gray-800"
                }`}>
                {/* Header with checkbox and actions */}
                <div className="flex justify-between items-start mb-3">
                    <CheckBox
                        type="checkbox"
                        name={training?._id}
                        id={training?._id}
                        handleClick={handleClick}
                        isChecked={isCheck?.includes(training?._id)}
                    />
                    <EditDeleteButton
                        id={training._id}
                        training={training}
                        isSubmitting={toggleDrawerData.isSubmitting}
                        handleUpdate={toggleDrawerData.handleUpdate}
                        handleModalOpen={toggleDrawerData.handleModalOpen}
                        title={training?.topic}
                    />
                </div>

                {/* Training details */}
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("TrainingType")}:</span>
                        <div className="flex flex-col justify-center items-end gap-1">
                            <TrainingTypeBadge type={training?.type} topic={training?.topic} />
                            {!isTrainingFuture(training) && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                    ({t("Expired Training")})
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("TrainingFormat")}:</span>
                        <TrainingFormatBadge isFrontal={training?.isFrontal} />
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("TrainingDate")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{formatTrainingDateTime(training?.date)}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("TrainingLink")}:</span>
                        {training?.link ? (
                            <a
                                href={training.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {t("OpenLink")}
                            </a>
                        ) : (
                            <span className="text-sm text-gray-400">-</span>
                        )}
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("TrainingDuration")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{formatDuration(training?.duration)}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Lecturer")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{training?.lecturer?.fullName || "-"}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("RegistrantsCount")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{training?.registrantsCount || 0}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("ConfirmedCount")}:</span>
                        <span className={`text-sm ${training?.confirmedCount > 0 ? "text-green-500" : ""}`}>{training?.confirmedCount || 0}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Status")}:</span>
                        <ActiveInActiveButtonGeneric
                            id={training?._id}
                            status={training.status}
                            handleChangeStatus={handleChangeStatus}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TrainingCard;

