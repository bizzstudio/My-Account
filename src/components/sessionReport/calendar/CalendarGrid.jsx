// src/components/sessionReport/calendar/CalendarGrid.jsx
import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import CalendarDay from "./CalendarDay";

const CalendarGrid = ({ currentMonth, reportsByDate }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === "he";

    // Get week days based on locale
    const weekDays = useMemo(() => {
        const days = [];
        const startOfWeek = dayjs().startOf('week');

        for (let i = 0; i < 7; i++) {
            days.push(startOfWeek.add(i, 'day').format('ddd'));
        }

        return isRTL ? days : days;
    }, [isRTL]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const startOfMonth = currentMonth.startOf('month');
        const endOfMonth = currentMonth.endOf('month');
        const startDate = startOfMonth.startOf('week');
        const endDate = endOfMonth.endOf('week');

        const days = [];
        let currentDate = startDate;

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            days.push(currentDate);
            currentDate = currentDate.add(1, 'day');
        }

        return days;
    }, [currentMonth]);

    // Group days into weeks
    const weeks = useMemo(() => {
        const weeksArray = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            weeksArray.push(calendarDays.slice(i, i + 7));
        }
        return weeksArray;
    }, [calendarDays]);

    return (
        <div className="flex flex-col">
            {/* Week days header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-e from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 border-s border-gray-200 dark:border-gray-700 last:border-e border-e-0"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div>
                {weeks.map((week, weekIndex) => (
                    <div
                        key={weekIndex}
                        className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        style={{ minHeight: '108px' }}
                    >
                        {week.map((day, dayIndex) => {
                            const dateKey = day.format("YYYY-MM-DD");
                            const dayReports = reportsByDate[dateKey] || [];
                            const isCurrentMonth = day.month() === currentMonth.month();
                            const isToday = day.isSame(dayjs(), 'day');

                            return (
                                <CalendarDay
                                    key={dayIndex}
                                    day={day}
                                    reports={dayReports}
                                    isCurrentMonth={isCurrentMonth}
                                    isToday={isToday}
                                    isRTL={isRTL}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarGrid;

