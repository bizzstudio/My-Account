// src/components/sessionReport/calendar/CalendarDay.jsx
import React, { useState, useEffect, useRef } from "react";
import CalendarReportItem from "./CalendarReportItem";
import { t } from "i18next";

const CalendarDay = ({ day, reports, isCurrentMonth, isToday, isRTL }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({});
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const dayNumber = day.format("D");
    const hasMultipleReports = reports.length > 1;
    const firstReport = reports[0];
    const remainingReports = reports.slice(1);

    // Calculate dropdown position to avoid going off screen
    const calculateDropdownPosition = () => {
        if (!buttonRef.current) return {};

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Default dropdown dimensions (approximate)
        const dropdownWidth = 200;
        const dropdownHeight = Math.min(remainingReports.length * 40, 192); // max-h-48 = 192px
        
        let position = {
            top: '100%',
            left: '0',
            right: 'auto',
            bottom: 'auto',
            transform: 'none'
        };

        // Check if dropdown would go off the right edge
        if (buttonRect.left + dropdownWidth > viewportWidth) {
            position.left = 'auto';
            position.right = '0';
        }

        // Check if dropdown would go off the bottom edge
        if (buttonRect.bottom + dropdownHeight > viewportHeight) {
            position.top = 'auto';
            position.bottom = '100%';
        }

        // Check if dropdown would go off the left edge (when right-aligned)
        if (buttonRect.right - dropdownWidth < 0) {
            position.left = '0';
            position.right = 'auto';
        }

        return position;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showDropdown]);

    // Update dropdown position when it opens
    useEffect(() => {
        if (showDropdown) {
            const position = calculateDropdownPosition();
            setDropdownPosition(position);
        }
    }, [showDropdown, remainingReports.length]);

    return (
        <div
            className={`
                border-s border-gray-200 dark:border-gray-700 first:border-s-0 last:border-e border-e-0 p-1.5 sm:p-2
                ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-800'}
                ${isToday ? 'ring-2 ring-mainColor ring-inset' : ''}
            `}
        >
            {/* Day number */}
            <div className="flex items-center justify-between flex-wrap mb-1 sm:mb-2">
                <span
                    className={`
                        text-xs sm:text-sm font-semibold inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-200
                        ${isToday
                            ? 'bg-mainColor text-white shadow-md scale-105'
                            : isCurrentMonth
                                ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                                : 'text-gray-400 dark:text-gray-600'
                        }
                    `}
                >
                    {dayNumber}
                </span>
                {reports.length > 0 && (
                    <span className="text-[9px] sm:text-xs whitespace-nowrap font-medium text-mainColor bg-mainColor/15 px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                        {reports.length === 1 ? t("Report") : `${reports.length} ${t("Reports")}`}
                    </span>
                )}
            </div>

            {/* Reports list */}
            <div className="relative" ref={dropdownRef}>
                {/* First report or single report */}
                {firstReport && (
                    <CalendarReportItem key={firstReport._id} report={firstReport} isRTL={isRTL} />
                )}

                {/* More reports button */}
                {hasMultipleReports && (
                    <button
                        ref={buttonRef}
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-full text-[9px] sm:text-xs text-mainColor hover:text-mainColor/80 font-medium py-0.5 px-1 rounded bg-mainColor/5 hover:bg-mainColor/10 transition-colors mt-0.5"
                    >
                        {remainingReports.length}+ {t("Reports")}
                    </button>
                )}

                {/* Dropdown for additional reports */}
                {showDropdown && hasMultipleReports && (
                    <div 
                        className="absolute z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-[100px]"
                        style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            right: dropdownPosition.right,
                            bottom: dropdownPosition.bottom,
                            transform: dropdownPosition.transform
                        }}
                    >
                        {remainingReports.map((report) => (
                            <div key={report._id} className="p-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                <CalendarReportItem report={report} isRTL={isRTL} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarDay;

