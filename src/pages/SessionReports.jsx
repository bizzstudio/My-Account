// src/pages/SessionReports.jsx
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
import dayjs from "dayjs";

// Internal imports
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useExport from "@/hooks/useExport";
import TableLoading from "@/components/preloader/TableLoading";
import SessionReportsTable from "@/components/sessionReport/SessionReportsTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import SessionReportServices from "@/services/SessionReportServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import SessionReportDrawer from "@/components/drawer/SessionReportDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import SearchInput from "@/components/form/input/SearchInput";
import SelectWithCheckbox from "@/components/form/SelectWithCheckbox";
import SelectReactSelect from "@/components/form/SelectReactSelect";
import CustomPagination from "@/components/ui/CustomPagination";
import ViewToggle from "@/components/ui/ViewToggle";
import CalendarView from "@/components/sessionReport/CalendarView";
import { getReportTypeColor } from "@/utils/reportTypeColors";
import { WindmillContext } from "@windmill/react-ui";

const SessionReports = () => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { mode } = useContext(WindmillContext);
    const isDarkMode = mode === "dark";

    // Initialize view from sessionStorage, default to "calendar"
    const [view, setView] = useState(() => {
        const savedView = sessionStorage.getItem('sessionReportsView');
        return savedView || "calendar";
    });

    // Function to handle view change and save to sessionStorage
    const handleViewChange = (newView) => {
        setView(newView);
        sessionStorage.setItem('sessionReportsView', newView);
    };

    const { data, loading, error } = useAsync(() =>
        SessionReportServices.getAllSessionReports()
    );

    // console.log('SessionReports :>> ', data);

    const [isCheckAll, setIsCheckAll] = useState(false);
    const [isCheck, setIsCheck] = useState([]);
    const { serviceId, handleDeleteMany, allId } = useToggleDrawer();
    const {
        toggleDrawer,
        setBreadcrumbs,
        guides,
        schools,
        subjects,
        events,
    } = useContext(SidebarContext);
    const { exportToExcel } = useExport();

    // Field configuration for Excel export
    const sessionReportFields = [
        {
            key: 'date',
            label: t('ActivityDate'),
            getValue: (report) => report.date ? dayjs(report.date).format('DD.MM.YYYY') : ''
        },
        { key: 'school.name', label: t('InstitutionName') },
        {
            key: 'class',
            label: t('ReportClass'),
            options: ["א","ב","ג","ד","ה","ו","ז","ח","ט","י","י\"א","י\"ב"],
        },
        {
            key: 'subjectOrEvent',
            label: t('ReportSubject'),
            getValue: (report) => report.subject?.title || report.event?.title || ''
        },
        {
            key: 'startTime',
            label: t('StartTime'),
            getValue: (report) => report.startTime ? dayjs(report.startTime).format('HH:mm') : ''
        },
        {
            key: 'endTime',
            label: t('EndTime'),
            getValue: (report) => report.endTime ? dayjs(report.endTime).format('HH:mm') : ''
        },
        { key: 'participantsAmount', label: t('ParticipantsAmount') },
        {
            key: 'specialEducation',
            label: t('SpecialEducation'),
            getValue: (report) => report.specialEducation ? t('Yes') : ''
        },
    ];

    useEffect(() => {
        setBreadcrumbs([
            {
                href: "/session-reports",
                label: t("SessionReports"),
            },
        ]);
    }, []);

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll);
        setIsCheck(data.map((report) => report._id));
        if (isCheckAll) {
            setIsCheck([]);
        }
    };

    // Prepare options for SelectWithCheckbox
    const guideOptions = guides?.map(guide => ({
        value: guide._id,
        label: guide.name,
        image: guide.image || null // Handle empty image
    })) || [];

    const schoolOptions = schools?.map(school => ({
        value: school._id,
        label: school.name,
        image: school.image || null // Handle empty image
    })) || [];

    // אפשרויות לפילטר לפי סוג דוח (participants)
    const participantTypeOptions = [
        { 
            value: 'חברותאים', 
            label: t("ParticipantsChavruta"),
            color: getReportTypeColor('חברותאים', !isDarkMode)
        },
        { 
            value: 'מנהל וצוות ניהול', 
            label: t("ParticipantsManagerAndTeam"),
            color: getReportTypeColor('מנהל וצוות ניהול', !isDarkMode)
        },
        { 
            value: 'השתלמות/מליאה', 
            label: t("ParticipantsTraining"),
            color: getReportTypeColor('השתלמות/מליאה', !isDarkMode)
        },
        { 
            value: 'ליווי מורים', 
            label: t("ParticipantsTeacherSupport"),
            color: getReportTypeColor('ליווי מורים', !isDarkMode)
        },
        { 
            value: 'יישומי לכיתה', 
            label: t("ParticipantsClassroomApplications"),
            color: getReportTypeColor('יישומי לכיתה', !isDarkMode)
        },
        { 
            value: 'אירועי השיא', 
            label: t("ParticipantsPeakEvents"),
            color: getReportTypeColor('אירועי השיא', !isDarkMode)
        },
        { 
            value: 'הערות ונקודות למחשבה', 
            label: t("ParticipantsNotesAndThoughts"),
            color: getReportTypeColor('הערות ונקודות למחשבה', !isDarkMode)
        },
        { 
            value: 'אחר', 
            label: t("ParticipantsOther"),
            color: getReportTypeColor('אחר', !isDarkMode)
        },
    ];

    // Manager options - only for super-admin
    const managerOptions = guides?.reduce((acc, guide) => {
        if (guide.manager && !acc.find(m => m.value === guide.manager._id)) {
            acc.push({
                value: guide.manager._id,
                label: guide.manager.name,
                image: guide.manager.image || null
            });
        }
        return acc;
    }, []) || [];

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
        setGuideFilter,
        setSchoolFilter,
        setParticipantsFilter,
        setManagerFilter,
        setIncludedInReportFilter,
        currentPage,
    } = useFilter(data, {
        additionalFilters: {
            guideFilter: (items, guideIds) => {
                if (!Array.isArray(guideIds) || guideIds.length === 0) return items;
                return items.filter(item => guideIds.includes(item.guide?._id));
            },
            schoolFilter: (items, schoolIds) => {
                if (!Array.isArray(schoolIds) || schoolIds.length === 0) return items;
                return items.filter(item => schoolIds.includes(item.school?._id));
            },
            participantsFilter: (items, participantTypes) => {
                if (!Array.isArray(participantTypes) || participantTypes.length === 0) return items;
                return items.filter(item => participantTypes.includes(item.participants));
            },
            managerFilter: (items, managerIds) => {
                if (!Array.isArray(managerIds) || managerIds.length === 0) return items;
                return items.filter(item => managerIds.includes(item.guide?.manager?._id));
            },
            includedInReportFilter: (items, filterValue) => {
                if (!filterValue || filterValue === 'All') return items;
                if (filterValue === 'included') {
                    return items.filter(item => item.school?.includedInReport === true);
                }
                if (filterValue === 'excluded') {
                    return items.filter(item => item.school?.includedInReport === false);
                }
                return items;
            },
        }
    });

    // Export function - exports selected items if any are selected, otherwise exports all
    const handleExportToExcel = () => {
        let dataToExport = serviceData;
        let filename = t('SessionReports');

        if (isCheck.length > 0) {
            // Export only selected items
            dataToExport = serviceData.filter(report => isCheck.includes(report._id));
        }

        exportToExcel(dataToExport, sessionReportFields, filename);
    };

    return (
        <div className="w-full flex flex-col lg:px-20 sm:px-4 px-5 mx-auto h-fit overflow-x-hidden">
            <PageTitle>{t("SessionReportsPageTitle")}</PageTitle>

            <MainDrawer width="540px">
                <SessionReportDrawer id={serviceId} />
            </MainDrawer>

            {isCheck?.length >= 1 && (
                <DeleteModal
                    ids={allId}
                    setIsCheck={setIsCheck}
                    title={t("theSelectedSessionReports")}
                    table="sessionReports"
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
                                                {t("AddSessionReport")}
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
                                        onClick: () => handleDeleteMany(isCheck, t("SessionReports")),
                                        disabled: isCheck.length < 1
                                    },
                                ]}
                            />

                            <SearchInput
                                ref={userRef}
                                placeholder={t("SessionReportsSearchBy")}
                                onSubmit={handleSubmitUser}
                                onReset={resetFilters}
                                name="search"
                                className="flex-grow"
                                showReset={hasActiveFilters()}
                            />

                            <ViewToggle view={view} onViewChange={handleViewChange} />

                        </div>
                    </div>

                    {/* Second Row - Filters */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${userInfo?.role === "super-admin" ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
                        {/* Guide Filter */}
                        <SelectWithCheckbox
                            placeholder={`${t("ReportGuide")} - ${t("Filter")}`}
                            options={guideOptions}
                            value={getSelectedOptions(filters.guideFilter || [], guideOptions)}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                setGuideFilter(values);
                            }}
                            images={true}
                        />

                        {/* School Filter */}
                        <SelectWithCheckbox
                            placeholder={`${t("ReportSchool")} - ${t("Filter")}`}
                            options={schoolOptions}
                            value={getSelectedOptions(filters.schoolFilter || [], schoolOptions)}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                setSchoolFilter(values);
                            }}
                            images={true}
                        />

                        {/* Participants Type Filter */}
                        <SelectWithCheckbox
                            placeholder={`${t("ReportParticipants")} - ${t("Filter")}`}
                            options={participantTypeOptions}
                            value={getSelectedOptions(filters.participantsFilter || [], participantTypeOptions)}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                setParticipantsFilter(values);
                            }}
                            images={false}
                            showColor={true}
                        />

                        {/* Manager Filter - Only for super-admin */}
                        {userInfo?.role === "super-admin" && (
                            <SelectWithCheckbox
                                placeholder={`${t("Manager")} - ${t("Filter")}`}
                                options={managerOptions}
                                value={getSelectedOptions(filters.managerFilter || [], managerOptions)}
                                onChange={(selectedOptions) => {
                                    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                    setManagerFilter(values);
                                }}
                                images={true}
                            />
                        )}

                        {/* Included in Report Filter */}
                        <SelectReactSelect
                            placeholder={t("IncludedInReportFilter")}
                            options={[
                                { value: "All", label: t("IncludedInReportAll") },
                                { value: "included", label: t("IncludedInReportOnly") },
                                { value: "excluded", label: t("IncludedInReportExcluded") }
                            ]}
                            value={filters.includedInReportFilter ?
                                { value: filters.includedInReportFilter, label: filters.includedInReportFilter === "All" ? t("IncludedInReportAll") : filters.includedInReportFilter === "included" ? t("IncludedInReportOnly") : t("IncludedInReportExcluded") } :
                                { value: "All", label: t("IncludedInReportAll") }
                            }
                            onChange={(selectedOption) => setIncludedInReportFilter(selectedOption.value)}
                            isSearchable={false}
                            images={false}
                            minWidth={200}
                        />
                    </div>
                </CardBody>
            </Card>

            {loading ? (
                <TableLoading row={12} col={userInfo?.role === "super-admin" ? 11 : 10} width={163} height={20} />
            ) : error ? (
                <span className="text-center mx-auto text-red-500">{error}</span>
            ) : serviceData?.length !== 0 ? (
                view === "calendar" ? (
                    <CalendarView reports={dataTable} />
                ) : (
                    <>
                        {/* Desktop Table Container */}
                        <TableContainer className="mb-8 rounded-b-lg hidden md:block overflow-x-auto">
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
                                        <TableCell className="text-center">{t("ReportGuide")}</TableCell>
                                        <TableCell className="text-center">{t("ReportDate")}</TableCell>
                                        <TableCell className="text-center">{t("StartTime")} / {t("EndTime")}</TableCell>
                                        <TableCell className="text-center">{t("ReportSchool")}</TableCell>
                                        <TableCell className="text-center">{t("ReportClass")}</TableCell>
                                        <TableCell className="text-center">{t("ReportSubject")}</TableCell>
                                        <TableCell className="text-center">{t("ReportDescription")}</TableCell>
                                        <TableCell className="text-center">{t("ReportParticipants")}</TableCell>
                                        <TableCell className="text-center">{t("ParticipantsAmount")}</TableCell>
                                        {userInfo?.role === "super-admin" && (
                                            <TableCell className="text-center">{t("Manager")}</TableCell>
                                        )}
                                    </tr>
                                </TableHeader>

                                <SessionReportsTable
                                    reports={dataTable}
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
                            <SessionReportsTable
                                reports={dataTable}
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
                )
            ) : (
                <NotFound title={t("noSessionReportFound")} />
            )}
        </div>
    );
};

export default SessionReports;