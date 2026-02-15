// src/hooks/useLecturerSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import LecturerServices from "@/services/LecturerServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const useLecturerSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, fetchLecturers } = useContext(SidebarContext);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [topics, setTopics] = useState([]);

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

            const lecturerData = {
                fullName: data.fullName,
                phone: data.phone,
                idNumber: data.idNumber,
                email: data.email || "",
                bankAccount: {
                    bankName: data.bankAccount?.bankName || "",
                    branchNumber: data.bankAccount?.branchNumber || "",
                    accountNumber: data.bankAccount?.accountNumber || "",
                },
                topics: topics,
                taxStatus: data.taxStatus || undefined,
            };

            if (id) {
                const res = await LecturerServices.updateLecturer(id, lecturerData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await LecturerServices.addLecturer(lecturerData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            }
            fetchLecturers();
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    const getLecturerData = async () => {
        try {
            const res = await LecturerServices.getLecturerById(id);
            if (res) {
                setValue("fullName", res.fullName);
                setValue("phone", res.phone);
                setValue("idNumber", res.idNumber);
                setValue("email", res.email || "");
                setValue("bankAccount.bankName", res.bankAccount?.bankName || "");
                setValue("bankAccount.branchNumber", res.bankAccount?.branchNumber || "");
                setValue("bankAccount.accountNumber", res.bankAccount?.accountNumber || "");
                setValue("taxStatus", res.taxStatus || "");
                setTopics(res.topics || []);
            }
        } catch (err) {
            notifyApiResponse(err, false);
        }
    };

    useEffect(() => {
        if (!isDrawerOpen) {
            setTopics([]);
            clearErrors();
            reset();
            return;
        }
        if (id) {
            getLecturerData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setValue, isDrawerOpen, clearErrors]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        topics,
        setTopics,
    };
};

export default useLecturerSubmit;

