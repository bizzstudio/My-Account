// src/hooks/useOrderFilter.js
import { useState, useCallback, useMemo } from "react";

const useOrderFilter = (statuses = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");

  const hasActiveFilters = useCallback(() => {
    return !!(
      searchTerm ||
      selectedStatuses.length > 0 ||
      selectedSuppliers.length > 0 ||
      selectedOwner ||
      dateFrom ||
      dateTo
    );
  }, [searchTerm, selectedStatuses, selectedSuppliers, selectedOwner, dateFrom, dateTo]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSuppliers([]);
    setSelectedStatuses([]);
    setSelectedOwner("");
    setDateFrom("");
    setDateTo("");
  }, []);

  const buildParams = useCallback((currentPage, resultsPerPage, userInfo) => {
    const params = {
      page: currentPage,
      limit: resultsPerPage,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
    
    // Multiple statuses - send as comma-separated IDs
    if (selectedStatuses.length > 0) {
      params.status = selectedStatuses.join(",");
    }
    
    // Multiple suppliers - send as comma-separated IDs
    if (selectedSuppliers.length > 0) {
      params.supplier = selectedSuppliers.join(",");
    }
    
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    // Only super-admin can explicitly filter by owner
    if (selectedOwner && userInfo?.role === "super-admin") {
      params.ownerId = selectedOwner;
    }

    // Backend automatically filters by owner for non super-admin users
    // Do NOT send ownerId for regular admins - backend handles this automatically
    return params;
  }, [searchTerm, selectedStatuses, selectedSuppliers, selectedOwner, dateFrom, dateTo]);

  return useMemo(() => ({
    searchTerm, setSearchTerm,
    selectedStatuses, setSelectedStatuses,
    selectedSuppliers, setSelectedSuppliers,
    selectedOwner, setSelectedOwner,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    hasActiveFilters,
    resetFilters,
    buildParams,
  }), [
    searchTerm, selectedStatuses, selectedSuppliers, selectedOwner, dateFrom, dateTo, hasActiveFilters, resetFilters, buildParams
  ]);
};

export default useOrderFilter;
