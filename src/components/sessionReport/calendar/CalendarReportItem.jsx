// src/components/sessionReport/calendar/CalendarReportItem.jsx
import React, { useContext, useRef } from "react";
import dayjs from "dayjs";
import { WindmillContext } from "@windmill/react-ui";
import { SidebarContext } from "@/context/SidebarContext";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import { getReportTypeColor, hslToRgba } from "@/utils/reportTypeColors";

const CalendarReportItem = ({ report, isRTL }) => {
    const { toggleDrawer } = useContext(SidebarContext);
    const { handleUpdate } = useToggleDrawer();
    const { mode } = useContext(WindmillContext);
    const isDarkMode = mode === "dark";
    const containerRef = useRef(null);

    const startTime = dayjs(report.startTime).format("HH:mm");
    const endTime = dayjs(report.endTime).format("HH:mm");

    const handleClick = () => {
        handleUpdate(report._id);
    };

    // קבלת צבע לפי participants
    const participantColor = report.participants 
        ? getReportTypeColor(report.participants, !isDarkMode) 
        : null;
    
    // Handlers ל-hover על כל הפריט
    const handleMouseEnter = () => {
        if (participantColor && containerRef.current) {
            const nameSpans = containerRef.current.querySelectorAll('.guide-name');
            nameSpans.forEach(span => {
                span.style.color = participantColor;
            });
        }
    };
    
    const handleMouseLeave = () => {
        if (containerRef.current) {
            const nameSpans = containerRef.current.querySelectorAll('.guide-name');
            nameSpans.forEach(span => {
                span.style.color = '';
            });
        }
    };
    
    const getBackgroundStyle = () => {
        if (participantColor) {
            const rgba = hslToRgba(participantColor, 0.2);
            if (rgba) {
                return {
                    backgroundColor: rgba,
                };
            }
        }
        return {};
    };

    const getBorderStyle = () => {
        if (participantColor) {
            return {
                borderColor: participantColor,
            };
        }
        return {};
    };

    const hasParticipantColor = !!participantColor;
    
    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`group cursor-pointer p-1 rounded-sm ${
                hasParticipantColor 
                    ? 'border' 
                    : 'bg-mainColor/5 hover:bg-mainColor/10 dark:bg-mainColor/10 dark:hover:bg-mainColor/20 border border-mainColor/20 hover:border-mainColor/40'
            } transition-all duration-200 hover:shadow-sm hover:scale-[1.02] text-left`}
            style={hasParticipantColor ? { 
                ...getBackgroundStyle(), 
                ...getBorderStyle()
            } : {}}
        >
            {/* Single line layout */}
            <div className="flex items-center gap-1 text-[9px] sm:text-xs min-w-0">
                {/* On mobile (xl and below), show only guide name */}
                <div className="xl:hidden w-full">
                    <span className="guide-name font-semibold text-gray-900 dark:text-gray-100 truncate transition-colors block text-center">
                        {report.guide?.name}
                    </span>
                </div>
                
                {/* On desktop (xl and above), show full info */}
                <div className="hidden xl:flex items-center gap-1 min-w-0 w-full">
                    {/* Time */}
                    <div className="flex items-center gap-0.5 font-medium text-gray-700 dark:text-gray-300 flex-shrink-0" dir="ltr">
                        <span>{startTime}</span>
                        <span className="text-gray-500">-</span>
                        <span>{endTime}</span>
                    </div>
                    
                    {/* Separator */}
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    
                    {/* Guide name */}
                    <span className="guide-name font-semibold text-gray-900 dark:text-gray-100 truncate transition-colors min-w-0">
                        {report.guide?.name}
                    </span>
                    
                    {/* Class badge */}
                    {report.class && (
                        <span className="inline-block text-[8px] px-1 py-0.5 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                            {report.class}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarReportItem;

