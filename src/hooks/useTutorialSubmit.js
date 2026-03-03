// src/hooks/useTutorialSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { SidebarContext } from "@/context/SidebarContext";
import TutorialServices from "@/services/TutorialServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const useTutorialSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate } = useContext(SidebarContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        reset,
        control,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const tutorialData = {
                title: data.title,
                description: data.description,
                videoUrl: data.videoUrl,
            };

            if (id) {
                const res = await TutorialServices.updateTutorial(id, tutorialData);
                notifyApiResponse(res, true);
            } else {
                const res = await TutorialServices.addTutorial(tutorialData);
                notifyApiResponse(res, true);
            }

            setIsUpdate(true);
            setIsSubmitting(false);
            closeDrawer();
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    const getTutorialData = async () => {
        try {
            const res = await TutorialServices.getTutorialById(id);
            if (res) {
                setValue("title", res.title);
                setValue("description", res.description);
                setValue("videoUrl", res.videoUrl);
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
            getTutorialData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isDrawerOpen]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        control,
    };
};

export default useTutorialSubmit;
