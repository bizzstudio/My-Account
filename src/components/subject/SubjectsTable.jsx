// src/components/subject/SubjectsTable.jsx
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React from "react";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import SubjectCard from "./SubjectCard";
import CheckBox from "@/components/form/others/CheckBox";

const SubjectsTable = ({ subjects, isCheck, setIsCheck, isMobile = false }) => {
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
                <DeleteModal id={serviceId} title={title} table="subjects" />
            )}

            {isMobile ? (
                // Mobile Card View
                <div>
                    {subjects?.map((subject) => (
                        <SubjectCard
                            key={subject._id}
                            subject={subject}
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
                    {subjects?.map((subject) => (
                        <TableRow key={subject._id}>
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={subject?._id}
                                    id={subject?._id}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(subject?._id)}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={subject._id}
                                    subject={subject}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={handleUpdate}
                                    handleModalOpen={handleModalOpen}
                                    title={subject?.title}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <h2 className="text-sm font-medium text-center">
                                    {subject?.title}
                                </h2>
                            </TableCell>

                            <TableCell className="text-center min-w-[80px] max-w-[170px] truncate text-gray-500 dark:text-gray-400" title={subject?.description}>
                                <span className="text-sm">
                                    {subject?.description || "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {showDateFormat(subject.createdAt)}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </>
    );
};

export default SubjectsTable;
