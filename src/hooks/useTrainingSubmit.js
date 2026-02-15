// src/hooks/useTrainingSubmit.js
import { useContext, useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import TrainingServices from "@/services/TrainingServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { t } from "i18next";

const useTrainingSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, fetchTrainings, fetchLecturers, lecturers } = useContext(SidebarContext);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lecturer, setLecturer] = useState("");
    const [topic, setTopic] = useState("");
    const initialTopicRef = useRef(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        clearErrors,
        reset,
        setError,
        formState: { errors },
    } = useForm();

    // Watch trainingType and isFrontal from form
    const trainingType = watch("trainingType");
    const duration = watch("duration");
    const isFrontalValue = watch("isFrontal");
    // Ensure isFrontal is always a boolean (not undefined or string)
    const isFrontal = typeof isFrontalValue === 'boolean' ? isFrontalValue : Boolean(isFrontalValue);

    // הגדרת משך אוטומטי ל-60 דקות עבור פגישת מידע אם השדה ריק
    useEffect(() => {
        if (trainingType === "info-meeting" && (!duration || duration === "" || duration === 0)) {
            setValue("duration", 60);
        }
    }, [trainingType, duration, setValue]);

    // איפוס נושא כאשר משנים לפגישת מידע
    useEffect(() => {
        if (trainingType === "info-meeting" && topic) {
            setTopic("");
        }
    }, [trainingType, topic, setTopic]);

    // מציאת המרצה הנבחר
    const selectedLecturer = lecturers?.find(l => l._id === lecturer);

    // יצירת רשימת נושאים זמינים מהמרצה הנבחר
    const availableTopics = useMemo(() => {
        if (!selectedLecturer || !selectedLecturer.topics || !Array.isArray(selectedLecturer.topics)) {
            return [];
        }
        return selectedLecturer.topics;
    }, [selectedLecturer]);

    // איפוס topic כאשר משתנה המרצה (רק אם אין מרצה בטופס חדש)
    useEffect(() => {
        if (!lecturer && !id) {
            // נאפס את הנושא רק אם אין מרצה וגם זה לא עדכון
            setTopic("");
        }
    }, [lecturer, id]);

    // איפוס ה-ref כשהנושא משתנה ידנית (לא מהטעינה הראשונית)
    useEffect(() => {
        if (initialTopicRef.current !== null && topic !== initialTopicRef.current) {
            initialTopicRef.current = null;
        }
    }, [topic]);

    // ניקוי שגיאת נושא כאשר נושא נבחר
    useEffect(() => {
        if (topic && errors.topic) {
            clearErrors("topic");
        }
    }, [topic, errors.topic, clearErrors]);

    // ניקוי שגיאת מרצה כאשר מרצה נבחר
    useEffect(() => {
        if (lecturer && errors.lecturer) {
            clearErrors("lecturer");
        }
    }, [lecturer, errors.lecturer, clearErrors]);

    // ניקוי שגיאת סוג הדרכה כאשר סוג הדרכה נבחר
    useEffect(() => {
        if (trainingType && errors.trainingType) {
            clearErrors("trainingType");
        }
    }, [trainingType, errors.trainingType, clearErrors]);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            // ולידציה - מרצה חובה
            if (!lecturer) {
                setError("lecturer", { type: "required", message: t("LecturerRequired") });
                setIsSubmitting(false);
                return;
            }

            // ולידציה - נושא חובה רק אם זה לא פגישת מידע
            if (data.trainingType !== "info-meeting" && !topic) {
                setError("topic", { type: "required", message: t("TopicRequired") });
                setIsSubmitting(false);
                return;
            }

            // ולידציה - סוג הדרכה חובה
            if (!data.trainingType) {
                setError("trainingType", { type: "required", message: t("TrainingTypeRequired") });
                setIsSubmitting(false);
                return;
            }

            const trainingData = {
                // נושא נשלח רק אם זה לא פגישת מידע
                ...(data.trainingType !== "info-meeting" && { topic: topic }),
                date: data.date,
                duration: parseInt(data.duration, 10),
                type: data.trainingType,
                isFrontal: data.isFrontal || false,
                lecturer: lecturer,
                link: data.link || undefined,
            };

            if (id) {
                const res = await TrainingServices.updateTraining(id, trainingData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await TrainingServices.addTraining(trainingData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            }
            fetchTrainings();
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    const getTrainingData = async () => {
        try {
            const res = await TrainingServices.getTrainingById(id);
            if (res) {
                setValue("date", res.date ? dayjs(res.date).format('YYYY-MM-DDTHH:mm') : "");
                setValue("duration", res.duration);
                setValue("link", res.link || "");
                setValue("trainingType", res.type || "");
                setValue("isFrontal", Boolean(res.isFrontal));
                setLecturer(res.lecturer?._id || "");
                const loadedTopic = res.topic || "";
                setTopic(loadedTopic);
                // שמירת הנושא המקורי שנטען מהשרת
                initialTopicRef.current = loadedTopic;
            }
        } catch (err) {
            notifyApiResponse(err, false);
            initialTopicRef.current = null;
        }
    };

    useEffect(() => {
        if (!isDrawerOpen) {
            setLecturer("");
            setTopic("");
            clearErrors();
            reset();
            initialTopicRef.current = null;
            return;
        }
        if (id) {
            getTrainingData();
        } else {
            // איפוס ערכי ברירת מחדל לטופס חדש
            setValue("trainingType", "");
            setValue("isFrontal", false);
            initialTopicRef.current = null;
        }
        // טעינת מרצים בפתיחת הדרואר
        fetchLecturers();
    }, [id, setValue, isDrawerOpen, clearErrors]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        lecturer,
        setLecturer,
        topic,
        setTopic,
        availableTopics,
        trainingType,
        isFrontal,
        setValue,
    };
};

export default useTrainingSubmit;
