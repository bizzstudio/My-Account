// src/components/filter/DurationSliderFilter.jsx
import React from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { t } from "i18next";

const DurationSliderFilter = ({ min, max, value, onChange, label, unit = "minutes" }) => {
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) {
            return `${hours} ${t('Hours')} ${mins} ${t('Minutes')}`;
        } else if (hours > 0) {
            return `${hours} ${t('Hours')}`;
        }
        return `${mins} ${t('Minutes')}`;
    };

    return (
        <div className="w-full h-12 flex flex-col justify-between px-2">
            {/* Label במרכז למעלה */}
            {label && (
                <div className="flex justify-center items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </span>
                </div>
            )}

            {/* RC-Slider Range עם הזמנים */}
            <div className="w-full">
                <div className="px-2 mb-0.5">
                    <Slider
                        range
                        min={min}
                        max={max}
                        value={value}
                        onChange={onChange}
                        allowCross={false}
                    />
                </div>

                {/* הזמנים בקטן באפור מתחת לסליידר בקצוות */}
                <div className="flex justify-between items-center px-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(value[1])}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(value[0])}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DurationSliderFilter;

