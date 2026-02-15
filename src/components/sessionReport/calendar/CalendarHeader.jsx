// src/components/sessionReport/calendar/CalendarHeader.jsx
import React from "react";
import { t } from "i18next";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const CalendarHeader = ({ currentMonth, onPreviousMonth, onNextMonth, onToday }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === "he";

    // Format month and year based on locale
    const monthYear = currentMonth.format("MMMM YYYY");

    // Check if current month is today's month
    const isCurrentMonth = currentMonth.isSame(dayjs(), 'month');

    return (
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-e from-mainColor/8 to-mainColor/12 dark:from-mainColor/12 dark:to-mainColor/20 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
                <button
                    onClick={onPreviousMonth}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-mainColor/10 dark:hover:bg-mainColor/20 transition-all duration-200 hover:scale-105"
                    title={t("PreviousMonth")}
                >
                    <FiChevronRight size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                    onClick={onNextMonth}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-mainColor/10 dark:hover:bg-mainColor/20 transition-all duration-200 hover:scale-105"
                    title={t("NextMonth")}
                >
                    <FiChevronLeft size={18} className="sm:w-5 sm:h-5" />
                </button>
            </div>

            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {monthYear}
            </h2>

            {!isCurrentMonth && (
                <button
                    onClick={onToday}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-mainColor text-white hover:bg-mainColor/90 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md hover:scale-105"
                >
                    {t("Today")}
                </button>
            )}
            {isCurrentMonth && <div className="w-16 sm:w-20" />}
        </div>
    );
};

export default CalendarHeader;

