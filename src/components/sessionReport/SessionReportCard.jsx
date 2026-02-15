// src/components/sessionReport/SessionReportCard.jsx
import React, { useContext } from "react";
import { t } from "i18next";

// internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import EditDeleteButton from "../table/EditDeleteButton";
import CheckBox from "../form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import { getReportTypeColor } from "@/utils/reportTypeColors";
import { WindmillContext } from "@windmill/react-ui";

const SessionReportCard = ({ report, isCheck, setIsCheck, handleClick, toggleDrawerData }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { showDateFormat, showTimeFormat } = useUtilsFunction();
    const { mode } = useContext(WindmillContext);
    const isDarkMode = mode === "dark";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with checkbox and actions */}
            <div className="flex justify-between items-start mb-3">
                <CheckBox
                    type="checkbox"
                    name={report?._id}
                    id={report?._id}
                    handleClick={handleClick}
                    isChecked={isCheck?.includes(report?._id)}
                />
                <EditDeleteButton
                    id={report._id}
                    sessionReport={report}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    title={`${report?.guide?.name} - ${showDateFormat(report?.date)}`}
                />
            </div>

            {/* Report info */}
            <div className="mb-3">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {report?.guide?.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {showDateFormat(report?.date)} • {report?.school?.name}
                </p>
            </div>

            {/* Report details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("StartTime")} / {t("EndTime")}:</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1" dir="ltr">
                        <div>{showTimeFormat(report?.startTime, "HH:mm")}</div>
                        <div className="text-gray-500">-</div>
                        <div>{showTimeFormat(report?.endTime, "HH:mm")}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("ReportClass")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{report?.class || "-"}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("ReportSubject")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{report?.subject?.title || report?.event?.title || "-"}</span>
                </div>

                <div className="flex justify-between items-start py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("ReportDescription")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-xs">
                        {report?.description || "-"}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("ReportParticipants")}:</span>
                    <span 
                        className="text-sm font-medium"
                        style={{ color: getReportTypeColor(report?.participants, !isDarkMode) }}
                    >
                        {report?.participants || "-"}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("ParticipantsAmount")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{typeof report?.participantsAmount === 'number' ? report.participantsAmount : "-"}</span>
                </div>

                {userInfo?.role === "super-admin" && (
                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Manager")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{report?.guide?.manager?.name || "-"}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionReportCard;