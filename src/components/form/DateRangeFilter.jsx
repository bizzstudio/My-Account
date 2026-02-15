import React, { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Input, Button } from "@windmill/react-ui";
import { FiCalendar } from "react-icons/fi";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateRangeFilter = ({ dateFrom, dateTo, onChange }) => {
    const [open, setOpen] = useState(false);

    const [tempRange, setTempRange] = useState([
        {
            startDate: dateFrom ? new Date(dateFrom) : null,
            endDate: dateTo ? new Date(dateTo) : null,
            key: "selection",
        },
    ]);

    useEffect(() => {
        setTempRange([
            {
                startDate: dateFrom ? new Date(dateFrom) : null,
                endDate: dateTo ? new Date(dateTo) : null,
                key: "selection",
            },
        ]);
    }, [dateFrom, dateTo]);

    const displayValue = useMemo(() => {
        const s = tempRange[0].startDate;
        const e = tempRange[0].endDate;
        if (!s || !e) return "";
        return `${format(s, "dd/MM/yyyy")} – ${format(e, "dd/MM/yyyy")}`;
    }, [tempRange]);

    const apply = () => {
        const { startDate, endDate } = tempRange[0];
        if (!startDate || !endDate) return;

        onChange({
            from: format(startDate, "yyyy-MM-dd"),
            to: format(endDate, "yyyy-MM-dd"),
        });
        setOpen(false);
    };

    const clear = () => {
        setTempRange([{ startDate: null, endDate: null, key: "selection" }]);
        onChange({ from: "", to: "" });
        setOpen(false);
    };

    return (
        <>
            <Input
                readOnly
                value={displayValue}
                placeholder="בחר טווח תאריכים"
                onClick={() => setOpen(true)}
                className="cursor-pointer bg-gray-50"
                iconRight={FiCalendar}
            />

            {open && (
                <div className="fixed inset-0 z-[99999]">
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                    />

                    {/* modal */}
                    <div
                        dir="rtl"
                        className="
    absolute left-1/2 top-1/2
    -translate-x-1/2 -translate-y-1/2
    w-[320px] sm:w-[360px]
    rounded-xl bg-white p-4 shadow-2xl
  "
                    >



                        <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold">בחירת טווח תאריכים</div>
                            <button
                                className="text-gray-500 hover:text-gray-800"
                                onClick={() => setOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <DateRange
                            ranges={tempRange}
                            onChange={(item) => setTempRange([item.selection])}
                            moveRangeOnFirstSelection={false}
                            editableDateInputs
                            showMonthAndYearPickers
                            months={1}
                            direction="horizontal"
                            locale={he}
                            rangeColors={['#eb8c42']}
                            startDatePlaceholder="תאריך התחלה"
                            endDatePlaceholder="תאריך סיום"
                        />

                        <div className="flex justify-between gap-2 mt-4">
                            <Button layout="outline" onClick={clear} className="border-gray-300 text-gray-600 hover:bg-gray-50">
                                ניקוי
                            </Button>

                            <div className="flex gap-2">
                                <Button layout="outline" onClick={() => setOpen(false)} className="border-gray-300 text-gray-600 hover:bg-gray-50">
                                    ביטול
                                </Button>
                                <Button onClick={apply} style={{ backgroundColor: '#eb8c42', border: 'none' }}>אישור</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DateRangeFilter;
