import React, { useContext, useState } from "react";
import { Button, ModalBody } from "@windmill/react-ui";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"; // ייבוא האייקונים
import StatusServices from "@/services/StatusService";
import { SidebarContext } from "@/context/SidebarContext";
import notifyApiResponse from "@/utils/notifyApiResponse";
import UserChallengeServices from "@/services/UserChallengeServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import Modal from "react-responsive-modal";

const EditParticipantStatus = ({ id, initialStatus, isOpen, cancel, }) => {
    const { setIsUpdate, isModalOpen, closeModal, } = useContext(SidebarContext);
    const { setServiceId } = useToggleDrawer();
    const [isLoading, setIsLoading] = useState(false);

    const handleChangeStatus = async (newStatus) => {
        if (isLoading) return; // למנוע לחיצה נוספת בזמן הבקשה

        setIsLoading(true);  // להתחיל מצב טעינה
        try {
            const res = await UserChallengeServices.updateUserChallengeStatus(id, { status: newStatus });
            setIsUpdate(true);
            notifyApiResponse(res, true);
            closeModal();
            setServiceId();
        } catch (err) {
            notifyApiResponse(err, false);
        } finally {
            setIsLoading(false);  // סיום מצב טעינה
        }
    };


    return (

        <div className="flex gap-2">
            {/* כפתור אישור */}
            <Button
                onClick={() => handleChangeStatus("active")}
                className=" text-sm"
                disabled={initialStatus === "active"}
            >
                <AiOutlineCheck />
            </Button>

            {/* כפתור דחייה */}
            <Button
                onClick={() => handleChangeStatus("inactive")}
                className="bg-red-500 text-sm"
                disabled={initialStatus === "inactive"}
            >
                <AiOutlineClose />
            </Button>
        </div>

    );
};

export default EditParticipantStatus;
