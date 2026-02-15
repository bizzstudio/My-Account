// src/components/event/QuickEventModal.jsx
import React from "react";
import { Modal, ModalBody, ModalFooter, Button } from "@windmill/react-ui";
import { t } from "i18next";

// Internal imports
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Error from "@/components/form/others/Error";

const QuickEventModal = ({
    isOpen,
    onClose,
    onSubmit,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    setValue,
    // color, // הוסר - צבעים לא בשימוש
}) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
                <h2 className="text-xl font-bold mb-4 text-start">
                    {t("AddEventTitle")}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4 text-start">
                        {/* כותרת האירוע */}
                        <div className="flex flex-col">
                            <LabelArea label={t("EventTitle")} />
                            <InputArea
                                register={register}
                                label={t("EventTitle")}
                                name="quickEventTitle"
                                type="text"
                                placeholder={t("EventTitle")}
                            />
                            <Error errorName={errors.quickEventTitle} />
                        </div>

                        {/* הוסר - שדה צבע האירוע */}
                        {/* <div className="flex flex-col">
                            <LabelArea label={t("EventColor")} />
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={color || "#ffffff"}
                                    onChange={(e) => setValue("quickEventColor", e.target.value)}
                                    className="h-10 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                                />
                            </div>
                            <Error errorName={errors.quickEventColor} />
                        </div> */}
                    </div>
                </form>
            </ModalBody>
            <ModalFooter className="justify-center gap-3">
                <Button
                    className="w-auto hover:bg-white hover:border-gray-50"
                    layout="outline"
                    onClick={onClose}
                    type="button"
                >
                    {t("CancelBtn")}
                </Button>
                <div className="flex justify-end">
                    {isSubmitting ? (
                        <Button
                            disabled={true}
                            type="button"
                            className="w-full h-12 sm:w-auto"
                        >
                            <span className="font-serif mr-0.5 font-light">
                                {t("Processing")}
                            </span>
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            className="w-full h-12 sm:w-auto"
                        >
                            {t("Add")} {t("Event")}
                        </Button>
                    )}
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default QuickEventModal;

