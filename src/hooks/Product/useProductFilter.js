// src/hooks/useProductFilter.js
import { useState, useCallback, useMemo } from "react";

const useProductFilter = () => {
    // Search - חיפוש מרכזי בכל השדות הטקסטואליים
    const [searchTerm, setSearchTerm] = useState("");

    // Basic Filters
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedOwner, setSelectedOwner] = useState("");

    // Shipping Filters
    const [filterCargoType, setFilterCargoType] = useState("");
    const [filterAutoShipment, setFilterAutoShipment] = useState(null);
    const [filterIsWarehouse, setFilterIsWarehouse] = useState(null);

    // Range Filters
    const [stockMin, setStockMin] = useState("");
    const [stockMax, setStockMax] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");

    // Sort — ברירת מחדל: שם לווה
    const [sortBy, setSortBy] = useState("borrowerName");
    const [sortOrder, setSortOrder] = useState("asc");

    // Check if any filters are active
    const hasActiveFilters = useCallback(() => {
        return !!(
            searchTerm ||
            selectedStatus ||
            selectedOwner ||
            filterCargoType ||
            filterAutoShipment !== null ||
            filterIsWarehouse !== null ||
            stockMin ||
            stockMax ||
            priceMin ||
            priceMax ||
            sortBy !== "borrowerName" ||
            sortOrder !== "asc"
        );
    }, [
        searchTerm, selectedStatus, selectedOwner,
        filterCargoType, filterAutoShipment, filterIsWarehouse,
        stockMin, stockMax,
        priceMin, priceMax,
        sortBy, sortOrder
    ]);

    // Reset all filters
    const resetFilters = useCallback(() => {
        setSearchTerm("");
        setSelectedStatus("");
        setSelectedOwner("");
        setFilterCargoType("");
        setFilterAutoShipment(null);
        setFilterIsWarehouse(null);
        setStockMin("");
        setStockMax("");
        setPriceMin("");
        setPriceMax("");
        setSortBy("borrowerName");
        setSortOrder("asc");
    }, []);

    // Build params object for API call
    const buildParams = useCallback((currentPage, resultsPerPage, userInfo) => {
        const params = {
            page: currentPage,
            limit: resultsPerPage,
        };

        // Search - חיפוש מרכזי בכל השדות הטקסטואליים
        if (searchTerm && searchTerm.trim()) {
            params.search = searchTerm.trim();
        }

        // Basic Filters
        if (selectedStatus) {
            if (['active', 'inactive'].includes(selectedStatus)) {
                params.status = selectedStatus;
            }
        }
        // Only super-admin can explicitly filter by owner
        if (selectedOwner && userInfo?.role === "super-admin") {
            params.ownerId = selectedOwner;
        }

        // Backend automatically filters by owner for non super-admin users
        // Do NOT send ownerId for regular admins - backend handles this automatically

        // Shipping Filters
        if (filterCargoType && ['199', '150', '155', '0'].includes(String(filterCargoType))) {
            params.cargoType = filterCargoType;
        }
        if (filterAutoShipment !== null) {
            params.autoShipment = filterAutoShipment === true || filterAutoShipment === 'true';
        }
        if (filterIsWarehouse !== null) {
            params.isWarehouse = filterIsWarehouse === true || filterIsWarehouse === 'true';
        }

        // Range Filters
        if (stockMin !== undefined && stockMin !== "") {
            params.stockMin = Number(stockMin);
        }
        if (stockMax !== undefined && stockMax !== "") {
            params.stockMax = Number(stockMax);
        }
        if (priceMin !== undefined && priceMin !== "") {
            params.priceMin = Number(priceMin);
        }
        if (priceMax !== undefined && priceMax !== "") {
            params.priceMax = Number(priceMax);
        }

        // Sort
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;

        return params;
    }, [
        searchTerm, selectedStatus, selectedOwner,
        filterCargoType, filterAutoShipment, filterIsWarehouse,
        stockMin, stockMax,
        priceMin, priceMax,
        sortBy, sortOrder
    ]);

    // Memoize the return object to prevent unnecessary re-renders
    // Functions are stable (useCallback), so we only memoize based on state values
    return useMemo(() => ({
        // State
        searchTerm,
        setSearchTerm,
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
        // Functions (stable via useCallback)
        hasActiveFilters,
        resetFilters,
        buildParams,
    }), [
        // Only include state values, not functions (they're stable via useCallback)
        searchTerm,
        selectedStatus,
        selectedOwner,
        filterCargoType,
        filterAutoShipment,
        filterIsWarehouse,
        stockMin,
        stockMax,
        priceMin,
        priceMax,
        sortBy,
        sortOrder,
    ]);
};

export default useProductFilter;