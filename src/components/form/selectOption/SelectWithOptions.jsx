// src/components/form/selectOption/SelectWithOptions.jsx
import React, { forwardRef } from "react";
import { Select } from "@windmill/react-ui";

const SelectWithOptions = forwardRef(({
    options = [],
    value,
    onChange,
    placeholder,
    valueKey = "_id",
    labelKey = "name",
    multiple = false,
    disabled = false,
    className = "",
    hideEmptyOption = false,
    borderColor,
    ...props
}, ref) => {
    const handleChange = (e) => {
        if (multiple) {
            const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
            onChange(selectedValues);
        } else {
            const newValue = e.target.value;
            // החזרת ערך ריק (null) במקום string ריק
            // אם הערך הוא מספר, המרה למספר (כדי לתמוך ב-0 כערך תקין)
            if (newValue === "") {
                onChange(null);
            } else if (!isNaN(newValue) && newValue !== "") {
                onChange(Number(newValue));
            } else {
                onChange(newValue);
            }
        }
    };

    // עבור multiple select, value צריך להיות מערך
    // עבור single select, value צריך להיות string או number
    // שימוש ב-!= null כדי לאפשר 0 כערך תקין
    const selectedValue = multiple 
        ? (Array.isArray(value) ? value : []) 
        : (value != null ? value : "");

    return (
        <Select
            ref={ref}
            value={selectedValue}
            onChange={handleChange}
            multiple={multiple}
            disabled={disabled}
            className={className}
            style={borderColor ? { borderColor } : {}}
            {...props}
        >
            {!multiple && !hideEmptyOption && (
                <option value="">
                    {placeholder}
                </option>
            )}
            {options?.map((option) => (
                <option
                    key={option[valueKey]}
                    value={option[valueKey]}
                >
                    {option[labelKey]}
                </option>
            ))}
        </Select>
    );
});

SelectWithOptions.displayName = "SelectWithOptions";

export default SelectWithOptions;