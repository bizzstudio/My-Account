// src/components/user/UserTable.jsx
import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React from "react";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ActiveInActiveButton from "@/components/table/ActiveInActiveButton";
import UserCard from "./UserCard";
import { t } from "i18next";

const UserTable = ({ users, lang, isCheck, setIsCheck, isMobile = false }) => {
  const {
    title,
    serviceId,
    handleModalOpen,
    handleUpdate,
    isSubmitting,
    handleResetPassword,
  } = useToggleDrawer();

  const { showDateFormat } = useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  const toggleDrawerData = {
    handleModalOpen,
    handleUpdate,
    isSubmitting,
    handleResetPassword,
  };

  return (
    <>
      <DeleteModal id={serviceId} title={title} />

      {isMobile ? (
        // Mobile Card View
        <div>
          {users?.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              handleClick={handleClick}
              toggleDrawerData={toggleDrawerData}
            />
          ))}
        </div>
      ) : (
        // Desktop Table View
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="text-center">
                <EditDeleteButton
                  id={user._id}
                  user={user}
                  isSubmitting={isSubmitting}
                  handleUpdate={handleUpdate}
                  handleModalOpen={handleModalOpen}
                  handleResetPassword={handleResetPassword}
                  title={user?.name}
                  showDelete={import.meta.env.VITE_APP_ENVIRONMENT === 'development'}
                />
              </TableCell>

              <TableCell className="flex items-center justify-center text-center">
                <Avatar
                  className="hidden ml-3 md:block bg-gray-50"
                  src={user.image || 'https://i.imgur.com/bCHF4hj.png'}
                  alt="user"
                />
              </TableCell>

              <TableCell className="text-center">
                <h2 className="text-sm font-medium text-center">
                  {user?.name}
                </h2>
              </TableCell>

              <TableCell className="text-center">
                <span className="text-sm">{user.email}</span>{" "}
              </TableCell>

              <TableCell className="text-center">
                <span className="text-sm ">{user.phone}</span>
              </TableCell>

              <TableCell className="text-center">
                <span className="text-sm">
                  {/* {dayjs(user.joiningData).format("DD/MM/YYYY")} */}
                  {showDateFormat(user.joiningData)}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <span className="text-sm font-semibold">{t(user?.role)}</span>
              </TableCell>

              <TableCell className="text-center">
                <ActiveInActiveButton
                  id={user?._id}
                  user={user}
                  option="user"
                  status={user.status}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      )}
    </>
  );
};

export default UserTable;