// src/components/school/SchoolCard.jsx
import { Avatar } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import EditDeleteButton from "../table/EditDeleteButton";
import ActiveInActiveButton from "../table/ActiveInActiveButton";
import CheckBox from "../form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import { generateClassRange, generateDetailedClassList } from "@/utils/schoolUtils";

const SchoolCard = ({ school, isCheck, handleClick, toggleDrawerData }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { showDateFormat } = useUtilsFunction();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with checkbox and actions */}
            <div className="flex justify-between items-start mb-3">
                <CheckBox
                    type="checkbox"
                    name={school?._id}
                    id={school?._id}
                    handleClick={handleClick}
                    isChecked={isCheck?.includes(school?._id)}
                />
                <EditDeleteButton
                    id={school._id}
                    school={school}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    title={school?.name}
                />
            </div>

            {/* School info */}
            <div className="flex items-center gap-2.5 mb-3">
                <Avatar
                    className="bg-gray-50"
                    src={school.image || 'https://i.imgur.com/bCHF4hj.png'}
                    alt="school"
                />
                <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {school?.name}
                    </h2>
                </div>
            </div>

            {/* School details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("SchoolSymbol")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{school?.symbol || "-"}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("SchoolLocation")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{school?.location || "-"}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("SchoolType")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{school?.type || "-"}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("PrincipalName")}:</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100 text-right">
                        <div className="font-medium">{school?.principal?.name}</div>
                        <div className="text-gray-500">{school?.principal?.email}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("SchoolCoordinator")}:</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100 text-right">
                        <div className="font-medium">{school?.coordinator?.name}</div>
                        <div className="text-gray-500">{school?.coordinator?.email}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("StudentsCount")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{school?.studentsCount || 0}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("TeachersCount")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{school?.teachersCount || 0}</span>
                </div>

                <div className="flex justify-between items-start gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("SchoolClasses")}:</span>
                    <span 
                        className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-[60%]"
                        title={generateDetailedClassList(school?.classes)}
                    >
                        {generateClassRange(school?.classes)}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("IncludedInReport")}:</span>
                    <span className="text-lg text-gray-900 dark:text-gray-100">
                        {school?.includedInReport ? "✓" : "✗"}
                    </span>
                </div>

                {userInfo?.role === "super-admin" && (
                    <div className="flex justify-between items-center gap-2 py-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Manager")}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{school?.manager?.name || "-"}</span>
                    </div>
                )}

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("CreationDate")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{showDateFormat(school.createdAt)}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Status")}:</span>
                    <ActiveInActiveButton
                        id={school?._id}
                        school={school}
                        option="school"
                        status={school.status}
                    />
                </div>
            </div>
        </div>
    );
};

export default SchoolCard;