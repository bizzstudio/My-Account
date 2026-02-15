// src/components/registrant/RegistrantCard.jsx
import React from "react";
import { t } from "i18next";

// Internal import
import EditDeleteButton from "../table/EditDeleteButton";
import CheckBox from "../form/others/CheckBox";
import TrainingsLecturersTable from "./TrainingsLecturersTable";

const RegistrantCard = ({ registrant, isCheck, handleClick, toggleDrawerData }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            {/* Header with checkbox and actions */}
            <div className="flex justify-between items-start mb-3">
                <CheckBox
                    type="checkbox"
                    name={registrant?._id}
                    id={registrant?._id}
                    handleClick={handleClick}
                    isChecked={isCheck?.includes(registrant?._id)}
                />
                <EditDeleteButton
                    id={registrant._id}
                    registrant={registrant}
                    isSubmitting={toggleDrawerData.isSubmitting}
                    handleUpdate={toggleDrawerData.handleUpdate}
                    handleModalOpen={toggleDrawerData.handleModalOpen}
                    title={`${registrant?.firstName} ${registrant?.lastName}`}
                />
            </div>

            {/* Registrant info */}
            <div className="flex items-center gap-2.5 mb-3">
                <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {registrant?.firstName} {registrant?.lastName}
                    </h2>
                </div>
            </div>

            {/* Registrant details */}
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Email")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{registrant?.email}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("MobilePhone")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{registrant?.mobilePhone}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("RelationshipToGuardian")}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{registrant?.relationshipToGuardian || "-"}</span>
                </div>

                <div className="flex flex-col gap-2 py-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("Trainings")}:</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                        <TrainingsLecturersTable trainings={registrant?.trainings} variant="card" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrantCard;

