// src/hooks/useGuideSubmit.js
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import GuideServices from "@/services/GuideServices";
import UserServices from "@/services/UserServices";
import SchoolServices from "@/services/SchoolServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const useGuideSubmit = (id) => {
    const { isDrawerOpen, closeDrawer, setIsUpdate, setSchools, fetchGuides, schools } = useContext(SidebarContext);
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manager, setManager] = useState("");
    const [allAdmins, setAllAdmins] = useState([]);
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [imageUrl, setImageUrl] = useState("");

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

            const guideData = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                // monthlyHours: data.monthlyHours,
                schools: selectedSchools,
                notes: data.notes,
                image: imageUrl,
            };

            // הוספת סיסמה אם הוזנה (אופציונלי)
            if (data.password && String(data.password).trim()) {
                guideData.password = String(data.password).trim();
            }

            // הוספת manager רק לסופר אדמין
            if (userInfo?.role === "super-admin" && manager) {
                guideData.manager = manager;
            }

            if (id) {
                const res = await GuideServices.updateGuide(id, guideData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            } else {
                const res = await GuideServices.addGuide(guideData);
                setIsUpdate(true);
                setIsSubmitting(false);
                notifyApiResponse(res, true);
                closeDrawer();
            }
            fetchGuides();
        } catch (err) {
            notifyApiResponse(err, false);
            setIsSubmitting(false);
        }
    };

    const getGuideData = async () => {
        try {
            const res = await GuideServices.getGuideById(id);
            console.log('getGuideById res :>> ', res);
            if (res) {
                setValue("name", res.name);
                setValue("email", res.email);
                setValue("phone", res.phone);
                // setValue("monthlyHours", res.monthlyHours);
                setValue("notes", res.notes);
                setSelectedSchools(res.schools || []);
                setImageUrl(res.image);
                setManager(res.manager?._id || "");
            }
        } catch (err) {
            notifyApiResponse(err, false);
        }
    };

    const getAllUsers = async () => {
        try {
            if (userInfo?.role === "super-admin") {
                const res = await UserServices.getAllUser();
                setAllAdmins(res || []);
            }
        } catch (err) {
            console.error("Error fetching admins:", err);
        }
    };

    const getAllSchools = async () => {
        try {
            const res = await SchoolServices.getAllSchools();
            setSchools(res || []);
        } catch (err) {
            console.error("Error fetching schools:", err);
        }
    };

    // פונקציה לניקוי בתי ספר שלא שייכים למנהל הנבחר
    const filterSchoolsByManager = (managerId, currentSelectedSchools) => {
        if (!managerId || userInfo?.role !== "super-admin") {
            return currentSelectedSchools;
        }

        // מסנן רק בתי ספר ששייכים למנהל הנבחר
        const validSchoolIds = schools
            ?.filter(school => school.status === 'active' && school.manager?._id === managerId)
            ?.map(school => school._id) || [];

        // מחזיר רק את הבתי ספר שנבחרו וששייכים למנהל
        return currentSelectedSchools.filter(schoolId => validSchoolIds.includes(schoolId));
    };

    // כאשר משתנה המנהל, מנקה בתי ספר שלא שייכים אליו
    useEffect(() => {
        if (manager && userInfo?.role === "super-admin") {
            const filteredSchools = filterSchoolsByManager(manager, selectedSchools);
            if (filteredSchools.length !== selectedSchools.length) {
                setSelectedSchools(filteredSchools);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manager, schools]);

    useEffect(() => {
        if (!isDrawerOpen) {
            setManager("");
            setSelectedSchools([]);
            setImageUrl("");
            clearErrors();
            reset();
            return;
        }
        if (id) {
            getGuideData();
        }
        getAllUsers();
        getAllSchools();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setValue, isDrawerOpen, clearErrors]);

    // כאשר טוענים מנחה קיים, מנקים בתי ספר שלא שייכים למנהל שלו (אם יש)
    useEffect(() => {
        if (id && manager && userInfo?.role === "super-admin" && schools.length > 0) {
            const filteredSchools = filterSchoolsByManager(manager, selectedSchools);
            if (filteredSchools.length !== selectedSchools.length) {
                setSelectedSchools(filteredSchools);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schools, id, manager]);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        manager,
        setManager,
        allAdmins,
        selectedSchools,
        setSelectedSchools,
        imageUrl,
        setImageUrl,
    };
};

export default useGuideSubmit;