// src/pages/Popups.jsx
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
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Internal imports
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import TableLoading from "@/components/preloader/TableLoading";
import PopupTable from "@/components/popup/PopupTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import PopupServices from "@/services/PopupServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import PopupDrawer from "@/components/drawer/PopupDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import SearchInput from "@/components/form/input/SearchInput";
import CustomPagination from "@/components/ui/CustomPagination";

const Popups = ({ managerId = null }) => {
  const { t } = useTranslation();
  const { data, loading, error } = useAsync(() =>
    PopupServices.getAllPopups(managerId)
  );

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const { serviceId, handleDeleteMany, allId, title } = useToggleDrawer();
  const { toggleDrawer, setBreadcrumbs } = useContext(SidebarContext);

  useEffect(() => {
    setBreadcrumbs([
      {
        href: "/popups",
        label: t("PopupsPageTitle"),
      },
    ]);
  }, []);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data?.map((popup) => popup._id));
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
    userRef.current.value = ""; // Reset the search input
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("PopupsPageTitle")}</PageTitle>

      <MainDrawer width="540px">
        <PopupDrawer
          id={serviceId}
          managerId={managerId}
        />
      </MainDrawer>

      {isCheck?.length >= 1 && (
        <DeleteModal
          ids={allId}
          setIsCheck={setIsCheck}
          title={t("theSelectedPopups")}
          table="popups"
        />
      )}

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody className="flex flex-col-reverse md:flex-row gap-2 md:gap-2 items-stretch md:items-center justify-between">
          {/* Search Form - Full width on mobile */}
          <div className="order-1 md:order-2 py-3 md:py-3 flex flex-col sm:flex-row gap-2 flex-grow w-full">
            <div className="flex items-center flex-grow gap-2 w-full">
              {/* Actions Dropdown - Full width on mobile */}
              <DropdownMenu
                options={[
                  {
                    label: (
                      <div className="flex items-center gap-1">
                        <FiPlus size={20} className="mb-[1px]" />
                        {t("AddPopupsBtn")}
                      </div>
                    ),
                    onClick: toggleDrawer
                  },
                  {
                    label: (
                      <div className="flex items-center gap-1.5">
                        <FiTrash2 size={17} />
                        {t("Delete")}
                      </div>
                    ),
                    onClick: () => handleDeleteMany(isCheck, t("Selected Popups")),
                    disabled: isCheck.length < 1
                  },
                ]}
              />

              {/* Search Input Component */}
              <SearchInput
                ref={userRef}
                placeholder={t("PopupsSearchBy")}
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
                  <TableCell className="text-center">{t("PopupActions")}</TableCell>
                  <TableCell className="text-center">{t("PopupTitle")}</TableCell>
                  <TableCell className="text-center">{t("PopupSubTitle")}</TableCell>
                  <TableCell className="text-center">{t("PopupPublished")}</TableCell>
                  <TableCell className="text-center">{t("CreatedAt")}</TableCell>
                </tr>
              </TableHeader>

              <PopupTable
                popups={dataTable}
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
            <PopupTable
              popups={dataTable}
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
        <NotFound title={t("SorryPopups")} />
      )}
    </div>
  );
};

export default Popups;