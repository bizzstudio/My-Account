// src/components/event/EventCard.jsx
import React from "react";
import { t } from "i18next";

// internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import EditDeleteButton from "../table/EditDeleteButton";
import CheckBox from "../form/others/CheckBox";

const EventCard = ({ event, isCheck, setIsCheck, handleClick, toggleDrawerData }) => {
    const { showDateFormat } = useUtilsFunction();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with checkbox and actions */}
            <div className="flex justify-between items-start mb-3">
                <CheckBox
                    type="checkbox"
                    name={event?._id}
                    id={event?._id}
                    handleClick={handleClick}
                    isChecked={isCheck?.includes(event?._id)}
                />
                <EditDeleteButton
                    id={event._id}
                    event={event}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    title={event?.title}
                />
            </div>

            {/* Event info */}
            <div className="mb-3">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {event?.title}
                </h2>
            </div>

            {/* Event details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("EventSchool")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                        {event?.school?.name || "-"}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("EventColor")}:</span>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-6 rounded-lg border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: event?.color || "#ffffff" }}
                            title={event?.color}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("CreationDate")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{showDateFormat(event.createdAt)}</span>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
