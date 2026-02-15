// src/hooks/useRegistrantSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { t } from "i18next";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import RegistrantServices from "@/services/RegistrantServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const useRegistrantSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, fetchTrainings } = useContext(SidebarContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        clearErrors,
        reset,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            'guardian-training': "",
            'info-meeting': "",
            'exposure-lecture': ""
        }
    });

    const guardianTraining = watch('guardian-training');
    const infoMeeting = watch('info-meeting');
    const exposureLecture = watch('exposure-lecture');

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            // בניית מערך ההדרכות
            const trainingsArray = [];
            if (data['guardian-training']) {
                trainingsArray.push({
                    training: data['guardian-training'],
                    attendanceConfirmed: false
                });
            }
            if (data['info-meeting']) {
                trainingsArray.push({
                    training: data['info-meeting'],
                    attendanceConfirmed: false
                });
            }
            if (data['exposure-lecture']) {
                trainingsArray.push({
                    training: data['exposure-lecture'],
                    attendanceConfirmed: false
                });
            }

            // ולידציה - לפחות הדרכה אחת
            if (trainingsArray.length === 0) {
                setError("trainings", { type: "required", message: t("AtLeastOneTrainingRequired") });
                setIsSubmitting(false);
                return;
            }

            const registrantData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                mobilePhone: data.mobilePhone,
                relationshipToGuardian: data.relationshipToGuardian,
                decisionMakerFirstName: data.decisionMakerFirstName || undefined,
                decisionMakerLastName: data.decisionMakerLastName || undefined,
                decisionMakerEmail: data.decisionMakerEmail || undefined,
                decisionMakerPhone: data.decisionMakerPhone || undefined,
                decisionSupporterFirstName: data.decisionSupporterFirstName || undefined,
                decisionSupporterLastName: data.decisionSupporterLastName || undefined,
                decisionSupporterEmail: data.decisionSupporterEmail || undefined,
                decisionSupporterPhone: data.decisionSupporterPhone || undefined,
                notes: data.notes || undefined,
                trainings: trainingsArray,
            };

            if (id) {
                const res = await RegistrantServices.updateRegistrant(id, registrantData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await RegistrantServices.addRegistrant(registrantData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            }
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    const getRegistrantData = async () => {
        try {
            const res = await RegistrantServices.getRegistrantById(id);
            if (res) {
                setValue("firstName", res.firstName);
                setValue("lastName", res.lastName);
                setValue("email", res.email);
                setValue("mobilePhone", res.mobilePhone);
                setValue("relationshipToGuardian", res.relationshipToGuardian);
                setValue("decisionMakerFirstName", res.decisionMakerFirstName || "");
                setValue("decisionMakerLastName", res.decisionMakerLastName || "");
                setValue("decisionMakerEmail", res.decisionMakerEmail || "");
                setValue("decisionMakerPhone", res.decisionMakerPhone || "");
                setValue("decisionSupporterFirstName", res.decisionSupporterFirstName || "");
                setValue("decisionSupporterLastName", res.decisionSupporterLastName || "");
                setValue("decisionSupporterEmail", res.decisionSupporterEmail || "");
                setValue("decisionSupporterPhone", res.decisionSupporterPhone || "");
                setValue("notes", res.notes || "");

                // טעינת ההדרכות
                setValue('guardian-training', "");
                setValue('info-meeting', "");
                setValue('exposure-lecture', "");

                if (res.trainings && Array.isArray(res.trainings)) {
                    res.trainings.forEach(t => {
                        if (t.training && t.training.type) {
                            setValue(t.training.type, t.training._id);
                        }
                    });
                }
            }
        } catch (err) {
            notifyApiResponse(err, false);
        }
    };

    useEffect(() => {
        if (!isDrawerOpen) {
            clearErrors();
            reset();
            return;
        }
        if (id) {
            getRegistrantData();
        }
        // טעינת הדרכות בפתיחת הדרואר
        fetchTrainings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setValue, isDrawerOpen, clearErrors, reset]);

    // יצירת אובייקט selectedTrainings מ-watch
    const selectedTrainingsObj = {
        'guardian-training': guardianTraining || "",
        'info-meeting': infoMeeting || "",
        'exposure-lecture': exposureLecture || ""
    };

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        selectedTrainings: selectedTrainingsObj,
        setValue,
        clearErrors,
    };
};

export default useRegistrantSubmit;