// src/components/sessionReport/CalendarView.jsx
import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/he";
import "dayjs/locale/en";
import { useTranslation } from "react-i18next";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarGrid from "./calendar/CalendarGrid";

const CalendarView = ({ reports }) => {
    const { i18n } = useTranslation();
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // Set dayjs locale based on current language
    const currentLocale = i18n.language === "he" ? "he" : "en";
    dayjs.locale(currentLocale);

    // Group reports by date
    const reportsByDate = useMemo(() => {
        const grouped = {};

        reports?.forEach(report => {
            const dateKey = dayjs(report.date).format("YYYY-MM-DD");
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(report);
        });

        return grouped;
    }, [reports]);

    const handlePreviousMonth = () => {
        setCurrentMonth(currentMonth.subtract(1, "month"));
    };

    const handleNextMonth = () => {
        setCurrentMonth(currentMonth.add(1, "month"));
    };

    const handleToday = () => {
        setCurrentMonth(dayjs());
    };

    return (
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <CalendarHeader
                currentMonth={currentMonth}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
                onToday={handleToday}
            />
            <CalendarGrid
                currentMonth={currentMonth}
                reportsByDate={reportsByDate}
            />
        </div>
    );
};

export default CalendarView;

