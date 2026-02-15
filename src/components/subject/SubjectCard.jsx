// src/components/subject/SubjectCard.jsx
import React from "react";
import { t } from "i18next";

// internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import EditDeleteButton from "../table/EditDeleteButton";
import CheckBox from "../form/others/CheckBox";

const SubjectCard = ({ subject, isCheck, setIsCheck, handleClick, toggleDrawerData }) => {
    const { showDateFormat } = useUtilsFunction();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with checkbox and actions */}
            <div className="flex justify-between items-start mb-3">
                <CheckBox
                    type="checkbox"
                    name={subject?._id}
                    id={subject?._id}
                    handleClick={handleClick}
                    isChecked={isCheck?.includes(subject?._id)}
                />
                <EditDeleteButton
                    id={subject._id}
                    subject={subject}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    title={subject?.title}
                />
            </div>

            {/* Subject info */}
            <div className="mb-3">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {subject?.title}
                </h2>
            </div>

            {/* Subject details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex justify-between items-start py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("SubjectDescription")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-xs">
                        {subject?.description || "-"}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("CreationDate")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{showDateFormat(subject.createdAt)}</span>
                </div>
            </div>
        </div>
    );
};

export default SubjectCard;
