// src/components/registrant/TrainingsLecturersTable.jsx
import React from "react";
import { t } from "i18next";
import dayjs from "dayjs";
import { FiUser, FiCalendar, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Tooltip as ReactTooltip } from "react-tooltip";
import TrainingTypeBadge from "@/components/training/TrainingTypeBadge";

const TrainingsLecturersTable = ({ trainings, variant = 'table' }) => {
    if (!trainings || !Array.isArray(trainings) || trainings.length === 0) {
        return (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">-</span>
        );
    }

    const validTrainings = trainings
        .map(t => ({
            training: t.training,
            attendanceConfirmed: t.attendanceConfirmed,
            registrationDate: t.registrationDate
        }))
        .filter(t => t.training);

    if (validTrainings.length === 0) {
        return (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">-</span>
        );
    }

    // Table variant - compact with icons and tooltips
    if (variant === 'table') {
        return (
            <div className="inline-flex flex-col gap-1.5 min-w-[200px]">
                {validTrainings.map((item, index) => {
                    const training = item.training;
                    const lecturerName = training.lecturer?.fullName || '-';
                    const registrationDate = item.registrationDate
                        ? dayjs(item.registrationDate).format('DD/MM/YYYY')
                        : null;

                    // Create unique IDs using training ID and index to ensure uniqueness
                    const trainingUniqueId = training._id ? `${training._id}` : `training-${index}`;
                    const rowUniqueId = `${trainingUniqueId}-row-${index}`;
                    const lecturerTooltipId = `lecturer-${rowUniqueId}`;
                    const attendanceTooltipId = `attendance-${rowUniqueId}`;
                    const dateTooltipId = `date-${rowUniqueId}`;

                    const attendanceText = item.attendanceConfirmed
                        ? t("AttendanceConfirmedYes")
                        : t("AttendanceConfirmedNo");

                    return (
                        <div key={rowUniqueId} className="flex items-center gap-2 flex-wrap">
                            {/* Training Badge */}
                            <div className="flex-shrink-0">
                                <TrainingTypeBadge
                                    type={training.type}
                                    topic={training.topic}
                                    date={training.date}
                                />
                            </div>

                            {/* Icons with tooltips */}
                            <div className="flex items-center gap-1.5">
                                {/* Lecturer Icon */}
                                <div
                                    data-tooltip-id={lecturerTooltipId}
                                    data-tooltip-content={lecturerName}
                                    className="flex-shrink-0 p-1 rounded-md bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <FiUser className="text-blue-600 dark:text-blue-400" size={14} />
                                </div>
                                <ReactTooltip
                                    id={lecturerTooltipId}
                                    backgroundColor="#3b82f6"
                                    place="top"
                                    effect="solid"
                                />

                                {/* Attendance Icon */}
                                <div
                                    data-tooltip-id={attendanceTooltipId}
                                    data-tooltip-content={attendanceText}
                                    className={`flex-shrink-0 p-1 rounded-md cursor-pointer transition-colors ${item.attendanceConfirmed
                                        ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                                        : 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                                        }`}
                                >
                                    {item.attendanceConfirmed ? (
                                        <FiCheckCircle className="text-green-600 dark:text-green-400" size={14} />
                                    ) : (
                                        <FiXCircle className="text-red-600 dark:text-red-400" size={14} />
                                    )}
                                </div>
                                <ReactTooltip
                                    id={attendanceTooltipId}
                                    backgroundColor={item.attendanceConfirmed ? "#10b981" : "#ef4444"}
                                    place="top"
                                    effect="solid"
                                />

                                {/* Registration Date Icon */}
                                {registrationDate && (
                                    <>
                                        <div
                                            data-tooltip-id={dateTooltipId}
                                            data-tooltip-content={`${t("RegisteredOnDate")}: ${registrationDate}`}
                                            className="flex-shrink-0 p-1 rounded-md bg-purple-50 dark:bg-purple-900/20 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                        >
                                            <FiCalendar className="text-purple-600 dark:text-purple-400" size={14} />
                                        </div>
                                        <ReactTooltip
                                            id={dateTooltipId}
                                            backgroundColor="#a855f7"
                                            place="top"
                                            effect="solid"
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Card variant - full cards with all details
    return (
        <div className="w-full space-y-2">
            {validTrainings.map((item, index) => {
                const training = item.training;
                const lecturerName = training.lecturer?.fullName || '-';
                const registrationDate = item.registrationDate
                    ? dayjs(item.registrationDate).format('DD/MM/YYYY')
                    : null;

                return (
                    <div key={index} className="bg-white dark:bg-gray-700/60 rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow duration-200">
                        {/* Training Badge */}
                        <div className="mb-3 flex justify-center">
                            <TrainingTypeBadge
                                type={training.type}
                                topic={training.topic}
                                date={training.date}
                            />
                        </div>

                        {/* Divider */}
                        <div className="mb-2.5 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>

                        {/* Details Grid */}
                        <div className="space-y-2">
                            {/* Lecturer */}
                            <div className="flex items-center gap-2.5 text-xs">
                                <div className="flex-shrink-0 p-1 rounded-md bg-blue-50 dark:bg-blue-900/20">
                                    <FiUser className="text-blue-600 dark:text-blue-400" size={13} />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 truncate font-medium">
                                    {lecturerName}
                                </span>
                            </div>

                            {/* Attendance Status */}
                            <div className="flex items-center gap-2.5 text-xs">
                                <div className={`flex-shrink-0 p-1 rounded-md ${item.attendanceConfirmed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                    {item.attendanceConfirmed ? (
                                        <FiCheckCircle className="text-green-600 dark:text-green-400" size={13} />
                                    ) : (
                                        <FiXCircle className="text-red-600 dark:text-red-400" size={13} />
                                    )}
                                </div>
                                <span className={`font-medium ${item.attendanceConfirmed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {item.attendanceConfirmed ? t("AttendanceConfirmedYes") : t("AttendanceConfirmedNo")}
                                </span>
                            </div>

                            {/* Registration Date */}
                            {registrationDate && (
                                <div className="flex items-center gap-2.5 text-xs">
                                    <div className="flex-shrink-0 p-1 rounded-md bg-purple-50 dark:bg-purple-900/20">
                                        <FiCalendar className="text-purple-600 dark:text-purple-400" size={13} />
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {t("RegisteredOnDate")}: <span className="font-medium">{registrationDate}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TrainingsLecturersTable;
