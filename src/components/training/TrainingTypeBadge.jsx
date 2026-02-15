// src/components/training/TrainingTypeBadge.jsx
import React from "react";
import { t } from "i18next";
import dayjs from "dayjs";
import { HiUsers } from "react-icons/hi";
import { HiMiniComputerDesktop } from "react-icons/hi2";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";

const TrainingTypeBadge = ({ type, topic, date }) => {
    // הגדרת תצורה לכל סוג הדרכה
    const getTypeConfig = (trainingType) => {
        switch (trainingType) {
            case "info-meeting":
                return {
                    icon: HiUsers,
                    bgColor: "bg-blue-100 dark:bg-blue-900/30",
                    textColor: "text-blue-700 dark:text-blue-300",
                    iconColor: "text-blue-600 dark:text-blue-400",
                    label: t("InfoMeeting")
                };
            case "guardian-training":
                return {
                    icon: HiMiniComputerDesktop,
                    bgColor: "bg-purple-100 dark:bg-purple-900/30",
                    textColor: "text-purple-700 dark:text-purple-300",
                    iconColor: "text-purple-600 dark:text-purple-400",
                    label: t("GuardianTraining")
                };
            case "exposure-lecture":
                return {
                    icon: LiaChalkboardTeacherSolid,
                    bgColor: "bg-orange-100 dark:bg-orange-900/30",
                    textColor: "text-orange-700 dark:text-orange-300",
                    iconColor: "text-orange-600 dark:text-orange-400",
                    label: t("ExposureLecture")
                };
            default:
                return {
                    icon: null,
                    bgColor: "bg-gray-100 dark:bg-gray-800",
                    textColor: "text-gray-700 dark:text-gray-300",
                    iconColor: "text-gray-600 dark:text-gray-400",
                    label: type ? t(type) : "-"
                };
        }
    };

    const config = getTypeConfig(type);
    const IconComponent = config.icon;

    // בניית התווית עם הנושא אם קיים (רק אם זה לא פגישת מידע)
    let displayLabel = topic && type !== "info-meeting"
        ? `${config.label} - ${topic}`
        : config.label;

    // הוספת תאריך בסוגריים אם קיים
    if (date) {
        const formattedDate = dayjs(date).format('DD/MM/YYYY • HH:mm');
        displayLabel = `${displayLabel} (${formattedDate})`;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {IconComponent && (
                <IconComponent className={`${config.iconColor} text-sm`} />
            )}
            <span>{displayLabel}</span>
        </span>
    );
};

export default TrainingTypeBadge;