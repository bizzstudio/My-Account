// src/pages/Events.jsx
import {
    Card,
    CardBody,
    Pagination,
    Table,
    TableCell,
    TableContainer,
    TableFooter,
    TableHeader,
} from "@windmill/react-ui";
import { useContext, useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiDownload } from "react-icons/fi";
import { t } from "i18next";

// Internal imports
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useExport from "@/hooks/useExport";
import TableLoading from "@/components/preloader/TableLoading";
import EventsTable from "@/components/event/EventsTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import EventServices from "@/services/EventServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EventDrawer from "@/components/drawer/EventDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import SearchInput from "@/components/form/input/SearchInput";
import SelectWithCheckbox from "@/components/form/SelectWithCheckbox";
import CustomPagination from "@/components/ui/CustomPagination";

const Events = () => {
    const { data, loading, error } = useAsync(() =>
        EventServices.getAllEvents()
    );

    // console.log('Events :>> ', data);

    const [isCheckAll, setIsCheckAll] = useState(false);
    const [isCheck, setIsCheck] = useState([]);
    const { serviceId, handleDeleteMany, allId } = useToggleDrawer();
    const { toggleDrawer, setBreadcrumbs, setEvents, schools } = useContext(SidebarContext);
    const { exportToExcel } = useExport();

    // Field configuration for Excel export
    const eventFields = [
        { key: 'title', label: t('EventTitle') },
        { key: 'school.name', label: t('EventSchool') },
        { key: 'color', label: t('EventColor') },
        { key: 'createdAt', label: t('CreationDate') },
    ];

    useEffect(() => {
        setBreadcrumbs([
            {
                href: "/events",
                label: t("Events"),
            },
        ]);
    }, []);

    // עדכון רשימת הנושאים ב-context
    useEffect(() => {
        if (data) {
            setEvents(data);
        }
    }, [data, setEvents]);

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll);
        setIsCheck(data.map((event) => event._id));
        if (isCheckAll) {
            setIsCheck([]);
        }
    };

    // Prepare options for SelectWithCheckbox
    const schoolOptions = schools?.map(school => ({
        value: school._id,
        label: school.name,
        image: school.image || null
    })) || [];

    // Helper function to get selected options from IDs
    const getSelectedOptions = (selectedIds, allOptions) => {
        if (!Array.isArray(selectedIds) || selectedIds.length === 0) return [];
        return allOptions.filter(option => selectedIds.includes(option.value));
    };

    const {
        userRef,
        totalResults,
        resultsPerPage,
        dataTable,
        serviceData,
        handleChangePage,
        handleSubmitUser,
        hasActiveFilters,
        resetFilters,
        filters,
        setSchoolFilter,
        currentPage,
    } = useFilter(data, {
        additionalFilters: {
            schoolFilter: (items, schoolIds) => {
                if (!Array.isArray(schoolIds) || schoolIds.length === 0) return items;
                return items.filter(item => schoolIds.includes(item.school?._id));
            },
        }
    });


    // Export function - exports selected items if any are selected, otherwise exports all
    const handleExportToExcel = () => {
        let dataToExport = serviceData;
        let filename = t('Events');

        if (isCheck.length > 0) {
            // Export only selected items
            dataToExport = serviceData.filter(event => isCheck.includes(event._id));
        }

        exportToExcel(dataToExport, eventFields, filename);
    };

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <PageTitle>{t("EventsPageTitle")}</PageTitle>

            <MainDrawer width="540px">
                <EventDrawer id={serviceId} />
            </MainDrawer>

            {isCheck?.length >= 1 && (
                <DeleteModal
                    ids={allId}
                    setIsCheck={setIsCheck}
                    title={t("theSelectedEvents")}
                    table="events"
                />
            )}

            <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
                <CardBody className="flex flex-col gap-4">
                    {/* First Row - Actions and Search */}
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                        <div className="flex items-center gap-2 flex-grow">
                            <DropdownMenu
                                options={[
                                    {
                                        label: (
                                            <div className="flex items-center gap-1">
                                                <FiPlus size={20} className="mb-[1px]" />
                                                {t("AddEvent")}
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
                                        onClick: () => handleDeleteMany(isCheck, t("Events")),
                                        disabled: isCheck.length < 1
                                    },
                                ]}
                            />

                            <SearchInput
                                ref={userRef}
                                placeholder={t("EventsSearchBy")}
                                onSubmit={handleSubmitUser}
                                onReset={resetFilters}
                                name="search"
                                className="flex-grow"
                                showReset={hasActiveFilters()}
                            />

                            <div className="hidden md:block w-72">
                                {/* School Filter */}
                                <SelectWithCheckbox
                                    placeholder={`${t("EventSchool")} - ${t("Filter")}`}
                                    options={schoolOptions}
                                    value={getSelectedOptions(filters.schoolFilter || [], schoolOptions)}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                        setSchoolFilter(values);
                                    }}
                                    images={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Second Row - Filters */}
                    <div className="md:hidden">
                        {/* School Filter */}
                        <SelectWithCheckbox
                            placeholder={`${t("EventSchool")} - ${t("Filter")}`}
                            options={schoolOptions}
                            value={getSelectedOptions(filters.schoolFilter || [], schoolOptions)}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                setSchoolFilter(values);
                            }}
                            images={true}
                        />
                    </div>
                </CardBody>
            </Card>

            {loading ? (
                <TableLoading row={12} col={6} width={163} height={20} />
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
                                    <TableCell className="text-center">{t("EventTitle")}</TableCell>
                                    <TableCell className="text-center">{t("EventSchool")}</TableCell>
                                    <TableCell className="text-center">{t("EventColor")}</TableCell>
                                    <TableCell className="text-center">{t("CreationDate")}</TableCell>
                                </tr>
                            </TableHeader>

                            <EventsTable
                                events={dataTable}
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
                        <EventsTable
                            events={dataTable}
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
                <NotFound title={t("noEventFound")} />
            )}
        </div>
    );
};

export default Events;