// src/pages/Schools.jsx
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
import SchoolsTable from "@/components/school/SchoolsTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import SchoolServices from "@/services/SchoolServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import SearchInput from "@/components/form/input/SearchInput";
import SchoolDrawer from "@/components/drawer/SchoolDrawer";
import CustomPagination from "@/components/ui/CustomPagination";

const Schools = () => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;

    const { data, loading, error } = useAsync(() =>
        SchoolServices.getAllSchools()
    );

    // console.log('Schools :>> ', data);

    const [isCheckAll, setIsCheckAll] = useState(false);
    const [isCheck, setIsCheck] = useState([]);
    const { serviceId, handleDeleteMany, allId } = useToggleDrawer();
    const { toggleDrawer, setBreadcrumbs } = useContext(SidebarContext);
    const { exportToExcel } = useExport();

    // Field configuration for Excel export
    const schoolFields = [
        { key: 'name', label: t('SchoolName') },
        { key: 'symbol', label: t('SchoolSymbol') },
        { key: 'location', label: t('SchoolLocation') },
        { key: 'type', label: t('SchoolType') },
        { key: 'principal.name', label: t('SchoolPrincipal') },
        { key: 'coordinator.name', label: t('SchoolCoordinator') },
        { key: 'studentsCount', label: t('StudentsCount') },
        { key: 'teachersCount', label: t('TeachersCount') },
        { key: 'classes', label: t('SchoolClasses') },
        { key: 'includedInReport', label: t('IncludedInReport') },
        { key: 'manager.name', label: t('Manager') },
        { key: 'status', label: t('Status') },
        { key: 'notes', label: t('Notes') },
        { key: 'createdAt', label: t('CreationDate') },
    ];

    useEffect(() => {
        setBreadcrumbs([
            {
                href: "/schools",
                label: t("Schools"),
            },
        ]);
    }, []);

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll);
        setIsCheck(data.map((school) => school._id));
        if (isCheckAll) {
            setIsCheck([]);
        }
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
    } = useFilter(data);

    // Reset field functionality
    const handleResetField = () => {
        userRef.current.value = "";
    };

    // Export function - exports selected items if any are selected, otherwise exports all
    const handleExportToExcel = () => {
        let dataToExport = serviceData;
        let filename = t('Schools');
        
        if (isCheck.length > 0) {
            // Export only selected items
            dataToExport = serviceData.filter(school => isCheck.includes(school._id));
        }
        
        exportToExcel(dataToExport, schoolFields, filename);
    };

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <PageTitle>{t("SchoolsPageTitle")}</PageTitle>

            <MainDrawer width="640px">
                <SchoolDrawer id={serviceId} />
            </MainDrawer>

            {isCheck?.length >= 1 && (
                <DeleteModal
                    ids={allId}
                    setIsCheck={setIsCheck}
                    title={t("theSelectedSchools")}
                    table="schools"
                />
            )}

            <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
                <CardBody className="flex flex-col-reverse md:flex-row gap-2 md:gap-2 items-stretch md:items-center justify-between">
                    <div className="order-1 md:order-2 py-3 md:py-3 flex flex-col sm:flex-row gap-2 flex-grow w-full">
                        <div className="flex items-center flex-grow gap-2 w-full">
                            <DropdownMenu
                                options={[
                                    {
                                        label: (
                                            <div className="flex items-center gap-1">
                                                <FiPlus size={20} className="mb-[1px]" />
                                                {t("AddSchool")}
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
                                        onClick: () => handleDeleteMany(isCheck, t("Schools")),
                                        disabled: isCheck.length < 1
                                    },
                                ]}
                            />

                            <SearchInput
                                ref={userRef}
                                placeholder={t("SchoolsSearchBy")}
                                onSubmit={handleSubmitUser}
                                onReset={handleResetField}
                                name="search"
                                className="flex-grow"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {loading ? (
                <TableLoading row={12} col={userInfo?.role === "super-admin" ? 16 : 15} width={163} height={20} />
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
                                    <TableCell className="text-center">{t("SchoolImage")}</TableCell>
                                    <TableCell className="text-center">{t("SchoolName")}</TableCell>
                                    <TableCell className="text-center">{t("SchoolSymbol")}</TableCell>
                                    <TableCell className="text-center">{t("SchoolLocation")}</TableCell>
                                    <TableCell className="text-center">{t("SchoolType")}</TableCell>
                                    <TableCell className="text-center">{t("SchoolPrincipal")}</TableCell>
                                    <TableCell className="text-center">{t("SchoolCoordinator")}</TableCell>
                                    <TableCell className="text-center">{t("StudentsCount")}</TableCell>
                                    <TableCell className="text-center">{t("TeachersCount")}</TableCell>
                                    <TableCell className="text-center">{t("SchoolClasses")}</TableCell>
                                    <TableCell className="text-center">{t("IncludedInReport")}</TableCell>
                                    {userInfo?.role === "super-admin" && (
                                        <TableCell className="text-center">{t("Manager")}</TableCell>
                                    )}
                                    <TableCell className="text-center">{t("Status")}</TableCell>
                                    <TableCell className="text-center">{t("CreationDate")}</TableCell>
                                </tr>
                            </TableHeader>

                            <SchoolsTable
                                schools={dataTable}
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
                        <SchoolsTable
                            schools={dataTable}
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
                <NotFound title={t("noSchoolFound")} />
            )}
        </div>
    );
};

export default Schools;