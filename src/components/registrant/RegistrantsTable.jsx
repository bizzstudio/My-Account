// src/components/registrant/RegistrantsTable.jsx
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React from "react";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import RegistrantCard from "./RegistrantCard";
import CheckBox from "@/components/form/others/CheckBox";
import TrainingsLecturersTable from "./TrainingsLecturersTable";
import { t } from "i18next";

const RegistrantsTable = ({ registrants, isCheck, setIsCheck, isMobile = false }) => {
    const {
        title,
        serviceId,
        handleModalOpen,
        handleUpdate,
        isSubmitting,
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
    };

    return (
        <>
            {isCheck?.length < 1 && (
                <DeleteModal id={serviceId} title={title} table="registrants" />
            )}

            {isMobile ? (
                // Mobile Card View
                <div>
                    {registrants?.map((registrant) => (
                        <RegistrantCard
                            key={registrant._id}
                            registrant={registrant}
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
                    {registrants?.map((registrant) => (
                        <TableRow key={registrant._id}>
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={registrant?._id}
                                    id={registrant?._id}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(registrant?._id)}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={registrant._id}
                                    registrant={registrant}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={handleUpdate}
                                    handleModalOpen={handleModalOpen}
                                    title={`${registrant?.firstName} ${registrant?.lastName}`}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <h2 className="text-sm font-medium text-center">
                                    {registrant?.firstName} {registrant?.lastName}
                                </h2>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{registrant?.email}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{registrant?.mobilePhone}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{registrant?.relationshipToGuardian || "-"}</span>
                            </TableCell>

                            <TableCell className="text-center align-top">
                                <TrainingsLecturersTable trainings={registrant?.trainings} variant="table" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </>
    );
};

export default RegistrantsTable;

