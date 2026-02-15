// src/hooks/useSessionReportSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import SessionReportServices from "@/services/SessionReportServices";
import EventServices from "@/services/EventServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyWarning } from "@/utils/toast";
import { t } from "i18next";

const useSessionReportSubmit = (id) => {
    const {
        isDrawerOpen,
        closeDrawer,
        setIsUpdate,
        guides,
        schools,
        subjects,
        events,
        fetchEvents,
    } = useContext(SidebarContext);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableSchools, setAvailableSchools] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [isQuickEventModalOpen, setIsQuickEventModalOpen] = useState(false);
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);

    // טופס ראשי לדוח השיעור
    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        reset,
        setError,
        watch,
        formState: { errors },
    } = useForm();

    // טופס נפרד למודל יצירת אירוע מהיר
    const quickEventForm = useForm({
        defaultValues: {
            quickEventTitle: '',
            // quickEventColor: '#ffffff' // הוסר - צבעים לא בשימוש
        }
    });

    const {
        register: registerQuickEvent,
        handleSubmit: handleSubmitQuickEvent,
        setValue: setValueQuickEvent,
        formState: { errors: errorsQuickEvent },
        reset: resetQuickEvent,
        watch: watchQuickEvent,
    } = quickEventForm;

    // Watch form values
    const selectedGuide = watch("guide");
    const selectedSchool = watch("school");
    const selectedSubject = watch("subject");
    const selectedEvent = watch("event");
    const selectedClass = watch("class");
    const selectedParticipants = watch("participants");
    // const quickEventColor = watchQuickEvent("quickEventColor"); // הוסר - צבעים לא בשימוש

    // יצירת רשימת כיתות מתוך בית הספר הנבחר
    const generateClassOptions = (school) => {
        if (!school || !school.classes) return [];

        const classOptions = [];
        school.classes.forEach(grade => {
            for (let i = 1; i <= grade.classesInGrade; i++) {
                // אם יש רק כיתה אחת בשכבה, לא נוסיף מספר
                const className = grade.classesInGrade === 1 ? grade.name : `${grade.name}${i}`;
                classOptions.push({
                    _id: className, // שינוי: _id יהיה זהה לשם הכיתה
                    name: className
                });
            }
        });

        return classOptions.sort((a, b) => {
            // מיון לפי סדר השכבות
            const gradeOrder = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ז\'', 'ח\'', 'ט\'', 'י\'', 'י"א', 'י"ב'];
            const aGrade = a.name.replace(/\d+/, '');
            const bGrade = b.name.replace(/\d+/, '');
            const aIndex = gradeOrder.indexOf(aGrade);
            const bIndex = gradeOrder.indexOf(bGrade);

            if (aIndex !== bIndex) {
                return aIndex - bIndex;
            }

            // אם אותה שכבה, מיון לפי מספר הכיתה
            const aNum = parseInt(a.name.replace(/\D+/, '')) || 0;
            const bNum = parseInt(b.name.replace(/\D+/, '')) || 0;
            return aNum - bNum;
        });
    };

    // עדכון בתי הספר והנושאים הזמינים כאשר המנחה משתנה
    useEffect(() => {
        if (selectedGuide && guides) {
            const guide = guides.find(g => g._id === selectedGuide);
            if (guide) {
                // עדכון בתי הספר הזמינים
                if (guide.schools) {
                    const guideSchools = schools?.filter(school =>
                        guide.schools.includes(school._id) && school.status === 'active'
                    ) || [];
                    setAvailableSchools(guideSchools);

                    // אם בית הספר הנוכחי לא זמין למנחה החדש, איפוס הבחירה
                    if (selectedSchool && !guide.schools.includes(selectedSchool)) {
                        setValue("school", "");
                        setValue("class", "");
                    }
                } else {
                    setAvailableSchools([]);
                    setValue("school", "");
                    setValue("class", "");
                }

                // עדכון הנושאים הזמינים - נושאים הם גלובליים, אין manager ואין status
                // מציגים את כל הנושאים
                const guideSubjects = subjects || [];
                setAvailableSubjects(guideSubjects);

                // אם הנושא הנוכחי לא קיים ברשימה, איפוס הבחירה
                if (selectedSubject && !guideSubjects.find(s => s._id === selectedSubject)) {
                    setValue("subject", "");
                }
            } else {
                setAvailableSchools([]);
                setAvailableSubjects([]);
                setAvailableClasses([]);
                setValue("school", "");
                setValue("subject", "");
                setValue("class", "");
            }
        } else {
            setAvailableSchools([]);
            setAvailableSubjects([]);
            setAvailableClasses([]);
            setValue("school", "");
            setValue("subject", "");
            setValue("class", "");
            setValue("participants", "");
        }
    }, [selectedGuide, guides, schools, subjects, selectedSchool, selectedSubject, setValue]);

    // עדכון הכיתות הזמינות כאשר בית הספר משתנה
    useEffect(() => {
        if (selectedSchool && availableSchools.length > 0) {
            const school = availableSchools.find(s => s._id === selectedSchool);
            if (school) {
                const classOptions = generateClassOptions(school);
                setAvailableClasses(classOptions);

                // אם הכיתה הנוכחית לא זמינה בבית הספר החדש, איפוס הבחירה
                if (selectedClass && !classOptions.find(c => c._id === selectedClass)) {
                    setValue("class", "");
                }
            } else {
                setAvailableClasses([]);
                setValue("class", "");
            }
        } else {
            setAvailableClasses([]);
            setValue("class", "");
        }
    }, [selectedSchool, availableSchools, selectedClass, setValue]);

    // ניקוי שגיאות כשהמשתמש בוחר ערכים
    useEffect(() => {
        if (selectedGuide) clearErrors("guide");
    }, [selectedGuide, clearErrors]);

    useEffect(() => {
        if (selectedSchool) clearErrors("school");
    }, [selectedSchool, clearErrors]);

    useEffect(() => {
        if (selectedClass) clearErrors("class");
    }, [selectedClass, clearErrors]);

    useEffect(() => {
        if (selectedSubject) clearErrors("subject");
    }, [selectedSubject, clearErrors]);

    useEffect(() => {
        if (selectedParticipants) {
            clearErrors("participants");
            // אם בוחרים 'חברותאים', מנקים שגיאת subject אם יש ומנקים אירוע
            if (selectedParticipants === 'חברותאים') {
                clearErrors("subject");
                setValue("event", ""); // ניקוי אירוע כי בוחרים נושא
            }
            // אם בוחרים 'אירועי השיא', מנקים שגיאת event אם יש ומנקים נושא
            else if (selectedParticipants === 'אירועי השיא') {
                clearErrors("event");
                setValue("subject", ""); // ניקוי נושא כי בוחרים אירוע
            }
            // אם בוחרים משהו אחר, מנקים את שתי השגיאות ומנקים את שני השדות
            else {
                clearErrors("subject");
                clearErrors("event");
                setValue("subject", ""); // ניקוי נושא
                setValue("event", ""); // ניקוי אירוע
            }
        }
    }, [selectedParticipants, clearErrors, setValue]);

    useEffect(() => {
        if (selectedEvent) clearErrors("event");
    }, [selectedEvent, clearErrors]);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            // וולידציה של שדות חובה
            if (!selectedGuide) {
                setError("guide", { message: `${t("ReportGuide")} ${t("isRequired")}` });
                setIsSubmitting(false);
                return;
            }

            if (!selectedSchool) {
                setError("school", { message: `${t("ReportSchool")} ${t("isRequired")}` });
                setIsSubmitting(false);
                return;
            }

            // הכיתה כבר לא שדה חובה
            // if (!selectedClass) {
            //     setError("class", { message: `${t("ReportClass")} ${t("isRequired")}` });
            //     setIsSubmitting(false);
            //     return;
            // }

            // אם בוחרים 'חברותאים', הנושא חובה
            if (selectedParticipants === 'חברותאים' && !selectedSubject) {
                setError("subject", { message: `${t("ReportSubject")} ${t("isRequired")}` });
                setIsSubmitting(false);
                return;
            }

            // אם בוחרים 'אירועי השיא', האירוע חובה
            if (selectedParticipants === 'אירועי השיא' && !selectedEvent) {
                setError("event", { message: `${t("Event")} ${t("isRequired")}` });
                setIsSubmitting(false);
                return;
            }

            if (!selectedParticipants) {
                setError("participants", { message: `${t("ReportParticipants")} ${t("isRequired")}` });
                setIsSubmitting(false);
                return;
            }

            // יצירת DateTime עם dayjs
            const reportDate = dayjs(data.date);
            const startDateTime = dayjs(`${data.date}T${data.startTime}`);
            const endDateTime = dayjs(`${data.date}T${data.endTime}`);

            // וולידציה ששעת סיום אחרי שעת התחלה
            if (endDateTime.isBefore(startDateTime) || endDateTime.isSame(startDateTime)) {
                setError("endTime", { message: t("EndTimeMustBeAfterStartTime") });
                setIsSubmitting(false);
                return;
            }

            const reportData = {
                guide: selectedGuide,
                date: reportDate.toDate(),
                startTime: startDateTime.toDate(),
                endTime: endDateTime.toDate(),
                school: selectedSchool,
                class: selectedClass,
                ...(selectedParticipants === 'חברותאים' ? { subject: selectedSubject } : { subject: null }),
                ...(selectedParticipants === 'אירועי השיא' && selectedEvent ? { event: selectedEvent } : { event: null }),
                description: data.description,
                feedback: data.feedback,
                participants: selectedParticipants,
                participantsAmount: data.participantsAmount !== undefined && data.participantsAmount !== ""
                    ? Number(data.participantsAmount)
                    : undefined,
            };

            if (id) {
                const res = await SessionReportServices.updateSessionReport(id, reportData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await SessionReportServices.addSessionReport(reportData);
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

    const getSessionReportData = async () => {
        try {
            const res = await SessionReportServices.getSessionReportById(id);
            if (res) {
                const reportDate = dayjs(res.date);
                const startTime = dayjs(res.startTime);
                const endTime = dayjs(res.endTime);

                setValue("date", reportDate.format("YYYY-MM-DD"));
                setValue("startTime", startTime.format("HH:mm"));
                setValue("endTime", endTime.format("HH:mm"));
                setValue("description", res.description);
                setValue("feedback", res.feedback);
                setValue("guide", res.guide?._id || "");
                setValue("school", res.school?._id || "");
                setValue("subject", res.subject?._id || "");
                setValue("event", res.event?._id || "");
                setValue("participants", res.participants || "");
                setValue("participantsAmount", res.participantsAmount ?? "");

                // נחכה שהכיתות יטענו לפני שנגדיר את הכיתה
                setTimeout(() => {
                    setValue("class", res.class || "");
                }, 200);
            }
        } catch (err) {
            notifyApiResponse(err, false);
        }
    };

    useEffect(() => {
        if (!isDrawerOpen) {
            setAvailableSchools([]);
            setAvailableSubjects([]);
            setAvailableClasses([]);
            clearErrors();
            reset();
            return;
        }
        if (id) {
            getSessionReportData();
        } else {
            // הגדרת ערכים דיפולטיביים לדוח חדש
            const now = dayjs();
            const currentDate = now.format("YYYY-MM-DD");
            const currentTime = now.format("HH:mm");
            const endTime = now.add(1, 'hour').format("HH:mm");

            setValue("date", currentDate);
            setValue("startTime", currentTime);
            setValue("endTime", endTime);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setValue, isDrawerOpen, clearErrors]);

    // פונקציות לניהול יצירת אירוע מהיר
    const handleQuickEventModalOpen = () => {
        setIsQuickEventModalOpen(true);
        resetQuickEvent({
            quickEventTitle: '',
            // quickEventColor: '#ffffff' // הוסר - צבעים לא בשימוש
        });
    };

    const handleQuickEventModalClose = () => {
        setIsQuickEventModalOpen(false);
        resetQuickEvent({
            quickEventTitle: ''
            // quickEventColor: '#ffffff' // הוסר - צבעים לא בשימוש
        });
    };

    const handleQuickEventSubmit = async (data) => {
        try {
            setIsCreatingEvent(true);

            if (!data.quickEventTitle) {
                setIsCreatingEvent(false);
                notifyWarning(t("EventTitle") + " " + t("isRequired"));
                return;
            }

            if (!selectedSchool) {
                setIsCreatingEvent(false);
                notifyWarning(t("PleaseSelectSchoolFirst"));
                return;
            }

            const eventData = {
                title: data.quickEventTitle,
                school: selectedSchool,
                // color: data.quickEventColor || "#ffffff", // הוסר - צבעים לא בשימוש
            };

            const res = await EventServices.addEvent(eventData);

            // עדכון הקונטקסט
            await fetchEvents();

            // בחירת האירוע שזה עתה נוצר
            setValue("event", res.event._id);

            notifyApiResponse(res, true);
            handleQuickEventModalClose();
        } catch (err) {
            notifyApiResponse(err, false);
        } finally {
            setIsCreatingEvent(false);
        }
    };

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        selectedGuide,
        selectedSchool,
        selectedSubject,
        selectedEvent,
        selectedClass,
        selectedParticipants,
        setValue,
        availableSchools,
        availableSubjects,
        availableClasses,
        isQuickEventModalOpen,
        isCreatingEvent,
        // quickEventColor, // הוסר - צבעים לא בשימוש
        handleQuickEventModalOpen,
        handleQuickEventModalClose,
        handleQuickEventSubmit,
        allEvents: events,
        // טופס נפרד למודל
        registerQuickEvent,
        handleSubmitQuickEvent,
        errorsQuickEvent,
        setValueQuickEvent,
    };
};

export default useSessionReportSubmit;