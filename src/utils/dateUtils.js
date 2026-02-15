// src/utils/dateUtils.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

// הרחבות ל-Day.js
dayjs.extend(utc);
dayjs.extend(customParseFormat);

export function formatDate(input) {
    if (!input) return "N/A";
    // console.log('input :>> ', input);

    // אם input הוא מספר (כמו בפורמט Excel)
    if (!isNaN(input) && Number(input) > 10000) {
        const excelEpoch = dayjs.utc("1899-12-30");
        const days = Math.floor(Number(input));
        const fraction = Number(input) - days;
        const date = excelEpoch.add(days, "day").add(fraction * 86400, "second");
        return date.format("YYYY-MM-DD");
    }

    // אם input הוא מחרוזת
    if (typeof input === "string") {
        // נסיון לפרסר לפי רשימת פורמטים מוגדרים
        const formats = [
            "YYYY-MM-DD", "YYYY/MM/DD", "DD/MM/YYYY", "MM/DD/YYYY",
            "DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD HH:mm:ss",
            "DD/MM/YYYY HH:mm:ss", "MM/DD/YYYY HH:mm:ss",
            "DD-MM-YYYY HH:mm:ss", "MM-DD-YYYY HH:mm:ss"
        ];

        const parsedDate = dayjs.utc(input, formats, true);
        if (parsedDate.isValid()) return parsedDate.format("YYYY-MM-DD");

        // ניסיון אחרון עם ניתוח חופשי
        const freeParsedDate = dayjs.utc(input);
        if (freeParsedDate.isValid()) return freeParsedDate.format("YYYY-MM-DD");
    }

    // אם זה כבר אובייקט Day.js
    if (dayjs.isDayjs(input)) {
        return input.format("YYYY-MM-DD");
    }

    return "Invalid Date";
};