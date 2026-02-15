// src/components/popup/PopupCard.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// Internal imports
import useUtilsFunction from "@/hooks/useUtilsFunction";
import CheckBox from "../form/others/CheckBox";
import EditDeleteButton from "../table/EditDeleteButton";
import ShowHideButton from "../table/ShowHideButton";

const PopupCard = ({
    popup,
    isCheck,
    setIsCheck,
    handleClick,
    toggleDrawerData
}) => {
    const { t } = useTranslation();
    const { showDateTimeFormat } = useUtilsFunction();

    return (
        <Card className="mb-4 shadow-sm bg-white dark:bg-gray-800">
            <CardBody className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <CheckBox
                            type="checkbox"
                            id={popup._id}
                            isChecked={isCheck?.includes(popup._id)}
                            handleClick={handleClick}
                        />
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                                {popup.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {popup.subTitle || t("No subtitle")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <ShowHideButton
                            id={popup._id}
                            status={popup.isActive ? "show" : "hide"}
                            table="popups"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">{t("CreatedAt")}:</span>
                        <p className="text-gray-900 dark:text-gray-100">
                            {showDateTimeFormat(popup.createdAt)}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">{t("Status")}:</span>
                        <p className={`${popup.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {popup.isActive ? t("Active") : t("Inactive")}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <EditDeleteButton
                        id={popup._id}
                        isCheck={isCheck}
                        handleUpdate={toggleDrawerData.handleUpdate}
                        handleModalOpen={toggleDrawerData.handleModalOpen}
                        title={popup.title}
                        disabled={isCheck?.length > 0}
                        isSubmitting={toggleDrawerData.isSubmitting}
                    />
                </div>
            </CardBody>
        </Card>
    );
};

export default PopupCard;