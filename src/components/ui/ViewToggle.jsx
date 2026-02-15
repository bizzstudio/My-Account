// src/components/ui/ViewToggle.jsx
import React from "react";
import { FiList, FiCalendar } from "react-icons/fi";
import { t } from "i18next";

const ViewToggle = ({ view, onViewChange }) => {
    return (
        <div className="inline-flex h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1 shadow-sm">
            <button
                onClick={() => onViewChange("list")}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${view === "list" 
                        ? "bg-mainColor text-white shadow-sm" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                `}
                title={t("ListView")}
            >
                <FiList size={18} />
                <span className="hidden sm:inline">{t("List")}</span>
            </button>
            
            <button
                onClick={() => onViewChange("calendar")}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${view === "calendar" 
                        ? "bg-mainColor text-white shadow-sm" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                `}
                title={t("CalendarView")}
            >
                <FiCalendar size={18} />
                <span className="hidden sm:inline">{t("Calendar")}</span>
            </button>
        </div>
    );
};

export default ViewToggle;

