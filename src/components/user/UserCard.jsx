// src/components/user/UserCard.jsx
import { Avatar } from "@windmill/react-ui";
import React from "react";
import { t } from "i18next";

// internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import EditDeleteButton from "../table/EditDeleteButton";
import ActiveInActiveButton from "../table/ActiveInActiveButton";

const UserCard = ({ user, toggleDrawerData }) => {
    const { showDateFormat } = useUtilsFunction();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with actions */}
            <div className="flex justify-end items-start mb-3">
                <EditDeleteButton
                    id={user._id}
                    user={user}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    handleResetPassword={toggleDrawerData.handleResetPassword}
                    title={user?.name + ", " + t("warningDeleteUser")}
                    showDelete={true}
                />
            </div>

            {/* User info */}
            <div className="flex items-center gap-2.5 mb-3">
                <Avatar
                    className="bg-gray-50"
                    src={user.image || 'https://i.imgur.com/bCHF4hj.png'}
                    alt="user"
                />
                <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {user?.name}
                    </h2>
                </div>
            </div>

            {/* User details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("UserEmailTbl")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{user.email}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("UserContactTbl")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{user.phone}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("UserJoiningDateTbl")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{showDateFormat(user.joiningData)}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("UserRoleTbl")}:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.role}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("OderStatusTbl")}:</span>
                    <ActiveInActiveButton
                        id={user?._id}
                        user={user}
                        option="user"
                        status={user.status}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserCard;
