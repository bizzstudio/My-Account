// src/components/product/ProductFilters.jsx
import React from "react";
import { t } from "i18next";
import { FiFilter } from "react-icons/fi";

// Internal imports
import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const ProductFilters = ({
    filters,
    allAdmins = [],
    userInfo,
    onFilterChange,
}) => {
    // מיון לפי: שם לווה, שם עורך דין, שם יועץ
    const sortByOptions = [
        { _id: "borrowerName", name: t("BorrowerName") },
        { _id: "lawyerName", name: t("LawyerName") },
        { _id: "consultant", name: t("Consultant") },
    ];

    const sortOrderOptions = [
        { _id: "desc", name: t("Descending") },
        { _id: "asc", name: t("Ascending") },
    ];

    const handleFilterChange = (setter, value) => {
        setter(value);
        if (onFilterChange) {
            onFilterChange();
        }
    };

    // Destructure filters for easier access
    const {
        selectedStatus,
        setSelectedStatus,
        selectedOwner,
        setSelectedOwner,
        filterCargoType,
        setFilterCargoType,
        filterAutoShipment,
        setFilterAutoShipment,
        filterIsWarehouse,
        setFilterIsWarehouse,
        stockMin,
        setStockMin,
        stockMax,
        setStockMax,
        priceMin,
        setPriceMin,
        priceMax,
        setPriceMax,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
    } = filters;

    return (
        <CollapsibleSection
            title={t("Filters")}
            icon={<FiFilter size={20} className="mt-1" />}
            defaultOpen={false}
        >
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {/* מיון לפי */}
                <div>
                    <LabelArea label={t("SortBy")} />
                    <SelectWithOptions
                        options={sortByOptions}
                        value={sortBy}
                        onChange={(value) => handleFilterChange(setSortBy, value)}
                        placeholder={t("SelectSortBy")}
                        valueKey="_id"
                        labelKey="name"
                    />
                </div>

                <div>
                    <LabelArea label={t("SortOrder")} />
                    <SelectWithOptions
                        options={sortOrderOptions}
                        value={sortOrder}
                        onChange={(value) => handleFilterChange(setSortOrder, value)}
                        placeholder={t("SelectSortOrder")}
                        valueKey="_id"
                        labelKey="name"
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
};

export default ProductFilters;