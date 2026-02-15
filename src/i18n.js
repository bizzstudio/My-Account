// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/utils/translation/en.json";
import he from "@/utils/translation/he.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    // debug: true, // מדפיס קונסולים על השפה הנוכחית
    lng: "he", // הגדרת עברית כשפת ברירת מחדל
    fallbackLng: "he", // שינוי fallback לעברית במקום אנגלית
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
  });
