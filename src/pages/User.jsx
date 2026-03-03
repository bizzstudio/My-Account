// src/pages/User.jsx
import {
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useEffect } from "react";
import { FiPlus, FiDownload } from "react-icons/fi";
import { t } from "i18next";

// Internal import
import useAsync from "@/hooks/useAsync";
import MainDrawer from "@/components/drawer/MainDrawer";
import UserDrawer from "@/components/drawer/UserDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import UserTable from "@/components/user/UserTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { UserContext } from "@/context/UserContext";
import { SidebarContext } from "@/context/SidebarContext";
import UserServices from "@/services/UserServices";
import { useNavigate } from "react-router-dom";
import useFilter from "@/hooks/useFilter";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import SearchInput from "@/components/form/input/SearchInput";
import CustomPagination from "@/components/ui/CustomPagination";
import useExport from "@/hooks/useExport";

const User = () => {
  const { state } = useContext(UserContext);
  const { toggleDrawer, lang, setBreadcrumbs } = useContext(SidebarContext);
  const { serviceId } = useToggleDrawer();
  const { exportToExcel } = useExport();

  const { userInfo } = state;
  const navigate = useNavigate();

  // Field configuration for Excel export
  const userFields = [
    { key: 'name', label: t('UserNameTbl') },
    { key: 'email', label: t('UserEmailTbl') },
    { key: 'phone', label: t('UserContactTbl') },
    { key: 'role', label: t('UserRoleTbl') },
    { key: 'status', label: t('OderStatusTbl') },
    { key: 'createdAt', label: t('UserJoiningDateTbl') },
  ];

  useEffect(() => {
    setBreadcrumbs([
      {
        href: "/users",
        label: t("Users"),
      },
    ]);
  }, []);

  useEffect(() => {
    if (userInfo?.role && userInfo.role !== "super-admin") {
      navigate("/products");
    }
  }, [userInfo, navigate]);

  const { data, loading, error } = useAsync(() =>
    UserServices.getAllUser({ email: userInfo.email })
  );

  // console.log('Users :>> ', data);

  const {
    userRef,
    setRole,
    totalResults,
    resultsPerPage,
    dataTable,
    serviceData,
    handleChangePage,
    handleSubmitUser,
    hasActiveFilters,
    resetFilters,
    filters, // Add this to get current filter values
    currentPage,
  } = useFilter(data);

  // Export function - exports all data (no selection for users)
  const handleExportToExcel = () => {
    exportToExcel(serviceData, userFields, t('Users'));
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("UserPageTitle")} </PageTitle>

      <MainDrawer width="540px">
        <UserDrawer id={serviceId} />
      </MainDrawer>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody className="p-4">
          {/* Responsive Layout */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
            {/* Buttons - Equal width on small screens, inline on md+ */}
            <div className="flex flex-row gap-2 items-stretch md:items-center flex-shrink-0 w-full md:w-auto">
              {/* Add User Button */}
              <Button onClick={toggleDrawer} className="flex-1 md:w-auto flex-shrink-0 min-h-12 md:h-12 py-3 md:py-0">
                <div className="flex items-center justify-center text-center gap-1">
                  <FiPlus size={20} className="mb-[1px] flex-shrink-0" />
                  <span className="ml-2 whitespace-normal md:whitespace-nowrap break-words">{t("AddUser")}</span>
                </div>
              </Button>

              {/* Export Button */}
              <Button
                onClick={handleExportToExcel}
                className="flex-1 md:w-auto flex-shrink-0 min-h-12 md:h-12 py-3 md:py-0"
                disabled={!serviceData || serviceData.length === 0}
              >
                <div className="flex items-center justify-center text-center gap-1">
                  <FiDownload size={20} className="mb-[1px] flex-shrink-0" />
                  <span className="ml-2 whitespace-normal md:whitespace-nowrap break-words">{t("ExportToExcel")}</span>
                </div>
              </Button>
            </div>

            {/* Search and Filter Row - Same row on all screens */}
            <div className="flex flex-row gap-3 w-full">
              {/* Search Input - 2/3 width */}
              <div className="flex-[2] min-w-0">
                <SearchInput
                  ref={userRef}
                  placeholder={t("UserSearchBy")}
                  onSubmit={handleSubmitUser}
                  onReset={resetFilters}
                  name="search"
                  className="w-full"
                  showReset={hasActiveFilters()}
                />
              </div>

              {/* Role Filter - 1/3 width */}
              <div className="flex-[1] flex-shrink-0">
                <Select
                  value={filters.role || "All"}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full"
                >
                  <option value="All">
                    {t("selectUserRole")}
                  </option>
                  <option value="User">{t("UserRoleUser")}</option>
                  <option value="super-admin">{t("SelectSuperAdmin")}</option>
                </Select>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        // <Loading loading={loading} />
        <TableLoading row={12} col={8} width={163} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <>
          {/* Desktop Table Container */}
          <TableContainer className="mb-8 rounded-b-lg hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell className="text-center">{t("UserActionsTbl")}</TableCell>
                  <TableCell className="text-center">{t("UserImage")}</TableCell>
                  <TableCell className="text-center">{t("UserNameTbl")}</TableCell>
                  <TableCell className="text-center">{t("UserEmailTbl")}</TableCell>
                  <TableCell className="text-center">{t("LawyerIdNumber")}</TableCell>
                  <TableCell className="text-center">{t("UserContactTbl")}</TableCell>
                  <TableCell className="text-center">{t("UserJoiningDateTbl")}</TableCell>
                  <TableCell className="text-center">{t("UserRoleTbl")}</TableCell>
                  <TableCell className="text-center">{t("OderStatusTbl")}</TableCell>
                </tr>
              </TableHeader>

              <UserTable
                users={dataTable}
                lang={lang}
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
            <UserTable
              users={dataTable}
              lang={lang}
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
        <NotFound title={t("noUserFound")} />
      )}
    </div>
  );
};

export default User;
