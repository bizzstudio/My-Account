// src/components/lecturer/LecturersTable.jsx
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ActiveInActiveButtonGeneric from "@/components/table/ActiveInActiveButtonGeneric";
import LecturerServices from "@/services/LecturerServices";
import { SidebarContext } from "@/context/SidebarContext";
import notifyApiResponse from "@/utils/notifyApiResponse";
import LecturerCard from "./LecturerCard";
import CheckBox from "@/components/form/others/CheckBox";

const LecturersTable = ({ lecturers, isCheck, setIsCheck, isMobile = false }) => {
    const {
        title,
        serviceId,
        handleModalOpen,
        handleUpdate,
        isSubmitting,
    } = useToggleDrawer();
    const { setIsUpdate } = useContext(SidebarContext);

    const { showDateFormat } = useUtilsFunction();

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

    // Helper function to display topics
    const displayTopics = (topics) => {
        if (!Array.isArray(topics) || topics.length === 0) return "-";
        if (topics.length <= 2) return topics.join(", ");
        return `${topics.slice(0, 2).join(", ")} (+${topics.length - 2})`;
    };

    // Helper function to display trainings count with breakdown
    const displayTrainingsCount = (trainingsCount) => {
        if (!trainingsCount) {
            return (
                <div className="flex flex-col items-center gap-1">
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
                <div className="flex flex-col items-center gap-1">
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
        <>
            {isCheck?.length < 1 && (
                <DeleteModal id={serviceId} title={title} table="lecturers" />
            )}

            {isMobile ? (
                // Mobile Card View
                <div>
                    {lecturers?.map((lecturer) => (
                        <LecturerCard
                            key={lecturer._id}
                            lecturer={lecturer}
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
                    {lecturers?.map((lecturer) => (
                        <TableRow key={lecturer._id}>
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={lecturer?._id}
                                    id={lecturer?._id}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(lecturer?._id)}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={lecturer._id}
                                    lecturer={lecturer}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={handleUpdate}
                                    handleModalOpen={handleModalOpen}
                                    title={lecturer?.fullName}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <h2 className="text-sm font-medium text-center">
                                    {lecturer?.fullName}
                                </h2>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{lecturer?.phone}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{lecturer?.idNumber}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{lecturer?.email || "-"}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {lecturer?.taxStatus === 'exempt' ? t('TaxExempt') :
                                     lecturer?.taxStatus === 'authorized' ? t('TaxAuthorized') : "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center" title={lecturer?.topics?.join(", ")}>
                                <span className="text-sm">{displayTopics(lecturer?.topics)}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                {displayTrainingsCount(lecturer?.trainingsCount)}
                            </TableCell>

                            <TableCell className="text-center">
                                <ActiveInActiveButtonGeneric
                                    id={lecturer?._id}
                                    status={lecturer.status}
                                    handleChangeStatus={handleChangeStatus}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {showDateFormat(lecturer.createdAt)}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </>
    );
};

export default LecturersTable;

