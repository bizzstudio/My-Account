// src/pages/Trainings.jsx
import {
    Card,
    CardBody,
    Table,
    TableCell,
    TableContainer,
    TableFooter,
    TableHeader,
    Input,
    Label,
} from "@windmill/react-ui";
import React, { useContext, useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { FiPlus, FiTrash2, FiDownload } from "react-icons/fi";
import { t } from "i18next";

// Internal imports
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useExport from "@/hooks/useExport";
import TableLoading from "@/components/preloader/TableLoading";
import TrainingsTable from "@/components/training/TrainingsTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import TrainingServices from "@/services/TrainingServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import TrainingDrawer from "@/components/drawer/TrainingDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import SearchInput from "@/components/form/input/SearchInput";
import CustomPagination from "@/components/ui/CustomPagination";
import SelectWithCheckbox from "@/components/form/SelectWithCheckbox";
import { Select } from "@windmill/react-ui";
import DateRangeFilter from "@/components/filter/DateRangeFilter";
import DurationSliderFilter from "@/components/filter/DurationSliderFilter";

const Trainings = () => {
    const { data, loading, error } = useAsync(() =>
        TrainingServices.getAllTrainings()
    );
    // console.log('Trainings data :>> ', data);

    const [isCheckAll, setIsCheckAll] = useState(false);
    const [isCheck, setIsCheck] = useState([]);
    const { serviceId, handleDeleteMany, allId } = useToggleDrawer();
    const { toggleDrawer, setBreadcrumbs, setTrainings } = useContext(SidebarContext);
    const { exportToExcel } = useExport();

    // Field configuration for Excel export
    const trainingFields = [
        { key: 'type', label: t('TrainingType') },
        { key: 'date', label: t('TrainingDate') },
        { key: 'duration', label: t('TrainingDuration') },
        { key: 'lecturer.fullName', label: t('Lecturer') },
        { key: 'registrantsCount', label: t('RegistrantsCount') },
        { key: 'status', label: t('Status') },
        { key: 'createdAt', label: t('CreationDate') },
    ];

    useEffect(() => {
        setBreadcrumbs([
            {
                href: "/trainings",
                label: t("Trainings"),
            },
        ]);
    }, []);

    // עדכון רשימת ההדרכות ב-context
    useEffect(() => {
        if (data) {
            setTrainings(data);
        }
    }, [data, setTrainings]);

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll);
        setIsCheck(data.map((training) => training._id));
        if (isCheckAll) {
            setIsCheck([]);
        }
    };

    // איסוף כל המרצים והנושאים הייחודיים
    const lecturerOptions = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        const lecturersMap = new Map();

        data.forEach(training => {
            if (training.lecturer && training.lecturer.fullName) {
                // נשתמש ב-idNumber כמפתח ייחודי אם קיים, אחרת נשתמש ב-fullName+phone
                const uniqueKey = training.lecturer.idNumber ||
                    `${training.lecturer.fullName}_${training.lecturer.phone || ''}` ||
                    training.lecturer.fullName;

                // נשתמש ב-idNumber כ-value אם קיים, אחרת נשתמש ב-fullName
                const value = training.lecturer.idNumber || training.lecturer.fullName;

                lecturersMap.set(uniqueKey, {
                    value: value,
                    label: training.lecturer.fullName,
                    image: training.lecturer.image || null
                });
            }
        });

        return Array.from(lecturersMap.values()).sort((a, b) => {
            if (!a.label || !b.label) return 0;
            return a.label.localeCompare(b.label);
        });
    }, [data]);

    const topicOptions = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const topicsSet = new Set();
        data.forEach(training => {
            if (training.topic) {
                topicsSet.add(training.topic);
            }
        });
        return Array.from(topicsSet).sort().map(topic => ({
            value: topic,
            label: topic
        }));
    }, [data]);

    const trainingTypeOptions = useMemo(() => {
        return [
            { value: 'guardian-training', label: t('GuardianTrainings') },
            { value: 'info-meeting', label: t('InfoMeetings') },
            { value: 'exposure-lecture', label: t('ExposureLectures') },
        ];
    }, [t]);

    // חישוב משך מינימלי ומקסימלי
    const durationRange = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) return { min: 0, max: 480 };
        const durations = data.map(t => t.duration || 0).filter(d => d > 0);
        if (durations.length === 0) return { min: 0, max: 480 };
        return {
            min: Math.min(...durations),
            max: Math.max(...durations)
        };
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
        setLecturerFilter,
        setTopicsFilter,
        setDateRangeStart,
        setDateRangeEnd,
        setDurationRange,
        setStatus,
        setMinRegistrantsCount,
        setIsFrontal,
        setTrainingTypeFilter,
        hasActiveFilters,
        resetFilters,
    } = useFilter(data, {
        additionalFilters: {
            lecturerFilter: (items, lecturerValues) => {
                if (!Array.isArray(lecturerValues) || lecturerValues.length === 0) return items;
                return items.filter(item => {
                    if (!item.lecturer) return false;
                    // נבדוק לפי idNumber או fullName (תלוי מה יש ב-value)
                    const lecturerValue = item.lecturer.idNumber || item.lecturer.fullName;
                    return lecturerValues.includes(lecturerValue);
                });
            },
            topicsFilter: (items, topicValues) => {
                if (!Array.isArray(topicValues) || topicValues.length === 0) return items;
                return items.filter(item => topicValues.includes(item.topic));
            },
            trainingTypeFilter: (items, typeValues) => {
                if (!Array.isArray(typeValues) || typeValues.length === 0) return items;
                return items.filter(item => typeValues.includes(item.type));
            },
            dateRangeFilter: (items, startDate, endDate) => {
                if (!startDate && !endDate) return items;
                return items.filter(item => {
                    if (!item.date) return false;
                    const itemDate = dayjs(item.date);
                    if (startDate && itemDate.isBefore(dayjs(startDate), 'day')) return false;
                    if (endDate && itemDate.isAfter(dayjs(endDate), 'day')) return false;
                    return true;
                });
            },
            durationRangeFilter: (items, range) => {
                if (!Array.isArray(range) || range.length !== 2) return items;
                const [min, max] = range;
                return items.filter(item => {
                    const duration = item.duration || 0;
                    return duration >= min && duration <= max;
                });
            },
            minRegistrantsCountFilter: (items, minCount) => {
                if (minCount === null || minCount === undefined || minCount === '') return items;
                const count = parseInt(minCount, 10);
                if (isNaN(count)) return items;
                return items.filter(item => {
                    const registrantsCount = item.registrantsCount || 0;
                    return registrantsCount >= count;
                });
            },
        }
    });

    // Initialize duration range - only set if not already set
    useEffect(() => {
        if (!filters.durationRange && durationRange.max > 0) {
            // Set initial range but don't trigger filter
            // We'll only consider it active if user changes it
        }
    }, [durationRange.max]);

    // Reset field functionality
    const handleResetField = () => {
        userRef.current.value = "";
    };

    // Export function - exports selected items if any are selected, otherwise exports all
    const handleExportToExcel = () => {
        let dataToExport = serviceData;
        let filename = t('Trainings');

        if (isCheck.length > 0) {
            // Export only selected items
            dataToExport = serviceData.filter(training => isCheck.includes(training._id));
        }

        exportToExcel(dataToExport, trainingFields, filename);
    };

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <PageTitle>{t("TrainingsPageTitle")}</PageTitle>

            <MainDrawer width="540px">
                <TrainingDrawer id={serviceId} />
            </MainDrawer>

            {isCheck?.length >= 1 && (
                <DeleteModal
                    ids={allId}
                    setIsCheck={setIsCheck}
                    title={t("theSelectedTrainings")}
                    table="trainings"
                    trainings={serviceData?.filter(training => isCheck.includes(training._id)) || []}
                />
            )}

            <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
                <CardBody>
                    {/* Row 1: Menu + Search (always together) + Filters */}
                    <div className="grid grid-cols-2 gap-2 items-center w-full mb-2">
                        <div className="flex gap-2 items-center xl:col-span-1 col-span-2">
                            <DropdownMenu
                                options={[
                                    {
                                        label: (
                                            <div className="flex items-center gap-1">
                                                <FiPlus size={20} className="mb-[1px]" />
                                                {t("AddTraining")}
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
                                        onClick: () => handleDeleteMany(isCheck, t("Trainings")),
                                        disabled: isCheck.length < 1
                                    },
                                ]}
                            />
                            <SearchInput
                                ref={userRef}
                                placeholder={t("TrainingsSearchBy")}
                                onSubmit={handleSubmitUser}
                                onReset={(() => {
                                    // Check if duration range is different from default
                                    const isDurationDefault = !filters.durationRange ||
                                        (filters.durationRange &&
                                            filters.durationRange[0] === durationRange.min &&
                                            filters.durationRange[1] === durationRange.max);
                                    const hasActiveFiltersValue = hasActiveFilters() ||
                                        (filters.durationRange && !isDurationDefault);
                                    return hasActiveFiltersValue ? resetFilters : handleResetField;
                                })()}
                                name="search"
                                className="flex-grow min-w-0"
                                showReset={(() => {
                                    // Check if duration range is different from default
                                    const isDurationDefault = !filters.durationRange ||
                                        (filters.durationRange &&
                                            filters.durationRange[0] === durationRange.min &&
                                            filters.durationRange[1] === durationRange.max);
                                    return hasActiveFilters() || (filters.durationRange && !isDurationDefault);
                                })()}
                            />
                        </div>

                        <div className="min-w-0 xl:col-span-1 col-span-2">
                            <DateRangeFilter
                                startDate={filters.dateRangeStart}
                                endDate={filters.dateRangeEnd}
                                onStartDateChange={setDateRangeStart}
                                onEndDateChange={setDateRangeEnd}
                                placeholder={t("TrainingDateFilter")}
                            />
                        </div>

                        {/* DateRange + Filters */}
                        <div className="md:grid 3xl:grid-cols-7 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2 col-span-2">
                            <div className="min-w-0 mt-2 md:mt-0">
                                <SelectWithCheckbox
                                    placeholder={`${t("Lecturer")} - ${t("Filter")}`}
                                    options={lecturerOptions}
                                    value={getSelectedOptions(filters.lecturerFilter || [], lecturerOptions)}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                        setLecturerFilter(values);
                                    }}
                                    images={true}
                                />
                            </div>
                            <div className="min-w-0 mt-2 md:mt-0">
                                <SelectWithCheckbox
                                    placeholder={`${t("TrainingTopic")} - ${t("Filter")}`}
                                    options={topicOptions}
                                    value={getSelectedOptions(filters.topicsFilter || [], topicOptions)}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                        setTopicsFilter(values);
                                    }}
                                    images={false}
                                />
                            </div>
                            <div className="min-w-0 mt-2 md:mt-0">
                                <SelectWithCheckbox
                                    placeholder={t("TrainingTypeFilter")}
                                    options={trainingTypeOptions}
                                    value={getSelectedOptions(filters.trainingTypeFilter || [], trainingTypeOptions)}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                        setTrainingTypeFilter(values);
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
                                    value={filters.isFrontal || "All"}
                                    onChange={(e) => setIsFrontal(e.target.value)}
                                    className="w-full"
                                >
                                    <option value="All">{t("AllFormats")}</option>
                                    <option value="true">{t("IsFrontal")}</option>
                                    <option value="false">{t("OnlineTraining")}</option>
                                </Select>
                            </div>
                            <div className="min-w-0 mt-2 md:mt-0">
                                <Label className="flex flex-col">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={filters.minRegistrantsCount || ''}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                            setMinRegistrantsCount(value);
                                        }}
                                        placeholder={t("MinRegistrantsCountPlaceholder")}
                                    />
                                </Label>
                            </div>
                            {durationRange.max > 0 && (
                                <div className="min-w-0 mt-2 md:mt-0">
                                    <DurationSliderFilter
                                        min={durationRange.min}
                                        max={durationRange.max}
                                        value={filters.durationRange || [durationRange.min, durationRange.max]}
                                        onChange={setDurationRange}
                                        label={t("DurationFilter")}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {loading ? (
                <TableLoading row={12} col={7} width={163} height={20} />
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
                                    <TableCell className="text-center">{t("TrainingType")}</TableCell>
                                    <TableCell className="text-center">{t("TrainingFormat")}</TableCell>
                                    <TableCell className="text-center">{t("TrainingDate")}</TableCell>
                                    <TableCell className="text-center">{t("TrainingLink")}</TableCell>
                                    <TableCell className="text-center">{t("TrainingDuration")}</TableCell>
                                    <TableCell className="text-center">{t("Lecturer")}</TableCell>
                                    <TableCell className="text-center">{t("RegistrantsCount")}</TableCell>
                                    <TableCell className="text-center">{t("ConfirmedCount")}</TableCell>
                                    <TableCell className="text-center">{t("Status")}</TableCell>
                                </tr>
                            </TableHeader>

                            <TrainingsTable
                                trainings={dataTable}
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
                        <TrainingsTable
                            trainings={dataTable}
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
                <NotFound title={t("noTrainingFound")} />
            )}
        </div>
    );
};

export default Trainings;

