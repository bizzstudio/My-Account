// src/pages/Tutorials.jsx
import { useContext, useEffect } from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { t } from "i18next";

import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import TutorialServices from "@/services/TutorialServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import TutorialDrawer from "@/components/drawer/TutorialDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import SearchInput from "@/components/form/input/SearchInput";
import CustomPagination from "@/components/ui/CustomPagination";
import TutorialCard from "@/components/tutorial/TutorialCard";

const Tutorials = () => {
    const { data, loading, error } = useAsync(() => TutorialServices.getAllTutorials());

    const { serviceId, handleDeleteMany, allId, handleUpdate, handleModalOpen } = useToggleDrawer();
    const { toggleDrawer, setBreadcrumbs, isUpdate, setIsUpdate } = useContext(SidebarContext);

    useEffect(() => {
        setBreadcrumbs([{ href: "/tutorials", label: t("Tutorials") }]);
    }, []);

    const {
        userRef,
        totalResults,
        resultsPerPage,
        dataTable,
        serviceData,
        handleChangePage,
        handleSubmitUser,
        currentPage,
    } = useFilter(data, { searchFields: ["title", "description"] });

    const handleResetField = () => {
        userRef.current.value = "";
    };

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <PageTitle>{t("TutorialsPageTitle")}</PageTitle>

            <MainDrawer width="540px">
                <TutorialDrawer id={serviceId} />
            </MainDrawer>

            <DeleteModal
                id={serviceId}
                title={t("theSelectedTutorial")}
                table="tutorials"
            />

            {/* סרגל כלים */}
            <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
                <CardBody className="flex flex-col-reverse md:flex-row gap-2 items-stretch md:items-center justify-between">
                    <div className="order-1 md:order-2 py-3 md:py-3 flex flex-col sm:flex-row gap-2 flex-grow w-full">
                        <div className="flex items-center flex-grow gap-2 w-full">
                            <DropdownMenu
                                options={[
                                    {
                                        label: (
                                            <div className="flex items-center gap-1">
                                                <FiPlus size={20} className="mb-[1px]" />
                                                {t("AddTutorial")}
                                            </div>
                                        ),
                                        onClick: toggleDrawer,
                                    },
                                ]}
                            />

                            <SearchInput
                                ref={userRef}
                                placeholder={t("TutorialsSearchBy")}
                                onSubmit={handleSubmitUser}
                                onReset={handleResetField}
                                name="search"
                                className="flex-grow"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* תוכן */}
            {loading ? (
                <TableLoading row={6} col={1} width={300} height={200} />
            ) : error ? (
                <span className="text-center mx-auto text-red-500">{error}</span>
            ) : serviceData?.length !== 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                        {dataTable?.map((tutorial) => (
                            <TutorialCard
                                key={tutorial._id}
                                tutorial={tutorial}
                                handleUpdate={handleUpdate}
                                handleModalOpen={handleModalOpen}
                            />
                        ))}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
                        <CustomPagination
                            totalResults={totalResults}
                            resultsPerPage={resultsPerPage}
                            onChange={handleChangePage}
                            label={t("Table navigation")}
                            currentPage={currentPage}
                        />
                    </div>
                </>
            ) : (
                <NotFound title={t("noTutorialsFound")} />
            )}
        </div>
    );
};

export default Tutorials;
