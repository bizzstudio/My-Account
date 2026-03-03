// src/hooks/useUserSubmit.js
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import UserServices from "@/services/UserServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const useUserSubmit = (id) => {
  const {
    isDrawerOpen,
    closeDrawer,
    setIsUpdate,
    lang
  } = useContext(SidebarContext);

  const { state, dispatch } = useContext(UserContext);
  const { userInfo } = state;
  
  const [resData, setResData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();

  const defaultValues = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "super-admin",
    idNumber: "",
    registrationNumber: "",
    status: true,
    image: "",
    joiningDate: dayjs(new Date()).format("YYYY-MM-DD"),
    language: lang || "en",
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
        idNumber: data.idNumber != null ? String(data.idNumber).trim() : "",
        registrationNumber: data.registrationNumber != null ? String(data.registrationNumber).trim() : "",
        status: data.status === true || data.status === "active" ? "active" : "inactive",
        image: data.image,
      };

      console.log("🔵 onSubmit userData:", JSON.stringify(userData));

      if (id) {
        const res = await UserServices.updateUser(id, userData);
        console.log("🟢 updateUser response:", JSON.stringify(res));
        setIsUpdate(true);
        setIsSubmitting(false);
        notifyApiResponse(res, true);

        // אם האדמין מעדכן את עצמו, עדכן את הקונטקסט והעוגיות
        if (userInfo && userInfo._id === id && res) {
          const cookieTimeOut = 30;
          // שמירת כל הנתונים הקיימים (כולל skippedMfa וכל שדה אחר) ועדכון עם הנתונים החדשים מהתשובה
          const updatedUserInfo = {
            ...userInfo, // שמור את כל הנתונים הקיימים (token, skippedMfa, וכו')
            ...res, // עדכן עם הנתונים החדשים מהתשובה (name, email, image, phone, role, status, _id)
            token: res.token || userInfo.token, // שמור את הטוקן הקיים אם לא התקבל חדש מהשרת
          };

          dispatch({ type: "USER_LOGIN", payload: updatedUserInfo });
          Cookies.set("userInfo", JSON.stringify(updatedUserInfo), {
            expires: cookieTimeOut,
            sameSite: "None",
            secure: true,
          });
        }

        closeDrawer();
      } else {
        const res = await UserServices.addUser(userData);
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

  const getUserData = async () => {
    try {
      const res = await UserServices.getUserById(id);
      if (res) {
        setResData(res);
        reset({
          name: res.name,
          email: res.email,
          password: "",
          phone: res.phone,
          role: res.role || "super-admin",
          idNumber: res.idNumber || "",
          registrationNumber: res.registrationNumber || "",
          status: res.status !== undefined ? res.status : true,
          joiningDate: dayjs(res.joiningData).format("YYYY-MM-DD"),
          image: res.image || "",
          language: lang || "en",
        });
      }
    } catch (err) {
      notifyApiResponse(err, false);
    }
  };

  const handleSelectLanguage = (lang) => {
    setValue("language", lang);

    if (Object.keys(resData).length > 0) {
      setValue("name", resData.name[lang ? lang : "en"]);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setResData({});
      reset({
        ...defaultValues,
        language: lang || "en",
        joiningDate: dayjs(new Date()).format("YYYY-MM-DD"),
      });
      clearErrors();
      return;
    }
    if (id) {
      getUserData();
    } else {
      // הוספה: מאתחלים טופס ריק מפורש כדי idNumber ו-registrationNumber יהיו ב-state
      reset({
        ...defaultValues,
        language: lang || "en",
        joiningDate: dayjs(new Date()).format("YYYY-MM-DD"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reset, isDrawerOpen]);

  useEffect(() => {
    if (location.pathname === "/edit-profile" && Cookies.get("userInfo")) {
      getUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, reset]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    handleSelectLanguage,
    watch,
    setValue,
  };
};

export default useUserSubmit;