// src/components/sessionReport/SessionReportsTable.jsx
import { TableBody, TableCell, TableRow, WindmillContext } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import SessionReportCard from "./SessionReportCard";
import CheckBox from "@/components/form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import { getReportTypeColor } from "@/utils/reportTypeColors";

const SessionReportsTable = ({ reports, isCheck, setIsCheck, isMobile = false, filters }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { mode } = useContext(WindmillContext);
    const isDarkMode = mode === "dark";

    const {
        title,
        serviceId,
        handleModalOpen,
        handleUpdate,
        isSubmitting,
    } = useToggleDrawer();

    const { showDateFormat, showTimeFormat } = useUtilsFunction();

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

    // Apply filters
    const filteredReports = reports?.filter(report => {
        if (filters?.guideFilter && report.guide?._id !== filters.guideFilter) return false;
        if (filters?.schoolFilter && report.school?._id !== filters.schoolFilter) return false;
        if (filters?.managerFilter && report.guide?.manager?._id !== filters.managerFilter) return false;
        return true;
    });

    return (
        <>
            {isCheck?.length < 1 && (
                <DeleteModal id={serviceId} title={title} table="sessionReports" />
            )}
            
            {isMobile ? (
                // Mobile Card View
                <div>
                    {filteredReports?.map((report) => (
                        <SessionReportCard
                            key={report._id}
                            report={report}
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
                    {filteredReports?.map((report) => (
                        <TableRow key={report._id}>
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={report?._id}
                                    id={report?._id}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(report?._id)}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={report._id}
                                    sessionReport={report}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={handleUpdate}
                                    handleModalOpen={handleModalOpen}
                                    title={t("DeleteReportTitle", {
                                        guideName: report?.guide?.name || "-",
                                        subjectTitle: report?.subject?.title || report?.event?.title || "-",
                                        reportDate: showDateFormat(report?.date),
                                        schoolName: report?.school?.name || "-"
                                    })}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm font-medium">
                                    {report?.guide?.name || "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {showDateFormat(report?.date)}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <div className="text-sm flex items-center justify-center gap-1" dir="ltr">
                                    <div>{showTimeFormat(report?.startTime, "HH:mm")}</div>
                                    <div className="text-gray-500">-</div>
                                    <div>{showTimeFormat(report?.endTime, "HH:mm")}</div>
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {report?.school?.name || "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {report?.class || "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {report?.subject?.title || report?.event?.title || "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center min-w-[80px] max-w-[170px] truncate text-gray-500 dark:text-gray-400" title={report?.description}>
                                <span className="text-sm">
                                    {report?.description || "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span 
                                    className="text-sm font-medium"
                                    style={{ color: getReportTypeColor(report?.participants, !isDarkMode) }}
                                >
                                    {report?.participants || "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {typeof report?.participantsAmount === 'number' ? report.participantsAmount : "-"}
                                </span>
                            </TableCell>

                            {userInfo?.role === "super-admin" && (
                                <TableCell className="text-center">
                                    <span className="text-sm">{report?.guide?.manager?.name || "-"}</span>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </>
    );
};

export default SessionReportsTable;