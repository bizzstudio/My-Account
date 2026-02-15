// src/components/order/OrderFilters.jsx
import React, { useContext } from "react";
import { Input } from "@windmill/react-ui";
import { t } from "i18next";
import { FiFilter } from "react-icons/fi";

import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import MultiSelectFilter from "@/components/form/selectOption/MultiSelectFilter";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import { SidebarContext } from "@/context/SidebarContext";
import DateRangeFilter from "@/components/form/DateRangeFilter";
import SearchInput from "@/components/form/input/SearchInput";

const OrderFilters = ({
  filters,
  suppliers = [],
  allAdmins = [],
  userInfo,
  onFilterChange,
}) => {
  const { statuses } = useContext(SidebarContext);

  const handleFilterChange = (setter, value) => {
    setter(value);
    if (onFilterChange) onFilterChange();
  };

  const {
    selectedSuppliers, setSelectedSuppliers,
    selectedStatuses, setSelectedStatuses,
    selectedOwner, setSelectedOwner,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    searchTerm, setSearchTerm,
    hasActiveFilters,
    resetFilters,
  } = filters;

  const handleSearch = (e) => {
    e.preventDefault();
    if (onFilterChange) onFilterChange();
  };

  const handleResetFilters = (e) => {
    e.preventDefault();
    resetFilters();
    if (onFilterChange) onFilterChange();
  };

  return (
    <CollapsibleSection title={t("Filters")} icon={<FiFilter size={20} />} defaultOpen={true}>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>

        {/* Search Filter */}
        <div>
          <LabelArea label={t("Search")} />
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("ordersSearchBy")}
            onSubmit={handleSearch}
            onReset={handleResetFilters}
            name="search"
            className="w-full"
            showReset={hasActiveFilters()}
          />
        </div>

        {/* Multiple Statuses Filter */}
        <div>
          <LabelArea label={t("Status")} />
          <MultiSelectFilter
            options={statuses || []}
            selectedValues={selectedStatuses.map(String)}
            onChange={(values) => handleFilterChange(setSelectedStatuses, values)}
            placeholder={t("SelectStatus")}
            valueKey="_id"
            labelKey="label"
          />
        </div>

        {/* Multiple Platforms/Suppliers Filter */}
        <div>
          <LabelArea label={t("Platform")} />
          <MultiSelectFilter
            options={suppliers || []}
            selectedValues={selectedSuppliers.map(String)}
            onChange={(values) => handleFilterChange(setSelectedSuppliers, values)}
            placeholder={t("SelectPlatform")}
            valueKey="_id"
            labelKey="name"
          />
        </div>

        {/* Date Range Filter */}
        <div>
          <LabelArea label={t("DateRange")} />
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={({ from, to }) => {
              handleFilterChange(setDateFrom, from);
              handleFilterChange(setDateTo, to);
            }}
          />
        </div>


        {/* Owner Filter - Only for Super Admin */}
        {userInfo?.role === "super-admin" && (
          <div>
            <LabelArea label={t("Owner")} />
            <SelectWithOptions
              options={allAdmins.map(admin => ({
                _id: admin._id,
                name: `${admin.name} (${admin.email})`,
              }))}
              value={selectedOwner ?? ""}
              onChange={(value) => handleFilterChange(setSelectedOwner, value)}
              placeholder={t("All")}
              valueKey="_id"
              labelKey="name"
              hideEmptyOption={false}
            />
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default OrderFilters;
