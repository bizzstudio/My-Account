// src/components/modal/DeleteModal.jsx
import { Button, Modal, ModalBody, ModalFooter } from "@windmill/react-ui";
import React, { useContext, useMemo } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import { t } from "i18next";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";

// Internal import
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import { SidebarContext } from "@/context/SidebarContext";
import UserServices from "@/services/UserServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import PopupServices from "@/services/PopupServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import LecturerServices from "@/services/LecturerServices";
import TrainingServices from "@/services/TrainingServices";
import RegistrantServices from "@/services/RegistrantServices";
import ProductServices from "@/services/ProductServices";
import GuideServices from "@/services/GuideServices";
import TutorialServices from "@/services/TutorialServices";
import OrderServices from "@/services/OrderServices";

const DeleteModal = ({ id, ids, setIsCheck, title, table = '', trainings = [], onSuccess }) => {
  const {
    isModalOpen,
    closeModal,
    setIsUpdate,
    title: contextTitle,
    fetchLecturers,
    fetchTrainings,
    fetchGuides,
  } = useContext(SidebarContext);
  const { setServiceId } = useToggleDrawer();

  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // בדיקה אם יש הדרכות עתידיות שנבחרו למחיקה
  const hasFutureTrainings = useMemo(() => {
    if (table !== "trainings" || !trainings || trainings.length === 0) {
      return false;
    }
    const now = new Date();
    const selectedTrainings = ids
      ? trainings.filter(t => ids.includes(t._id))
      : trainings.filter(t => t._id === id);

    return selectedTrainings.some(training => {
      if (!training.date) return false;
      const trainingDate = dayjs(training.date).toDate();
      return trainingDate >= now;
    });
  }, [table, trainings, ids, id]);

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);

      if (table === "popups") {
        if (ids) {
          const res = await PopupServices.deleteManyPopups({ ids: ids });
          setIsUpdate(true);
          notifyApiResponse(res, true);
        } else {
          const res = await PopupServices.deletePopup(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
        }
      } else if (table === "lecturers") {
        if (ids) {
          const res = await LecturerServices.deleteManyLecturers({ ids: ids });
          setIsUpdate(true);
          notifyApiResponse(res, true);
        } else {
          const res = await LecturerServices.deleteLecturer(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
        }
        fetchLecturers();
      } else if (table === "trainings") {
        if (ids) {
          const res = await TrainingServices.deleteManyTrainings({ ids: ids });
          setIsUpdate(true);
          notifyApiResponse(res, true);
        } else {
          const res = await TrainingServices.deleteTraining(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
        }
        fetchTrainings();
      } else if (table === "registrants") {
        if (ids) {
          const res = await RegistrantServices.deleteManyRegistrants({ ids: ids });
          setIsUpdate(true);
          notifyApiResponse(res, true);
        } else {
          const res = await RegistrantServices.deleteRegistrant(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
        }
      } else if (table === "products") {
        if (ids) {
          const res = await ProductServices.deleteManyProducts({ ids: ids });
          setIsUpdate(true);
          notifyApiResponse(res, true);
        } else {
          const res = await ProductServices.deleteProduct(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
        }
        if (onSuccess) onSuccess();
      } else if (table === "guides") {
        if (ids) {
          const res = await GuideServices.deleteManyGuides({ ids: ids });
          setIsUpdate(true);
          notifyApiResponse(res, true);
        } else {
          const res = await GuideServices.deleteGuide(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
        }
        fetchGuides();
      } else if (table === "tutorials") {
        if (ids) {
          const res = await TutorialServices.deleteManyTutorials({ ids: ids });
          setIsUpdate(true);
          notifyApiResponse(res, true);
        } else {
          const res = await TutorialServices.deleteTutorial(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
        }
      } else if (location.pathname === "/admins") {
        const res = await UserServices.deleteUser(id);
        setIsUpdate(true);
        notifyApiResponse(res, true);
      } else if (table === "orders") {
        if (ids) {
          const res = await OrderServices.deleteManyOrders({ ids });
          setIsUpdate(true);
          notifyApiResponse(res, true);
        } else {
          const res = await OrderServices.deleteOrder(id);
          setIsUpdate(true);
          notifyApiResponse(res, true);
        }
      }


      setServiceId();
      closeModal();
      setIsSubmitting(false);
      if (setIsCheck) setIsCheck([]);
    } catch (err) {
      console.error('err :>> ', err);
      notifyApiResponse(err, false);
      if (setIsCheck) setIsCheck([]);
      setIsSubmitting(false);
      setServiceId();
      closeModal();
    }
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
        <span className="flex justify-center text-3xl mb-6 text-mainColor">
          <FiTrash2 />
        </span>
          <h2 className="text-xl font-medium mb-2">
            {t("DeleteModalH2")} <span className="text-red-500"></span>?
          </h2>
          <p>{t("DeleteModalPtag")}</p>
          {hasFutureTrainings && (
            <p className="mt-4 text-sm text-orange-600 dark:text-orange-400 font-medium">
              {t("TrainingCancelConfirmMessage")}
            </p>
          )}
        </ModalBody>

        <ModalFooter className="justify-center gap-3">
          <Button
            className="w-auto hover:bg-white hover:border-gray-50"
            layout="outline"
            onClick={closeModal}
          >
            {t("modalKeepBtn")}
          </Button>
          <div className="flex justify-end">
            {isSubmitting ? (
              <Button
                disabled={true}
                type="button"
                className="w-full h-12 sm:w-auto"
              >
                <img
                  src={spinnerLoadingImage}
                  alt="Loading"
                  width={20}
                  height={10}
                />{" "}
                <span className="font-serif mr-0.5 font-light">
                  {t("Processing")}
                </span>
              </Button>
            ) : (
              <Button onClick={handleDelete} className="w-full h-12 sm:w-auto">
                {t("modalDeletBtn")}
              </Button>
            )}
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default React.memo(DeleteModal);
