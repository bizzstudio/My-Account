import { toast } from "react-toastify";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

let currentLang = Cookies.get('i18next');

switch (currentLang) {
  case 'he':
    currentLang = true;
    break;
  case 'en':
    currentLang = false;
    break;
  default:
    currentLang = true;
    break;
};

// Set לעקוב אחר הודעות פעילות
const activeToasts = new Set();

const notifySuccess = (message) => {
  
  // בדיקה אם ההודעה כבר פעילה
  if (activeToasts.has(message)) {
    return;
  }
  
  // הוספת המזהה לרשימת ההודעות הפעילות
  activeToasts.add(message);
  
  return toast.success(message, {
    toastId: message,
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    rtl: currentLang,
    onClose: () => {
      // הסרת המזהה כשההודעה נסגרת
      activeToasts.delete(message);
    }
  });
};

const notifyError = (message) => {
  
  // בדיקה אם ההודעה כבר פעילה
  if (activeToasts.has(message)) {
    return;
  }
  
  // הוספת המזהה לרשימת ההודעות הפעילות
  activeToasts.add(message);
  
  return toast.error(message, {
    toastId: message,
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    rtl: currentLang,
    onClose: () => {
      // הסרת המזהה כשההודעה נסגרת
      activeToasts.delete(message);
    }
  });
};

const notifyInfo = (message) => {
  
  // בדיקה אם ההודעה כבר פעילה
  if (activeToasts.has(message)) {
    return;
  }
  
  // הוספת המזהה לרשימת ההודעות הפעילות
  activeToasts.add(message);
  
  return toast.info(message, {
    toastId: message,
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    rtl: currentLang,
    onClose: () => {
      // הסרת המזהה כשההודעה נסגרת
      activeToasts.delete(message);
    }
  });
};

const notifyWarning = (message) => {
  
  // בדיקה אם ההודעה כבר פעילה
  if (activeToasts.has(message)) {
    return;
  }
  
  // הוספת המזהה לרשימת ההודעות הפעילות
  activeToasts.add(message);
  
  return toast.warning(message, {
    toastId: message,
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    rtl: currentLang,
    onClose: () => {
      // הסרת המזהה כשההודעה נסגרת
      activeToasts.delete(message);
    }
  });
};

export { notifySuccess, notifyError, notifyInfo, notifyWarning };
