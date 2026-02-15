// src/components/guide/GuideCard.jsx
import { Avatar } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import EditDeleteButton from "../table/EditDeleteButton";
import ActiveInActiveButton from "../table/ActiveInActiveButton";
import CheckBox from "../form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import { SidebarContext } from "@/context/SidebarContext";

const GuideCard = ({ guide, isCheck, setIsCheck, handleClick, toggleDrawerData }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { schools } = useContext(SidebarContext);
    const { showDateFormat } = useUtilsFunction();

    // Helper function to get school names
    const getSchoolNames = (schoolIds) => {
        if (!Array.isArray(schoolIds) || schoolIds.length === 0) return "-";
        const schoolNames = schoolIds.map(id => {
            const school = schools?.find(s => s._id === id);
            return school?.name || null;
        }).filter(name => name !== null);
        return schoolNames.length > 0 ? schoolNames.join(", ") : "-";
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with checkbox and actions */}
            <div className="flex justify-between items-start mb-3">
                <CheckBox
                    type="checkbox"
                    name={guide?._id}
                    id={guide?._id}
                    handleClick={handleClick}
                    isChecked={isCheck?.includes(guide?._id)}
                />
                <EditDeleteButton
                    id={guide._id}
                    guide={guide}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    title={guide?.name}
                />
            </div>

            {/* Guide info */}
            <div className="flex items-center gap-2.5 mb-3">
                <Avatar
                    className="bg-gray-50"
                    src={guide.image || 'https://i.imgur.com/bCHF4hj.png'}
                    alt="guide"
                />
                <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {guide?.name}
                    </h2>
                </div>
            </div>

            {/* Guide details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("GuideEmail")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{guide?.email}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("GuidePhone")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{guide?.phone}</span>
                </div>

                {/* <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("MonthlyHours")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{guide?.monthlyHours || 0}</span>
                </div> */}

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Schools")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100" title={getSchoolNames(guide?.schools)}>
                        {guide?.schools?.length > 0 ? `${guide.schools.length} ${t('Schools')}` : "-"}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("SubmittedReports")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{guide?.submittedReportsCount || 0}</span>
                </div>

                {userInfo?.role === "super-admin" && (
                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Manager")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{guide?.manager?.name || "-"}</span>
                    </div>
                )}

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("CreationDate")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{showDateFormat(guide.createdAt)}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Status")}:</span>
                    <ActiveInActiveButton
                        id={guide?._id}
                        guide={guide}
                        option="guide"
                        status={guide.status}
                    />
                </div>
            </div>
        </div>
    );
};

export default GuideCard;