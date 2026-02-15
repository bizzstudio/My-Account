// src/components/guide/GuidesTable.jsx
import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ActiveInActiveButton from "@/components/table/ActiveInActiveButton";
import GuideCard from "./GuideCard";
import CheckBox from "@/components/form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import { SidebarContext } from "@/context/SidebarContext";

const GuidesTable = ({ guides, isCheck, setIsCheck, isMobile = false }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { schools } = useContext(SidebarContext);

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

    // Helper function to get school names
    const getSchoolNames = (schoolIds) => {
        if (!Array.isArray(schoolIds) || schoolIds.length === 0) return "-";
        const schoolNames = schoolIds.map(id => {
            const school = schools?.find(s => s._id === id);
            return school?.name || null;
        }).filter(name => name !== null);
        return schoolNames.length > 0 ? schoolNames.join(", ") : "-";
    };

    return (
        <>
            {isCheck?.length < 1 && (
                <DeleteModal id={serviceId} title={title} table="guides" />
            )}

            {isMobile ? (
                // Mobile Card View
                <div>
                    {guides?.map((guide) => (
                        <GuideCard
                            key={guide._id}
                            guide={guide}
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
                    {guides?.map((guide) => (
                        <TableRow key={guide._id}>
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={guide?._id}
                                    id={guide?._id}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(guide?._id)}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={guide._id}
                                    guide={guide}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={handleUpdate}
                                    handleModalOpen={handleModalOpen}
                                    title={guide?.name}
                                />
                            </TableCell>

                            <TableCell className="flex items-center justify-center text-center">
                                <Avatar
                                    className="hidden ml-3 md:block bg-gray-50"
                                    src={guide.image || 'https://i.imgur.com/bCHF4hj.png'}
                                    alt="guide"
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <h2 className="text-sm font-medium text-center">
                                    {guide?.name}
                                </h2>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{guide?.email}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{guide?.phone}</span>
                            </TableCell>

                            {/* <TableCell className="text-center">
                                <span className="text-sm">{guide?.monthlyHours || 0}</span>
                            </TableCell> */}

                            <TableCell className="text-center" title={getSchoolNames(guide?.schools)}>
                                <span className="text-sm">
                                    {guide?.schools?.length > 0 ? `${guide.schools.length} ${t('Schools')}` : "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{guide?.submittedReportsCount || 0}</span>
                            </TableCell>

                            {userInfo?.role === "super-admin" && (
                                <TableCell className="text-center">
                                    <span className="text-sm">{guide?.manager?.name || "-"}</span>
                                </TableCell>
                            )}

                            <TableCell className="text-center">
                                <ActiveInActiveButton
                                    id={guide?._id}
                                    guide={guide}
                                    option="guide"
                                    status={guide.status}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {showDateFormat(guide.createdAt)}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </>
    );
};

export default GuidesTable;
