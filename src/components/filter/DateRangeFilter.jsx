// src/components/filter/DateRangeFilter.jsx
import React from "react";
import { Input } from "@windmill/react-ui";
import { t } from "i18next";

const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, placeholder = "" }) => {
    return (
        <div className="flex items-center gap-2 w-full">
            <Input
                type="date"
                value={startDate || ""}
                onChange={(e) => onStartDateChange(e.target.value)}
                placeholder={placeholder || t("FromDate")}
                className="flex-1"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t("To")}</span>
            <Input
                type="date"
                value={endDate || ""}
                onChange={(e) => onEndDateChange(e.target.value)}
                placeholder={placeholder || t("ToDate")}
                className="flex-1"
            />
        </div>
    );
};

export default DateRangeFilter;

