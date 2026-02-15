// src/components/form/selectOption/MultiSelectFilter.jsx
import React from "react";
import { Select } from "@windmill/react-ui";
import { FiX } from "react-icons/fi";
import { t } from "i18next";

/**
 * Multi-select filter component with badge display
 * Shows selected items as orange badges with remove button
 */
const MultiSelectFilter = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = t("All"),
  valueKey = "_id",
  labelKey = "name",
  className = "",
  disabled = false,
}) => {
  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value && !selectedValues.includes(value)) {
      onChange([...selectedValues, value]);
    }
    // Reset select to empty after selection
    e.target.value = "";
  };

  const handleRemove = (valueToRemove) => {
    onChange(selectedValues.filter(v => v !== valueToRemove));
  };

  const getOptionLabel = (value) => {
    const option = options.find(opt => String(opt[valueKey]) === String(value));
    return option ? option[labelKey] : value;
  };

  // Filter out already selected options from dropdown
  const availableOptions = options.filter(
    opt => !selectedValues.includes(String(opt[valueKey]))
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Dropdown for selecting items */}
      <Select
        value=""
        onChange={handleSelectChange}
        disabled={disabled}
        className="w-full"
      >
        <option value="">{placeholder}</option>
        {availableOptions.map((option) => (
          <option
            key={option[valueKey]}
            value={option[valueKey]}
          >
            {option[labelKey]}
          </option>
        ))}
      </Select>

      {/* Display selected items as badges */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((value) => (
            <div
              key={value}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-mainColor text-white text-sm font-medium transition-all duration-200 hover:bg-mainColor-dark"
            >
              <span>{getOptionLabel(value)}</span>
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors duration-200"
                aria-label={`${t("Remove")} ${getOptionLabel(value)}`}
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilter;
