// src/context/SidebarContext.jsx
import UserServices from "@/services/UserServices";
import LecturerServices from "@/services/LecturerServices";
import TrainingServices from "@/services/TrainingServices";
import RegistrantServices from "@/services/RegistrantServices";
import GuideServices from "@/services/GuideServices";
import SchoolServices from "@/services/SchoolServices";
import StatusServices from "@/services/StatusServices";
import SuppliersServices from "@/services/SupplierServices";
import OrderServices from "@/services/OrderServices";
import { t } from "i18next";
import Cookies from "js-cookie";
import { createContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// create context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const resultsPerPage = 20;
  const searchRef = useRef("");

  const [limitData, setLimitData] = useState(20);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [lang, setLang] = useState("he"); // עברית כברירת מחדל
  const [time, setTime] = useState("");
  const [sortedField, setSortedField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [windowDimension, setWindowDimension] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [navBar, setNavBar] = useState(true);
  const { i18n } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [allId, setAllId] = useState([]);
  const [title, setTitle] = useState("");
  const [pageTitle, setPageTitle] = useState("");

  // New entities data for filters and dropdowns
  const [lecturers, setLecturers] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [guides, setGuides] = useState([]);
  const [schools, setSchools] = useState([]);

  const [statuses, setStatuses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const fetchSuppliers = async () => {
    try {
      const data = await SuppliersServices.getAllSuppliers();
      console.log("suppliers:", data)
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const data = await StatusServices.getAllStatuses();
      
      // קבלת כמות ההזמנות לכל סטטוס
      const statusesWithCounts = await Promise.all(
        data.map(async (status) => {
          try {
            const ordersRes = await OrderServices.getAllOrders({ status: status._id, limit: 1 });
            const count = ordersRes?.totalDoc ?? 0;
            return { ...status, ordersCount: count };
          } catch (err) {
            console.error(`Error fetching count for status ${status.name}:`, err);
            return { ...status, ordersCount: 0 };
          }
        })
      );
      
      setStatuses(statusesWithCounts);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  // עדכון כמויות ההזמנות בלבד (ללא טעינה מחדש של הסטטוסים)
  const updateOrdersCounts = async () => {
    if (!statuses || statuses.length === 0) return;
    
    try {
      const updatedStatuses = await Promise.all(
        statuses.map(async (status) => {
          try {
            const ordersRes = await OrderServices.getAllOrders({ status: status._id, limit: 1 });
            const count = ordersRes?.totalDoc || ordersRes?.total || ordersRes?.count || 0;
            return { ...status, ordersCount: count };
          } catch (err) {
            console.error(`Error updating count for status ${status.name}:`, err);
            return status; // שמירה על הערך הקיים במקרה של שגיאה
          }
        })
      );
      
      setStatuses(updatedStatuses);
    } catch (error) {
      console.error("Error updating orders counts:", error);
    }
  };

  // פונקציות לטעינת נתונים
  const fetchLecturers = async () => {
    try {
      const data = await LecturerServices.getAllLecturers();
      setLecturers(data);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  };

  const fetchTrainings = async () => {
    try {
      const data = await TrainingServices.getAllTrainings();
      setTrainings(data);
    } catch (error) {
      console.error("Error fetching trainings:", error);
    }
  };

  const fetchGuides = async () => {
    try {
      const data = await GuideServices.getAllGuides();
      setGuides(data);
    } catch (error) {
      console.error("Error fetching guides:", error);
    }
  };

  const fetchSchools = async () => {
    try {
      const data = await SchoolServices.getAllSchools();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  // פונקציה לטעינת כל הנתונים
  const fetchAllData = async () => {
    await Promise.all([
     
    ]);
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const closeModal = () => setIsModalOpen(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleLanguageChange = (lang) => {
    Cookies.set("i18next", lang, {
      sameSite: "None",
      secure: true,
    });
    i18n.changeLanguage(lang);
    setLang(lang);
  };

  const handleChangePage = (p) => {
    setCurrentPage(p);
  };

  const handleSubmitForAll = (e) => {
    e.preventDefault();
    if (!searchRef?.current?.value) return setSearchText(null);
    setSearchText(searchRef?.current?.value);
  };

  useEffect(() => {
    // הגדרת עברית כשפת ברירת מחדל ללא זיהוי אוטומטי
    const savedLang = Cookies.get("i18next");

    // אם יש שפה שמורה בקוקי, נשתמש בה
    // אחרת נגדיר עברית כברירת מחדל
    const defaultLang = "he" //savedLang || "he";

    setLang(defaultLang);
    i18n.changeLanguage(defaultLang);

    // שמירת השפה בקוקי
    Cookies.set("i18next", defaultLang, {
      sameSite: "None",
      secure: true,
    });
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [breadcrumbs, setBreadcrumbs] = useState([{ label: t("Home"), href: "/" }]);

  // טעינת כל הנתונים בהתחלה של המרצים, ההדרכות והנרשמים
  useEffect(() => {
    fetchAllData();
  }, []);

  // ווידוא שהטוקן עדיין תקין
  useEffect(() => {
    const validateToken = async () => {
      try {
        const userInfoCookie = Cookies.get("userInfo");

        // אם אין אף קוקי - שלח ל-login
        if (!userInfoCookie) {
          window.location.pathname = "/login";
          return;
        }

        // ננסה לפרסר את מה שיש
        let userInfo = null;
        try {
          if (userInfoCookie) userInfo = JSON.parse(userInfoCookie);
        } catch (e) {
          Cookies.remove("userInfo");
          window.location.pathname = "/login";
          return;
        }

        // אם אין token באף אחד מהם - שלח ל-login
        if (!(userInfo?.token)) {
          window.location.pathname = "/login";
          return;
        }

        // בדוק את הטוקן (הפונקציה משתמשת בטוקן מהקוקי)
        const data = await UserServices.validateToken();
        if (data !== true) {
          Cookies.remove("userInfo");
          window.location.pathname = "/login";
        }
      } catch (error) {
        console.error("Error validating token:", error);
        Cookies.remove("userInfo");
        window.location.pathname = "/login";
      }
    };

    // רק אם לא נמצאים בעמוד לוגין או אחד מעמודי האותנטיקציה
    const authPages = ["/login", "/forgot-password", "/reset-password"];
    const isAuthPage = authPages.some(page => window.location.pathname.startsWith(page));

    if (!isAuthPage) {
      validateToken();
    }
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isDrawerOpen,
        toggleDrawer,
        closeDrawer,
        setIsDrawerOpen,
        isModalOpen,
        toggleModal,
        closeModal,
        isUpdate,
        setIsUpdate,
        lang,
        setLang,
        handleLanguageChange,
        currentPage,
        setCurrentPage,
        handleChangePage,
        searchText,
        setSearchText,
        searchRef,
        handleSubmitForAll,
        time,
        setTime,
        sortedField,
        setSortedField,
        resultsPerPage,
        limitData,
        setLimitData,
        windowDimension,
        modalOpen,
        setModalOpen,
        loading,
        setLoading,
        setNavBar,
        navBar,
        tabIndex,
        setTabIndex,
        serviceId,
        setServiceId,
        allId,
        setAllId,
        title,
        setTitle,
        breadcrumbs,
        setBreadcrumbs,
        pageTitle,
        setPageTitle,
        // New entities
        lecturers,
        setLecturers,
        trainings,
        setTrainings,
        guides,
        setGuides,
        schools,
        setSchools,
        statuses,
        setStatuses,
        fetchStatuses,
        updateOrdersCounts,
        suppliers,
        setSuppliers,
        fetchSuppliers,
        // New functions for fetching data
        fetchLecturers,
        fetchTrainings,
        fetchGuides,
        fetchSchools,
        fetchAllData,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
