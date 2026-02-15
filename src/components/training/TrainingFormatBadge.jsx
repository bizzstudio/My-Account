// src/components/training/TrainingFormatBadge.jsx
import React from "react";
import { t } from "i18next";
import { RiGlobalLine } from "react-icons/ri";
import { FaHandshakeSimple } from "react-icons/fa6";

const TrainingFormatBadge = ({ isFrontal }) => {
    // הגדרת תצורה לכל פורמט הדרכה
    const getFormatConfig = (isFrontalTraining) => {
        if (isFrontalTraining) {
            return {
                icon: FaHandshakeSimple,
                bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
                textColor: "text-yellow-700 dark:text-yellow-300",
                iconColor: "text-yellow-600 dark:text-yellow-400",
                label: t("IsFrontal")
            };
        } else {
            return {
                icon: RiGlobalLine,
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-700 dark:text-green-300",
                iconColor: "text-green-600 dark:text-green-400",
                label: t("OnlineTraining")
            };
        }
    };

    const config = getFormatConfig(isFrontal);
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {IconComponent && (
                <IconComponent className={`${config.iconColor} text-sm`} />
            )}
            <span>{config.label}</span>
        </span>
    );
};

export default TrainingFormatBadge;