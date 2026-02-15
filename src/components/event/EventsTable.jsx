// src/components/event/EventsTable.jsx
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React from "react";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import EventCard from "./EventCard";
import CheckBox from "@/components/form/others/CheckBox";

const EventsTable = ({ events, isCheck, setIsCheck, isMobile = false }) => {
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
                <DeleteModal id={serviceId} title={title} table="events" />
            )}

            {isMobile ? (
                // Mobile Card View
                <div>
                    {events?.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
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
                    {events?.map((event) => (
                        <TableRow key={event._id}>
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={event?._id}
                                    id={event?._id}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(event?._id)}
                                />
                            </TableCell>
                            
                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={event._id}
                                    event={event}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={handleUpdate}
                                    handleModalOpen={handleModalOpen}
                                    title={event?.title}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <h2 className="text-sm font-medium text-center">
                                    {event?.title}
                                </h2>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {event?.school?.name || "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <div 
                                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                                        style={{ backgroundColor: event?.color || "#ffffff" }}
                                        title={event?.color}
                                    />
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {showDateFormat(event.createdAt)}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </>
    );
};

export default EventsTable;
