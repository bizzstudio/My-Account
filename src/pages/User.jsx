// src/pages/User.jsx
import {
  Button,
  Card,
  CardBody,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
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
import CustomPagination from "@/components/ui/CustomPagination";
const User = () => {
  const { state } = useContext(UserContext);
  const { toggleDrawer, lang, setBreadcrumbs } = useContext(SidebarContext);
  const { serviceId } = useToggleDrawer();

  const { userInfo } = state;
  const navigate = useNavigate();

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
    totalResults,
    resultsPerPage,
    dataTable,
    serviceData,
    handleChangePage,
    currentPage,
  } = useFilter(data);

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("UserPageTitle")} </PageTitle>

      <MainDrawer width="540px">
        <UserDrawer id={serviceId} />
      </MainDrawer>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody className="p-4">
          <div className="flex flex-row gap-2 items-center">
            <Button onClick={toggleDrawer} className="flex-shrink-0 min-h-12 md:h-12 py-3 md:py-0">
              <div className="flex items-center justify-center text-center gap-1">
                <FiPlus size={20} className="mb-[1px] flex-shrink-0" />
                <span className="ml-2 whitespace-normal md:whitespace-nowrap break-words">{t("AddUser")}</span>
              </div>
            </Button>
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
                  <TableCell className="text-center">{t("LawyerIdNumber")},</TableCell>
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
