import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Modal, ModalBody, ModalFooter, Button } from "@windmill/react-ui";
import { FiTrash2 } from "react-icons/fi";

// Internal import
import WebhookServices from "@/services/WebhookServices";
import UserServices from "@/services/";
import { SidebarContext } from "@/context/SidebarContext";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import notifyApiResponse from "@/utils/notifyApiResponse";

const MainModal = ({ id, title }) => {
  const { isModalOpen, closeModal, setIsUpdate } = useContext(SidebarContext);
  const { setServiceId } = useToggleDrawer();
  const location = useLocation();

  const handleDelete = () => {
    if (location.pathname === "/webhook") {
      WebhookServices.deleteWebhook(id)
        .then((res) => {
          setIsUpdate(true);
          notifyApiResponse(res, true);
        })
        .catch((err) => notifyApiResponse(err, false));
      closeModal();
      setServiceId();
    }

    if (location.pathname === "/category") {
      CategoryServices.deleteCategory(id)
        .then((res) => {
          setIsUpdate(true);
          notifyApiResponse(res, true);
        })
        .catch((err) => notifyApiResponse(err, false));
      closeModal();
      setServiceId();
    }
    if (location.pathname === "/customers") {
      CustomerServices.deleteCustomer(id)
        .then((res) => {
          setIsUpdate(true);
          notifyApiResponse(res, true);
        })
        .catch((err) => notifyApiResponse(err, false));
      closeModal();
      setServiceId();
    }

    if (location.pathname === "/our-admin") {
      UserServices.deleteUser(id)
        .then((res) => {
          setIsUpdate(true);
          notifyApiResponse(res, true)
        })
        .catch((err) => notifyApiResponse(err, false)
        );
      closeModal();
      setServiceId();
    }
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
          <span className="flex justify-center text-3xl mb-6 text-red-500">
            <FiTrash2 />
          </span>
          <h2 className="text-xl font-medium mb-1">
            Are You Sure! Want to Delete{" "}
            <span className="text-red-500">{title}</span> Record?
          </h2>
          <p>
            Do you really want to delete these records? You can't view this in
            your list anymore if you delete!
          </p>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            className="w-auto hover:bg-white hover:border-gray-50"
            layout="outline"
            onClick={closeModal}
          >
            No, Keep It
          </Button>
          <Button onClick={handleDelete} className="w-auto">
            Yes, Delete It
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default React.memo(MainModal);
