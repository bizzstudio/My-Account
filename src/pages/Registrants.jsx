// src/pages/Registrants.jsx
import {
    Card,
    CardBody,
    Table,
    TableCell,
    TableContainer,
    TableFooter,
    TableHeader,
} from "@windmill/react-ui";
import React, { useContext, useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { FiTrash2, FiDownload, FiExternalLink } from "react-icons/fi";
import { t } from "i18next";

// Internal imports
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useExport from "@/hooks/useExport";
import TableLoading from "@/components/preloader/TableLoading";
import RegistrantsTable from "@/components/registrant/RegistrantsTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import RegistrantServices from "@/services/RegistrantServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import RegistrantDrawer from "@/components/drawer/RegistrantDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import SearchInput from "@/components/form/input/SearchInput";
import CustomPagination from "@/components/ui/CustomPagination";
import SelectWithCheckbox from "@/components/form/SelectWithCheckbox";
import DateRangeFilter from "@/components/filter/DateRangeFilter";

const Registrants = () => {
    const { data, loading, error } = useAsync(() =>
        RegistrantServices.getAllRegistrants()
    );
    // console.log('Registrants data :>> ', data);

    const [isCheckAll, setIsCheckAll] = useState(false);
    const [isCheck, setIsCheck] = useState([]);
    const { serviceId, handleDeleteMany, allId } = useToggleDrawer();
    const { setBreadcrumbs } = useContext(SidebarContext);
    const { exportToExcel } = useExport();

    // קישור לטופס הרשמה חיצוני
    const registrationFormUrl = import.meta.env.VITE_REGISTRATION_FORM_URL;

    // Field configuration for Excel export
    const registrantFields = [
        { key: 'firstName', label: t('FirstName') },
        { key: 'lastName', label: t('LastName') },
        { key: 'email', label: t('Email') },
        { key: 'mobilePhone', label: t('MobilePhone') },
        { key: 'relationshipToGuardian', label: t('RelationshipToGuardian') },
        { key: 'trainings', label: t('Trainings') },
        { key: 'decisionMakerFirstName', label: t('DecisionMakerFirstName') },
        { key: 'decisionMakerLastName', label: t('DecisionMakerLastName') },
        { key: 'decisionSupporterFirstName', label: t('DecisionSupporterFirstName') },
        { key: 'decisionSupporterLastName', label: t('DecisionSupporterLastName') },
        { key: 'notes', label: t('Notes') },
        { key: 'createdAt', label: t('RegistrationDate') },
    ];

    useEffect(() => {
        setBreadcrumbs([
            {
                href: "/registrants",
                label: t("Registrants"),
            },
        ]);
    }, []);

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll);
        setIsCheck(data.map((registrant) => registrant._id));
        if (isCheckAll) {
            setIsCheck([]);
        }
    };

    // Helper function to get training type label
    const getTrainingTypeLabel = (type) => {
        const typeMap = {
            'guardian-training': t('GuardianTraining'),
            'info-meeting': t('InfoMeeting'),
            'exposure-lecture': t('ExposureLecture')
        };
        return typeMap[type] || type;
    };

    // איסוף כל ההדרכות, הקירבות והמרצים הייחודיים (מהמבנה החדש - מערך trainings)
    const trainingOptions = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const trainingsMap = new Map();
        data.forEach(registrant => {
            if (registrant.trainings && Array.isArray(registrant.trainings)) {
                registrant.trainings.forEach(t => {
                    if (t.training && t.training._id) {
                        const training = t.training;
                        const date = dayjs(training.date).format('DD/MM/YYYY HH:mm');
                        
                        // בניית תווית - אם זה פגישת מידע רק הסוג, אחרת סוג - נושא
                        let label;
                        if (training.type === 'info-meeting') {
                            label = `${getTrainingTypeLabel(training.type)} (${date})`;
                        } else {
                            const typeLabel = getTrainingTypeLabel(training.type);
                            label = training.topic 
                                ? `${typeLabel} - ${training.topic} (${date})`
                                : `${typeLabel} (${date})`;
                        }
                        
                        trainingsMap.set(training._id, {
                            value: training._id,
                            label
                        });
                    }
                });
            }
        });
        return Array.from(trainingsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [data, t]);

    const lecturerOptions = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const lecturersMap = new Map();
        data.forEach(registrant => {
            if (registrant.trainings && Array.isArray(registrant.trainings)) {
                registrant.trainings.forEach(t => {
                    if (t.training && t.training.lecturer && t.training.lecturer._id) {
                        lecturersMap.set(t.training.lecturer._id, {
                            value: t.training.lecturer._id,
                            label: t.training.lecturer.fullName,
                            image: t.training.lecturer.image || null
                        });
                    }
                });
            }
        });
        return Array.from(lecturersMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [data]);

    const relationshipOptions = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const relationshipsSet = new Set();
        data.forEach(registrant => {
            if (registrant.relationshipToGuardian) {
                relationshipsSet.add(registrant.relationshipToGuardian);
            }
        });
        return Array.from(relationshipsSet).sort().map(rel => ({
            value: rel,
            label: rel
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
        setTrainingFilter,
        setRelationshipFilter,
        setLecturerFilter,
        setDateRangeStart,
        setDateRangeEnd,
        hasActiveFilters,
        resetFilters,
    } = useFilter(data, {
        additionalFilters: {
            trainingFilter: (items, trainingIds) => {
                if (!Array.isArray(trainingIds) || trainingIds.length === 0) return items;
                return items.filter(item => {
                    if (!item.trainings || !Array.isArray(item.trainings)) return false;
                    return item.trainings.some(t => trainingIds.includes(t.training?._id));
                });
            },
            relationshipFilter: (items, relationshipValues) => {
                if (!Array.isArray(relationshipValues) || relationshipValues.length === 0) return items;
                return items.filter(item => relationshipValues.includes(item.relationshipToGuardian));
            },
            dateRangeFilter: (items, startDate, endDate) => {
                if (!startDate && !endDate) return items;
                return items.filter(item => {
                    if (!item.trainings || !Array.isArray(item.trainings)) return false;
                    return item.trainings.some(t => {
                        if (!t.training || !t.training.date) return false;
                        const itemDate = dayjs(t.training.date);
                        if (startDate && itemDate.isBefore(dayjs(startDate), 'day')) return false;
                        if (endDate && itemDate.isAfter(dayjs(endDate), 'day')) return false;
                        return true;
                    });
                });
            },
            lecturerFilter: (items, lecturerIds) => {
                if (!Array.isArray(lecturerIds) || lecturerIds.length === 0) return items;
                return items.filter(item => {
                    if (!item.trainings || !Array.isArray(item.trainings)) return false;
                    return item.trainings.some(t => lecturerIds.includes(t.training?.lecturer?._id));
                });
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
        let filename = t('Registrants');

        if (isCheck.length > 0) {
            // Export only selected items
            dataToExport = serviceData.filter(registrant => isCheck.includes(registrant._id));
        }

        exportToExcel(dataToExport, registrantFields, filename);
    };

    // פתיחת טופס הרשמה חיצוני
    const handleOpenRegistrationForm = () => {
        if (registrationFormUrl) {
            window.open(registrationFormUrl, '_blank');
        }
    };

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <PageTitle>{t("RegistrantsPageTitle")}</PageTitle>

            <MainDrawer width="540px">
                <RegistrantDrawer id={serviceId} />
            </MainDrawer>

            {isCheck?.length >= 1 && (
                <DeleteModal
                    ids={allId}
                    setIsCheck={setIsCheck}
                    title={t("theSelectedRegistrants")}
                    table="registrants"
                />
            )}

            <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
                <CardBody>
                    {/* Row 1: Menu + Search + DateRange (always together) + Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center w-full mb-2">
                        <div className="flex gap-2 items-center xl:col-span-1 col-span-2">
                            <DropdownMenu
                                options={[
                                    ...(registrationFormUrl ? [{
                                        label: (
                                            <div className="flex items-center gap-1">
                                                <FiExternalLink size={17} className="mb-[1px]" />
                                                {t("OpenRegistrationForm")}
                                            </div>
                                        ),
                                        onClick: handleOpenRegistrationForm
                                    }] : []),
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
                                        onClick: () => handleDeleteMany(isCheck, t("Registrants")),
                                        disabled: isCheck.length < 1
                                    },
                                ]}
                            />
                            <SearchInput
                                ref={userRef}
                                placeholder={t("RegistrantsSearchBy")}
                                onSubmit={handleSubmitUser}
                                onReset={hasActiveFilters() ? resetFilters : handleResetField}
                                name="search"
                                className="flex-grow min-w-0"
                                showReset={hasActiveFilters()}
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
                        <div className="md:grid md:grid-cols-3 gap-2 col-span-2">
                            <div className="min-w-0 mt-2 md:mt-0">
                                <SelectWithCheckbox
                                    placeholder={`${t("Training")} - ${t("Filter")}`}
                                    options={trainingOptions}
                                    value={getSelectedOptions(filters.trainingFilter || [], trainingOptions)}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                        setTrainingFilter(values);
                                    }}
                                    images={false}
                                />
                            </div>
                            <div className="min-w-0 mt-2 md:mt-0">
                                <SelectWithCheckbox
                                    placeholder={`${t("RelationshipToGuardian")} - ${t("Filter")}`}
                                    options={relationshipOptions}
                                    value={getSelectedOptions(filters.relationshipFilter || [], relationshipOptions)}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                        setRelationshipFilter(values);
                                    }}
                                    images={false}
                                />
                            </div>
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
                                    <TableCell className="text-center">{t("FullName")}</TableCell>
                                    <TableCell className="text-center">{t("Email")}</TableCell>
                                    <TableCell className="text-center">{t("MobilePhone")}</TableCell>
                                    <TableCell className="text-center">{t("RelationshipToGuardian")}</TableCell>
                                    <TableCell className="text-center">{t("Trainings")}</TableCell>
                                </tr>
                            </TableHeader>

                            <RegistrantsTable
                                registrants={dataTable}
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
                        <RegistrantsTable
                            registrants={dataTable}
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
                <NotFound title={t("noRegistrantFound")} />
            )}
        </div>
    );
};

export default Registrants;

