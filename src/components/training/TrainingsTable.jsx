// src/components/training/TrainingsTable.jsx
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React, { useContext, useState } from "react";
import { t } from "i18next";
import dayjs from "dayjs";

// Internal import
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ActiveInActiveButtonGeneric from "@/components/table/ActiveInActiveButtonGeneric";
import TrainingServices from "@/services/TrainingServices";
import { SidebarContext } from "@/context/SidebarContext";
import notifyApiResponse from "@/utils/notifyApiResponse";
import TrainingCard from "./TrainingCard";
import CheckBox from "@/components/form/others/CheckBox";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TrainingTypeBadge from "./TrainingTypeBadge";
import TrainingFormatBadge from "./TrainingFormatBadge";

const TrainingsTable = ({ trainings, isCheck, setIsCheck, isMobile = false }) => {
    const {
        title,
        serviceId,
        handleModalOpen,
        handleUpdate,
        isSubmitting,
    } = useToggleDrawer();
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
        // מציאת ההדרכה
        const training = trainings?.find(t => t._id === id);
        
        // בדיקה אם ההדרכה עתידית ואם משנים ל-inactive
        const newStatus = currentStatus?.toLowerCase() === "active" ? "inactive" : "active";
        const isChangingToInactive = newStatus === "inactive";
        
        if (isChangingToInactive && training && isTrainingFuture(training)) {
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

    const handleClick = (e) => {
        const { id, checked } = e.target;
        setIsCheck([...isCheck, id]);
        if (!checked) {
            setIsCheck(isCheck.filter((item) => item !== id));
        }
    };

    const toggleDrawerData = {
        handleModalOpen,
        handleUpdate,
        isSubmitting,
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

    // פונקציית מיון הדרכות
    const sortTrainings = (trainingsList) => {
        if (!trainingsList || trainingsList.length === 0) return [];
        
        const now = new Date();
        
        // הפרדה בין הדרכות עתידיות לשעברו
        const futureTrainings = [];
        const pastTrainings = [];
        
        trainingsList.forEach(training => {
            if (!training?.date) {
                // אם אין תאריך, נשים בסוף
                pastTrainings.push(training);
                return;
            }
            
            const trainingDate = dayjs(training.date).toDate();
            if (trainingDate >= now) {
                futureTrainings.push(training);
            } else {
                pastTrainings.push(training);
            }
        });
        
        // מיון הדרכות עתידיות: מהכי קרובה עד הכי רחוקה
        futureTrainings.sort((a, b) => {
            const dateA = dayjs(a.date).toDate();
            const dateB = dayjs(b.date).toDate();
            return dateA - dateB;
        });
        
        // מיון הדרכות שעברו: מהכי קרובה אלינו עד הישנה ביותר
        pastTrainings.sort((a, b) => {
            if (!a?.date) return 1;
            if (!b?.date) return -1;
            const dateA = dayjs(a.date).toDate();
            const dateB = dayjs(b.date).toDate();
            return dateB - dateA; // הפוך - מהכי קרובה אלינו (הכי גדולה) עד הישנה ביותר
        });
        
        // החזרת הדרכות עתידיות תחילה, ואז הדרכות שעברו
        return [...futureTrainings, ...pastTrainings];
    };

    // מיון ההדרכות
    const sortedTrainings = sortTrainings(trainings);

    return (
        <>
            <ConfirmModal
                isOpen={confirmModalOpen}
                message={t("TrainingCancelConfirmMessage")}
                confirm={handleConfirmStatusChange}
                cancel={handleCancelStatusChange}
                isSubmitting={false}
            />
            {isCheck?.length < 1 && (
                <DeleteModal 
                    id={serviceId} 
                    title={title} 
                    table="trainings"
                    trainings={trainings?.filter(t => t._id === serviceId) || []}
                />
            )}

            {isMobile ? (
                // Mobile Card View
                <div>
                    {sortedTrainings?.map((training) => (
                        <TrainingCard
                            key={training._id}
                            training={training}
                            isCheck={isCheck}
                            setIsCheck={setIsCheck}
                            handleClick={handleClick}
                            toggleDrawerData={toggleDrawerData}
                        />
                    ))}
                </div>
            ) : (
                // Desktop Table View
                <TableBody>
                    {sortedTrainings?.map((training) => {
                        const isPast = !isTrainingFuture(training);
                        return (
                        <TableRow 
                            key={training._id}
                            className={isPast ? "opacity-60 bg-gray-50 dark:bg-gray-900/30" : ""}
                        >
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={training?._id}
                                    id={training?._id}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(training?._id)}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={training._id}
                                    training={training}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={handleUpdate}
                                    handleModalOpen={handleModalOpen}
                                    title={training?.topic}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <div className="flex justify-center items-center">
                                    <TrainingTypeBadge type={training?.type} topic={training?.topic} />
                                    {isPast && (
                                        <span className="ms-1 text-xs text-gray-400 dark:text-gray-500 italic">
                                            ({t("Expired Training")})
                                        </span>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <div className="flex justify-center">
                                    <TrainingFormatBadge isFrontal={training?.isFrontal} />
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{formatTrainingDateTime(training?.date)}</span>
                            </TableCell>

                            <TableCell className="text-center">
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
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{formatDuration(training?.duration)}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{training?.lecturer?.fullName || "-"}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{training?.registrantsCount || 0}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className={`text-sm ${training?.confirmedCount > 0 ? "text-green-500" : ""}`}>{training?.confirmedCount || 0}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <ActiveInActiveButtonGeneric
                                    id={training?._id}
                                    status={training.status}
                                    handleChangeStatus={handleChangeStatus}
                                />
                            </TableCell>
                        </TableRow>
                        );
                    })}
                </TableBody>
            )}
        </>
    );
};

export default TrainingsTable;

