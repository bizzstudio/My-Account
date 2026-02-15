// src/pages/Lecturers.jsx
import {
    Card,
    CardBody,
    Table,
    TableCell,
    TableContainer,
    TableFooter,
    TableHeader,
} from "@windmill/react-ui";
import React, { useContext, useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiDownload } from "react-icons/fi";
import { t } from "i18next";
import { Select } from "@windmill/react-ui";

// Internal imports
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useExport from "@/hooks/useExport";
import TableLoading from "@/components/preloader/TableLoading";
import LecturersTable from "@/components/lecturer/LecturersTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import LecturerServices from "@/services/LecturerServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import LecturerDrawer from "@/components/drawer/LecturerDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import SearchInput from "@/components/form/input/SearchInput";
import CustomPagination from "@/components/ui/CustomPagination";
import SelectWithCheckbox from "@/components/form/SelectWithCheckbox";

const Lecturers = () => {
    const { data, loading, error } = useAsync(() =>
        LecturerServices.getAllLecturers()
    );
    // console.log('Lecturers data :>> ', data);

    const [isCheckAll, setIsCheckAll] = useState(false);
    const [isCheck, setIsCheck] = useState([]);
    const { serviceId, handleDeleteMany, allId } = useToggleDrawer();
    const { toggleDrawer, setBreadcrumbs, setLecturers } = useContext(SidebarContext);
    const { exportToExcel } = useExport();

    // Field configuration for Excel export
    const lecturerFields = [
        { key: 'fullName', label: t('LecturerName') },
        { key: 'phone', label: t('LecturerPhone') },
        { key: 'idNumber', label: t('LecturerIdNumber') },
        { key: 'email', label: t('Email') },
        { key: 'bankAccount.bankName', label: t('BankName') },
        { key: 'bankAccount.branchNumber', label: t('BranchNumber') },
        { key: 'bankAccount.accountNumber', label: t('AccountNumber') },
        { key: 'topics', label: t('Topics') },
        { key: 'taxStatus', label: t('TaxStatus') },
        { key: 'status', label: t('Status') },
        { key: 'createdAt', label: t('CreationDate') },
    ];

    useEffect(() => {
        setBreadcrumbs([
            {
                href: "/lecturers",
                label: t("Lecturers"),
            },
        ]);
    }, []);

    // עדכון רשימת המרצים ב-context
    useEffect(() => {
        if (data) {
            setLecturers(data);
        }
    }, [data, setLecturers]);

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll);
        setIsCheck(data.map((lecturer) => lecturer._id));
        if (isCheckAll) {
            setIsCheck([]);
        }
    };

    // איסוף כל הנושאים הייחודיים מהמרצים
    const allTopics = React.useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const topicsSet = new Set();
        data.forEach(lecturer => {
            if (Array.isArray(lecturer.topics)) {
                lecturer.topics.forEach(topic => topicsSet.add(topic));
            }
        });
        return Array.from(topicsSet).sort().map(topic => ({
            value: topic,
            label: topic
        }));
    }, [data]);

    // Helper function to get selected options from IDs
    const getSelectedOptions = (selectedValues, allOptions) => {
        if (!Array.isArray(selectedValues) || selectedValues.length === 0) return [];
        return allOptions.filter(option => selectedValues.includes(option.value));
    };

    const {
        userRef,
        totalResults,
        resultsPerPage,
        dataTable,
        serviceData,
        handleChangePage,
        handleSubmitUser,
        currentPage,
        filters,
        setTopicsFilter,
        setStatus,
        setTaxStatus,
        hasActiveFilters,
        resetFilters,
    } = useFilter(data, {
        additionalFilters: {
            topicsFilter: (items, topicValues) => {
                if (!Array.isArray(topicValues) || topicValues.length === 0) return items;
                return items.filter(item => {
                    if (!Array.isArray(item.topics)) return false;
                    return topicValues.some(topic => item.topics.includes(topic));
                });
            },
            taxStatus: (items, taxStatusValue) => {
                if (!taxStatusValue || taxStatusValue === 'All' || taxStatusValue === '') return items;
                return items.filter(item => item.taxStatus === taxStatusValue);
            },
        }
    });

    // Reset field functionality
    const handleResetField = () => {
        userRef.current.value = "";
    };

    // Export function - exports selected items if any are selected, otherwise exports all
    const handleExportToExcel = () => {
        let dataToExport = serviceData;
        let filename = t('Lecturers');

        if (isCheck.length > 0) {
            // Export only selected items
            dataToExport = serviceData.filter(lecturer => isCheck.includes(lecturer._id));
        }

        exportToExcel(dataToExport, lecturerFields, filename);
    };

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <PageTitle>{t("LecturersPageTitle")}</PageTitle>

            <MainDrawer width="540px">
                <LecturerDrawer id={serviceId} />
            </MainDrawer>

            {isCheck?.length >= 1 && (
                <DeleteModal
                    ids={allId}
                    setIsCheck={setIsCheck}
                    title={t("theSelectedLecturers")}
                    table="lecturers"
                />
            )}

            <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
                <CardBody>
                    {/* Row 1: Menu + Search (always together) + Filters (up to md) */}
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-2 items-center w-full mb-2">
                        <div className="flex gap-2 items-center 2xl:col-span-1">
                            <DropdownMenu
                                options={[
                                    {
                                        label: (
                                            <div className="flex items-center gap-1">
                                                <FiPlus size={20} className="mb-[1px]" />
                                                {t("AddLecturer")}
                                            </div>
                                        ),
                                        onClick: toggleDrawer
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center gap-1.5">
                                                <FiDownload size={17} />
                                                {isCheck.length > 0 ? t("ExportSelected") : t("ExportToExcel")}
                                            </div>
                                        ),
                                        onClick: handleExportToExcel,
                                        disabled: !serviceData || serviceData.length === 0
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center gap-1.5">
                                                <FiTrash2 size={17} />
                                                {t("Delete")}
                                            </div>
                                        ),
                                        onClick: () => handleDeleteMany(isCheck, t("Lecturers")),
                                        disabled: isCheck.length < 1
                                    },
                                ]}
                            />
                            <SearchInput
                                ref={userRef}
                                placeholder={t("LecturersSearchBy")}
                                onSubmit={handleSubmitUser}
                                onReset={hasActiveFilters() ? resetFilters : handleResetField}
                                name="search"
                                className="flex-grow min-w-0"
                                showReset={hasActiveFilters()}
                            />
                        </div>
                        
                        {/* Filters visible up to md in same row */}
                        <div className="md:grid md:grid-cols-3 gap-2 col-span-1">
                            <div className="min-w-0">
                                <SelectWithCheckbox
                                    placeholder={`${t("Topics")} - ${t("Filter")}`}
                                    options={allTopics}
                                    value={getSelectedOptions(filters.topicsFilter || [], allTopics)}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                        setTopicsFilter(values);
                                    }}
                                    images={false}
                                />
                            </div>
                            <div className="min-w-0 mt-2 md:mt-0">
                                <Select
                                    value={filters.status || "All"}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full"
                                >
                                    <option value="All">{t("AllStatuses")}</option>
                                    <option value="active">{t("Active")}</option>
                                    <option value="inactive">{t("Inactive")}</option>
                                </Select>
                            </div>
                            <div className="min-w-0 mt-2 md:mt-0">
                                <Select
                                    value={filters.taxStatus || "All"}
                                    onChange={(e) => setTaxStatus(e.target.value)}
                                    className="w-full"
                                >
                                    <option value="All">{t("AllTaxStatuses")}</option>
                                    <option value="exempt">{t("TaxExempt")}</option>
                                    <option value="authorized">{t("TaxAuthorized")}</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {loading ? (
                <TableLoading row={12} col={8} width={163} height={20} />
            ) : error ? (
                <span className="text-center mx-auto text-red-500">{error}</span>
            ) : serviceData?.length !== 0 ? (
                <>
                    {/* Desktop Table Container */}
                    <TableContainer className="mb-8 rounded-b-lg hidden md:block">
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableCell className="text-center">
                                        <CheckBox
                                            type="checkbox"
                                            name="selectAll"
                                            id="selectAll"
                                            isChecked={isCheckAll}
                                            handleClick={handleSelectAll}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">{t("Actions")}</TableCell>
                                    <TableCell className="text-center">{t("LecturerName")}</TableCell>
                                    <TableCell className="text-center">{t("LecturerPhone")}</TableCell>
                                    <TableCell className="text-center">{t("LecturerIdNumber")}</TableCell>
                                    <TableCell className="text-center">{t("Email")}</TableCell>
                                    <TableCell className="text-center">{t("TaxStatus")}</TableCell>
                                    <TableCell className="text-center">{t("Topics")}</TableCell>
                                    <TableCell className="text-center">{t("TrainingsCount")}</TableCell>
                                    <TableCell className="text-center">{t("Status")}</TableCell>
                                    <TableCell className="text-center">{t("CreationDate")}</TableCell>
                                </tr>
                            </TableHeader>

                            <LecturersTable
                                lecturers={dataTable}
                                isCheck={isCheck}
                                setIsCheck={setIsCheck}
                                isMobile={false}
                            />
                        </Table>
                        <TableFooter>
                            <CustomPagination
                                totalResults={totalResults}
                                resultsPerPage={resultsPerPage}
                                onChange={handleChangePage}
                                label={t("Table navigation")}
                                currentPage={currentPage}
                            />
                        </TableFooter>
                    </TableContainer>

                    {/* Mobile Card Container */}
                    <div className="block md:hidden mb-1">
                        <LecturersTable
                            lecturers={dataTable}
                            isCheck={isCheck}
                            setIsCheck={setIsCheck}
                            isMobile={true}
                        />
                        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <CustomPagination
                                totalResults={totalResults}
                                resultsPerPage={resultsPerPage}
                                onChange={handleChangePage}
                                label={t("Table navigation")}
                                currentPage={currentPage}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <NotFound title={t("noLecturerFound")} />
            )}
        </div>
    );
};

export default Lecturers;

