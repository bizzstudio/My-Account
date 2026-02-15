// src/hooks/useSubjectSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import SubjectServices from "@/services/SubjectServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const useSubjectSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, fetchSubjects } = useContext(SidebarContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const subjectData = {
                title: data.title,
                description: data.description,
            };

            if (id) {
                const res = await SubjectServices.updateSubject(id, subjectData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await SubjectServices.addSubject(subjectData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            }
            fetchSubjects();
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    const getSubjectData = async () => {
        try {
            const res = await SubjectServices.getSubjectById(id);
            if (res) {
                setValue("title", res.title);
                setValue("description", res.description);
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
            getSubjectData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setValue, isDrawerOpen, clearErrors]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
    };
};

export default useSubjectSubmit;