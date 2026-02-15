// src/components/school/SchoolsTable.jsx
import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ActiveInActiveButton from "@/components/table/ActiveInActiveButton";
import SchoolCard from "./SchoolCard";
import CheckBox from "@/components/form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import { generateClassRange, generateDetailedClassList } from "@/utils/schoolUtils";

const SchoolsTable = ({ schools, isCheck, setIsCheck, isMobile = false }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;

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
                <DeleteModal id={serviceId} title={title} table="schools" />
            )}

            {isMobile ? (
                // Mobile Card View
                <div>
                    {schools?.map((school) => (
                        <SchoolCard
                            key={school._id}
                            school={school}
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
                    {schools?.map((school) => (
                        <TableRow key={school._id}>
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={school?._id}
                                    id={school?._id}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(school?._id)}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={school._id}
                                    school={school}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={handleUpdate}
                                    handleModalOpen={handleModalOpen}
                                    title={school?.name}
                                />
                            </TableCell>

                            <TableCell className="flex items-center justify-center text-center">
                                <Avatar
                                    className="hidden ml-3 md:block bg-gray-50"
                                    src={school.image || 'https://i.imgur.com/bCHF4hj.png'}
                                    alt="school"
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <h2 className="text-sm font-medium text-center">
                                    {school?.name}
                                </h2>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{school?.symbol || "-"}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{school?.location || "-"}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{school?.type || "-"}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <div className="text-sm">
                                    <div className="font-medium">{school?.principal?.name}</div>
                                    <div className="text-gray-500">{school?.principal?.email}</div>
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <div className="text-sm">
                                    <div className="font-medium">{school?.coordinator?.name}</div>
                                    <div className="text-gray-500">{school?.coordinator?.email}</div>
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{school?.studentsCount || 0}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{school?.teachersCount || 0}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span 
                                    className="text-sm max-w-[120px] truncate" 
                                    title={generateDetailedClassList(school?.classes)}
                                >
                                    {generateClassRange(school?.classes)}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-lg">
                                    {school?.includedInReport ? "✓" : "✗"}
                                </span>
                            </TableCell>

                            {userInfo?.role === "super-admin" && (
                                <TableCell className="text-center">
                                    <span className="text-sm">{school?.manager?.name || "-"}</span>
                                </TableCell>
                            )}

                            <TableCell className="text-center">
                                <ActiveInActiveButton
                                    id={school?._id}
                                    school={school}
                                    option="school"
                                    status={school.status}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {showDateFormat(school.createdAt)}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </>
    );
};

export default SchoolsTable;