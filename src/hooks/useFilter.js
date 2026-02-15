// src/hooks/useFilter.js
import { useRef, useState, useMemo, useCallback } from 'react';

/**
 * Generic useFilter hook for data filtering, searching, and pagination
 */
const useFilter = (data = [], options = {}) => {
    const {
        resultsPerPage = 20,
        searchFields = ['name', 'email'],
        additionalFilters = {},
    } = options;

    // Refs
    const userRef = useRef(null);
    const searchRef = useRef(null);

    // State
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({});
    const [sortConfig, setSortConfig] = useState(null);

    // Helper function to get nested object values
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Helper function to get all searchable fields from an object
    const getAllSearchableFields = (obj, prefix = '') => {
        const fields = [];
        
        for (const [key, value] of Object.entries(obj)) {
            const fieldPath = prefix ? `${prefix}.${key}` : key;
            
            // Skip certain fields that shouldn't be searched
            if (['_id', '__v', 'image', 'createdAt', 'updatedAt'].includes(key)) {
                continue;
            }
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Recursively get nested fields
                fields.push(...getAllSearchableFields(value, fieldPath));
            } else if (typeof value === 'string' || typeof value === 'number') {
                // Add searchable fields
                fields.push(fieldPath);
            }
        }
        
        return fields;
    };

    // Auto-detect common filters from data structure
    const getAutoFilters = useCallback(() => {
        if (!Array.isArray(data) || data.length === 0) return {};

        const autoFilters = {};
        const firstItem = data[0];

        // Auto-detect role filter
        if (firstItem.hasOwnProperty('role')) {
            autoFilters.role = (items, roleValue) => 
                items.filter(item => item.role?.toLowerCase() === roleValue?.toLowerCase());
        }

        // Auto-detect status filter
        if (firstItem.hasOwnProperty('status')) {
            autoFilters.status = (items, statusValue) => 
                items.filter(item => item.status?.toLowerCase() === statusValue?.toLowerCase());
        }

        // Auto-detect school type filter
        if (firstItem.hasOwnProperty('type')) {
            autoFilters.type = (items, typeValue) => 
                items.filter(item => item.type?.toLowerCase() === typeValue?.toLowerCase());
        }

        // Auto-detect isFrontal filter
        if (firstItem.hasOwnProperty('isFrontal')) {
            autoFilters.isFrontal = (items, isFrontalValue) => {
                if (isFrontalValue === 'All' || isFrontalValue === '' || !isFrontalValue) {
                    return items;
                }
                if (isFrontalValue === 'true' || isFrontalValue === true) {
                    return items.filter(item => item.isFrontal === true);
                }
                if (isFrontalValue === 'false' || isFrontalValue === false) {
                    return items.filter(item => item.isFrontal === false);
                }
                return items;
            };
        }

        // Auto-detect includedInReport filter
        if (firstItem.hasOwnProperty('includedInReport')) {
            autoFilters.includedInReport = (items, reportValue) => 
                items.filter(item => {
                    if (reportValue === 'true') return item.includedInReport === true;
                    if (reportValue === 'false') return item.includedInReport === false;
                    return true;
                });
        }

        return autoFilters;
    }, [data]);

    // Apply search filter - now searches all fields automatically
    const applySearch = (items, searchTerm) => {
        if (!searchTerm || !Array.isArray(items) || items.length === 0) return items;

        // Get all searchable fields from the first item
        const allSearchableFields = getAllSearchableFields(items[0]);
        
        // Use auto-detection if:
        // 1. searchFields is empty array (explicitly set to empty)
        // 2. searchFields is default ['name', 'email'] (meaning not customized)
        // Otherwise use the custom searchFields
        const isDefaultSearchFields = searchFields.length === 2 && searchFields[0] === 'name' && searchFields[1] === 'email';
        const fieldsToSearch = (searchFields.length === 0 || isDefaultSearchFields) ? allSearchableFields : searchFields;

        return items.filter(item => {
            return fieldsToSearch.some(field => {
                const value = getNestedValue(item, field);
                if (value === null || value === undefined) return false;
                
                return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    };

    // Apply additional filters (both auto-detected and custom)
    const applyFilters = (items) => {
        let filtered = items;
        const autoFilters = getAutoFilters();
        const allFilters = { ...autoFilters, ...additionalFilters };

        Object.entries(allFilters).forEach(([key, filterFn]) => {
            const filterValue = filters[key];
            if (filterValue && filterValue !== 'All' && filterValue !== '') {
                // Handle both single values and arrays (for multi-select)
                if (Array.isArray(filterValue)) {
                    if (filterValue.length > 0) {
                        filtered = filterFn(filtered, filterValue);
                    }
                } else {
                    filtered = filterFn(filtered, filterValue);
                }
            }
        });

        // Apply date range filter (special handling)
        if (filters.dateRangeStart || filters.dateRangeEnd) {
            if (allFilters.dateRangeFilter) {
                filtered = allFilters.dateRangeFilter(filtered, filters.dateRangeStart, filters.dateRangeEnd);
            }
        }

        // Apply duration range filter (special handling)
        if (filters.durationRange && Array.isArray(filters.durationRange) && filters.durationRange.length === 2) {
            if (allFilters.durationRangeFilter) {
                filtered = allFilters.durationRangeFilter(filtered, filters.durationRange);
            }
        }

        // Apply min registrants count filter (special handling)
        if (filters.minRegistrantsCount !== null && filters.minRegistrantsCount !== undefined && filters.minRegistrantsCount !== '') {
            if (allFilters.minRegistrantsCountFilter) {
                filtered = allFilters.minRegistrantsCountFilter(filtered, filters.minRegistrantsCount);
            }
        }

        return filtered;
    };

    // Apply sorting
    const applySorting = (items) => {
        if (!sortConfig) return items;

        return [...items].sort((a, b) => {
            const aValue = getNestedValue(a, sortConfig.key);
            const bValue = getNestedValue(b, sortConfig.key);

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            const aStr = String(aValue || '').toLowerCase();
            const bStr = String(bValue || '').toLowerCase();

            if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Main filtered data
    const serviceData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        let result = [...data];
        result = applySearch(result, filters.search);
        result = applyFilters(result);
        result = applySorting(result);

        return result;
    }, [data, filters, sortConfig, searchFields, additionalFilters, getAutoFilters]);

    // Paginated data
    const dataTable = useMemo(() => {
        const start = (currentPage - 1) * resultsPerPage;
        return serviceData.slice(start, start + resultsPerPage);
    }, [serviceData, currentPage, resultsPerPage]);

    // Functions
    const handleChangePage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleSubmitUser = useCallback((e) => {
        e.preventDefault();
        const searchValue = userRef.current?.value || '';
        setFilters(prev => ({ ...prev, search: searchValue }));
        setCurrentPage(1);
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({});
        setCurrentPage(1);
        setSortConfig(null);
        if (userRef.current) userRef.current.value = '';
        if (searchRef.current) searchRef.current.value = '';
    }, []);

    // Check if form has any active filters
    const hasActiveFilters = useCallback(() => {
        const hasSearch = filters.search && filters.search.trim() !== '';
        const hasRole = filters.role && filters.role !== 'All' && filters.role !== '';
        const hasStatus = filters.status && filters.status !== 'All' && filters.status !== '';
        const hasType = filters.type && filters.type !== 'All' && filters.type !== '';
        const hasIncludedInReport = filters.includedInReport && filters.includedInReport !== 'All';
        
        // Check for multi-select filters
        const hasGuideFilter = filters.guideFilter && Array.isArray(filters.guideFilter) && filters.guideFilter.length > 0;
        const hasSchoolFilter = filters.schoolFilter && Array.isArray(filters.schoolFilter) && filters.schoolFilter.length > 0;
        const hasParticipantsFilter = filters.participantsFilter && Array.isArray(filters.participantsFilter) && filters.participantsFilter.length > 0;
        const hasStatusFilter = filters.statusFilter && Array.isArray(filters.statusFilter) && filters.statusFilter.length > 0;
        const hasManagerFilter = filters.managerFilter && Array.isArray(filters.managerFilter) && filters.managerFilter.length > 0;
        const hasIncludedInReportFilter = filters.includedInReportFilter && filters.includedInReportFilter !== 'All';
        
        // New filters for Lecturers, Trainings, Registrants
        const hasTopicsFilter = filters.topicsFilter && Array.isArray(filters.topicsFilter) && filters.topicsFilter.length > 0;
        const hasLecturerFilter = filters.lecturerFilter && Array.isArray(filters.lecturerFilter) && filters.lecturerFilter.length > 0;
        const hasTrainingFilter = filters.trainingFilter && Array.isArray(filters.trainingFilter) && filters.trainingFilter.length > 0;
        const hasRelationshipFilter = filters.relationshipFilter && Array.isArray(filters.relationshipFilter) && filters.relationshipFilter.length > 0;
        const hasDateRangeStart = filters.dateRangeStart && filters.dateRangeStart !== '';
        const hasDateRangeEnd = filters.dateRangeEnd && filters.dateRangeEnd !== '';
        const hasMinRegistrantsCount = filters.minRegistrantsCount !== null && filters.minRegistrantsCount !== undefined && filters.minRegistrantsCount !== '';
        const hasTaxStatus = filters.taxStatus && filters.taxStatus !== 'All' && filters.taxStatus !== '';
        const hasIsFrontal = filters.isFrontal && filters.isFrontal !== 'All' && filters.isFrontal !== '';
        const hasTrainingTypeFilter = filters.trainingTypeFilter && Array.isArray(filters.trainingTypeFilter) && filters.trainingTypeFilter.length > 0;
        // Duration range is only considered active if it's different from the default range
        // We'll check this in the component itself, not here
        
        return hasSearch || hasRole || hasStatus || hasType || hasIncludedInReport || hasGuideFilter || hasSchoolFilter || hasParticipantsFilter || hasStatusFilter || hasManagerFilter || hasIncludedInReportFilter || hasTopicsFilter || hasLecturerFilter || hasTrainingFilter || hasRelationshipFilter || hasDateRangeStart || hasDateRangeEnd || hasMinRegistrantsCount || hasTaxStatus || hasIsFrontal || hasTrainingTypeFilter;
    }, [filters]);

    return {
        // Data
        dataTable,
        serviceData,
        totalResults: serviceData.length,
        resultsPerPage,
        currentPage,

        // Refs
        userRef,
        searchRef,

        // Current filter values
        filters,

        // Functions
        handleChangePage,
        handleSubmitUser,
        handleFilterChange,
        handleSort,
        resetFilters,
        hasActiveFilters,

        // Convenience functions for backward compatibility
        setRole: (value) => handleFilterChange('role', value),
        setStatus: (value) => handleFilterChange('status', value),
        setType: (value) => handleFilterChange('type', value),
        setIncludedInReport: (value) => handleFilterChange('includedInReport', value),
        
        // New convenience functions for SessionReports
        setGuideFilter: (value) => handleFilterChange('guideFilter', value),
        setSchoolFilter: (value) => handleFilterChange('schoolFilter', value),
        setParticipantsFilter: (value) => handleFilterChange('participantsFilter', value),
        setStatusFilter: (value) => handleFilterChange('statusFilter', value),
        setManagerFilter: (value) => handleFilterChange('managerFilter', value),
        setIncludedInReportFilter: (value) => handleFilterChange('includedInReportFilter', value),
        
        // New convenience functions for Lecturers, Trainings, Registrants
        setTopicsFilter: (value) => handleFilterChange('topicsFilter', value),
        setLecturerFilter: (value) => handleFilterChange('lecturerFilter', value),
        setTrainingFilter: (value) => handleFilterChange('trainingFilter', value),
        setRelationshipFilter: (value) => handleFilterChange('relationshipFilter', value),
        setDateRangeStart: (value) => handleFilterChange('dateRangeStart', value),
        setDateRangeEnd: (value) => handleFilterChange('dateRangeEnd', value),
        setDurationRange: (value) => handleFilterChange('durationRange', value),
        setMinRegistrantsCount: (value) => handleFilterChange('minRegistrantsCount', value),
        setTaxStatus: (value) => handleFilterChange('taxStatus', value),
        setIsFrontal: (value) => handleFilterChange('isFrontal', value),
        setTrainingTypeFilter: (value) => handleFilterChange('trainingTypeFilter', value),
    };
};

export default useFilter;