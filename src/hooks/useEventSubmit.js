// src/hooks/useEventSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import EventServices from "@/services/EventServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { t } from "i18next";

const useEventSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, fetchEvents, schools } = useContext(SidebarContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        setError,
        clearErrors,
        trigger,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            school: "",
            color: "#ffffff",
        },
    });

    // Register school field with validation
    register("school", {
        required: `${t("EventSchool")} ${t("isRequired")}!`,
    });

    // Watch form values
    const selectedSchool = watch("school");
    const color = watch("color");

    // Function to handle school change and clear errors
    const handleSchoolChange = (value) => {
        setValue("school", value, { shouldValidate: true, shouldDirty: true });
        clearErrors("school");
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            // Validation: school is required
            if (!data.school || data.school === "") {
                setError("school", {
                    type: "required",
                    message: `${t("EventSchool")} ${t("isRequired")}!`,
                });
                setIsSubmitting(false);
                return;
            }

            const eventData = {
                title: data.title,
                school: data.school,
                color: data.color || "#ffffff",
            };

            if (id) {
                const res = await EventServices.updateEvent(id, eventData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await EventServices.addEvent(eventData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            }
            fetchEvents();
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    const getEventData = async () => {
        try {
            const res = await EventServices.getEventById(id);
            if (res) {
                setValue("title", res.title);
                setValue("school", res.school?._id || "");
                setValue("color", res.color || "#ffffff");
            }
        } catch (err) {
            notifyApiResponse(err, false);
        }
    };

    useEffect(() => {
        if (!isDrawerOpen) {
            reset();
            clearErrors();
            return;
        }
        if (id) {
            getEventData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setValue, isDrawerOpen, clearErrors]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        setValue,
        watch,
        selectedSchool,
        color,
        handleSchoolChange,
        allSchools: schools,
    };
};

export default useEventSubmit;