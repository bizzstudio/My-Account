// src/hooks/useSchoolSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import SchoolServices from "@/services/SchoolServices";
import UserServices from "@/services/UserServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const useSchoolSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, fetchSchools } = useContext(SidebarContext);
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manager, setManager] = useState("");
    const [allAdmins, setAllAdmins] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [classes, setClasses] = useState([]);
    const [gradeRange, setGradeRange] = useState([3, 9]); // דיפולט ד'-י'

    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        reset,
        watch,
        formState: { errors },
    } = useForm();

    // אפשרויות שכבות
    const gradeOptions = [
        { value: 'א\'', label: 'א\'' },
        { value: 'ב\'', label: 'ב\'' },
        { value: 'ג\'', label: 'ג\'' },
        { value: 'ד\'', label: 'ד\'' },
        { value: 'ה\'', label: 'ה\'' },
        { value: 'ו\'', label: 'ו\'' },
        { value: 'ז\'', label: 'ז\'' },
        { value: 'ח\'', label: 'ח\'' },
        { value: 'ט\'', label: 'ט\'' },
        { value: 'י\'', label: 'י\'' },
        { value: 'י"א', label: 'י"א' },
        { value: 'י"ב', label: 'י"ב' }
    ];

    // שינוי אוטומטי של טווח שכבות לפי סוג בית הספר (UX בלבד)
    const selectedType = watch('type');
    useEffect(() => {
        if (!selectedType) return;
        const typeToRange = {
            'יסודי': [0, 5],          // א' - ו'
            'חטיבת ביניים': [6, 8],   // ז' - ט'
            'תיכון': [9, 11],         // י' - י"ב
        };
        const target = typeToRange[selectedType];
        // לא מנעול: שינוי חד-פעמי בכל החלפה של סוג
        // מחולל הכיתות יעודכן דרך ה-useEffect הקיים של gradeRange
        if (target && (gradeRange[0] !== target[0] || gradeRange[1] !== target[1])) {
            setGradeRange(target);
        }
    }, [selectedType]);

    // יצירת רשימת כיתות לפי הסליידר
    const generateClassesFromRange = () => {
        const [fromIndex, toIndex] = gradeRange;
        const newClasses = [];

        for (let i = fromIndex; i <= toIndex; i++) {
            const grade = gradeOptions[i];
            // חפש אם יש כיתה קיימת עם אותו שם
            const existingClass = classes.find(c => c.name === grade.value);
            newClasses.push({
                name: grade.value,
                classesInGrade: existingClass?.classesInGrade || 1
            });
        }
        return newClasses;
    };

    // עדכון הכיתות כאשר הסליידר משתנה
    useEffect(() => {
        const newClasses = generateClassesFromRange();
        setClasses(newClasses);
        // שמור על הערכים הקיימים אם יש כאלה
        newClasses.forEach((classItem, index) => {
            const existingClass = classes.find(c => c.name === classItem.name);
            const value = existingClass?.classesInGrade || 1;
            setValue(`classes.${index}.classesInGrade`, value);
        });
    }, [gradeRange, setValue]);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const schoolData = {
                name: data.name,
                location: data.location,
                image: imageUrl,
                symbol: data.symbol || "",
                principal: {
                    name: data.principal?.name || "",
                    email: data.principal?.email || "",
                    phone: data.principal?.phone || "",
                },
                coordinator: {
                    name: data.coordinator?.name || "",
                    email: data.coordinator?.email || "",
                    phone: data.coordinator?.phone || "",
                },
                studentsCount: data.studentsCount,
                teachersCount: data.teachersCount,
                notes: data.notes,
                classes: classes,
                type: data.type || 'תיכון',
                includedInReport: data.includedInReport,
            };

            // הוספת manager רק לסופר אדמין
            if (userInfo?.role === "super-admin" && manager) {
                schoolData.manager = manager;
            }

            if (id) {
                const res = await SchoolServices.updateSchool(id, schoolData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await SchoolServices.addSchool(schoolData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            }
            fetchSchools();
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    const getSchoolData = async () => {
        try {
            const res = await SchoolServices.getSchoolById(id);
            if (res) {
                setValue("name", res.name);
                setValue("location", res.location);
                setValue("symbol", res.symbol || "");
                setValue("principal.name", res.principal?.name);
                setValue("principal.email", res.principal?.email);
                setValue("principal.phone", res.principal?.phone);
                setValue("coordinator.name", res.coordinator?.name);
                setValue("coordinator.email", res.coordinator?.email);
                setValue("coordinator.phone", res.coordinator?.phone);
                setValue("studentsCount", res.studentsCount);
                setValue("teachersCount", res.teachersCount);
                setValue("notes", res.notes);
                setValue("type", res.type || 'תיכון');
                setValue("includedInReport", res.includedInReport !== undefined ? res.includedInReport : true);
                setManager(res.manager?._id || "");
                setImageUrl(res.image || "");

                // עדכון הכיתות והסליידר
                if (res.classes && res.classes.length > 0) {
                    // קודם קבע את הכיתות
                    setClasses(res.classes);

                    // עדכון ערכי ה-form עבור כל שכבה
                    res.classes.forEach((classItem, index) => {
                        setValue(`classes.${index}.classesInGrade`, classItem.classesInGrade);
                    });

                    // אחר כך עדכן את הסליידר (בסוף כדי שלא יפעיל את useEffect)
                    const sortedClasses = res.classes.sort((a, b) => {
                        const aIndex = gradeOptions.findIndex(grade => grade.value === a.name);
                        const bIndex = gradeOptions.findIndex(grade => grade.value === b.name);
                        return aIndex - bIndex;
                    });
                    const minIndex = gradeOptions.findIndex(grade => grade.value === sortedClasses[0].name);
                    const maxIndex = gradeOptions.findIndex(grade => grade.value === sortedClasses[sortedClasses.length - 1].name);

                    // השתמש ב-setTimeout כדי למנוע התנגשות עם useEffect
                    setTimeout(() => {
                        setGradeRange([minIndex !== -1 ? minIndex : 0, maxIndex !== -1 ? maxIndex : 11]);
                    }, 0);
                } else {
                    // אם אין כיתות, הגדר דיפולט של ד'-י'
                    setGradeRange([3, 9]);
                }
            }
        } catch (err) {
            notifyApiResponse(err, false);
        }
    };

    const getAllUsers = async () => {
        try {
            if (userInfo?.role === "super-admin") {
                const res = await UserServices.getAllUser();
                // סופר אדמין יכול לראות את עצמו ואת כל האדמינים הרגילים
                setAllAdmins(res || []);
            }
        } catch (err) {
            console.error("Error fetching admins:", err);
        }
    };

    // פונקציה לעדכון מספר כיתות בשכבה
    const updateClassCount = (gradeName, count) => {
        const updatedClasses = classes.map((classItem, index) => {
            if (classItem.name === gradeName) {
                // עדכון גם ב-form value
                setValue(`classes.${index}.classesInGrade`, count);
                return { ...classItem, classesInGrade: count };
            }
            return classItem;
        });
        setClasses(updatedClasses);
    };

    useEffect(() => {
        if (!isDrawerOpen) {
            setManager("");
            setImageUrl("");
            setClasses([]);
            setGradeRange([3, 9]); // דיפולט ד'-י'
            clearErrors();
            reset();
            return;
        }
        if (id) {
            getSchoolData();
        } else {
            // אם זה יצירה חדשה, הגדר דיפולט של ד'-י'
            setGradeRange([3, 9]);
            setValue("type", 'תיכון');
            setValue("includedInReport", true);
        }
        getAllUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setValue, isDrawerOpen, clearErrors]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        manager,
        setManager,
        allAdmins,
        imageUrl,
        setImageUrl,
        classes,
        gradeOptions,
        gradeRange,
        setGradeRange,
        updateClassCount,
        watch,
        setValue,
    };
};

export default useSchoolSubmit;