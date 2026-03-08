// src/components/product/ProductFilters.jsx
import React, { useState, useEffect } from "react";
import { t } from "i18next";
import { FiFilter } from "react-icons/fi";

import CollapsibleSection from "@/components/common/CollapsibleSection";

const ProductFilters = ({
    filters,
    allAdmins = [],
    userInfo,
    onFilterChange,
}) => {
    const [inputValue, setInputValue] = useState(filters.searchTerm || "");

    useEffect(() => {
        setInputValue(filters.searchTerm || "");
    }, [filters.searchTerm]);

    const handleApplyFilter = () => {
        filters.setSearchTerm(inputValue.trim());
        if (onFilterChange) onFilterChange();
    };

    const handleClearSearch = () => {
        setInputValue("");
        filters.setSearchTerm("");
        if (onFilterChange) onFilterChange();
    };

    const hasSearch = !!(filters.searchTerm && filters.searchTerm.trim());

    return (
        <CollapsibleSection
            title={t("Filters")}
            icon={<FiFilter size={20} className="mt-1" />}
            defaultOpen={true}
        >
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("Search")}
                    </label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
                        placeholder={t("ProductsFreeSearchPlaceholder")}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#a57d45]"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleApplyFilter}
                        className="px-4 py-2 bg-[#a57d45] hover:bg-[#8a6535] text-white rounded-lg text-sm font-medium transition"
                    >
                        {t("FilterButton")}
                    </button>
                    {hasSearch && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            {t("ClearSearch")}
                        </button>
                    )}
                </div>
            </div>
        </CollapsibleSection>
    );
};

export default ProductFilters;
