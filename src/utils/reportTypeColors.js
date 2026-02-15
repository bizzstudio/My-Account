// src/utils/reportTypeColors.js
/**
 * מעצים את הצבע למצב בהיר על ידי הקטנת ה-Lightness
 * @param {string} hslString - צבע HSL בפורמט "H°, S%, L%"
 * @returns {string} - צבע HSL בפורמט CSS "hsl(H, S%, L%)"
 */
const intensifyColor = (hslString) => {
    if (!hslString) return "hsl(0, 0%, 0%)";

    // פרסור המחרוזת "H°, S%, L%"
    const match = hslString.match(/(\d+(?:\.\d+)?)°,\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%/);
    if (!match) return "hsl(0, 0%, 0%)";

    const h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    let l = parseFloat(match[3]);

    // הקטנת ה-Lightness כדי להפוך את הצבע לעז יותר (כהה יותר)
    // מקטין ב-30% מהערך הנוכחי
    l = Math.max(30, l * 0.6); // מינימום 30% לקריאות

    return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * מחזיר צבע ספציפי לסוג דוח שיעור
 * @param {string} participantType - סוג המשתתפים בדוח
 * @param {boolean} intensify - האם להעצים את הצבע (למצב בהיר)
 * @returns {string} - צבע HSL בפורמט CSS "hsl(H, S%, L%)"
 */
export const getReportTypeColor = (participantType, intensify = false) => {
    if (!participantType) return "hsl(0, 0%, 0%)"; // צבע ברירת מחדל שחור

    const colorMap = {
        'חברותאים': '0°, 100%, 77%',
        'מנהל וצוות ניהול': '50°, 100%, 77%',
        'השתלמות/מליאה': '80°, 100%, 77%',
        'ליווי מורים': '160°, 100%, 77%',
        'יישומי לכיתה': '210°, 100%, 77%',
        'אירועי השיא': '280°, 100%, 77%',
        'הערות ונקודות למחשבה': '310°, 100%, 77%',
        'אחר': '0°, 0%, 0%',
    };

    const color = colorMap[participantType] || "0°, 0%, 0%"; // צבע ברירת מחדל אם לא נמצא

    if (intensify) {
        return intensifyColor(color);
    }

    // המרה לפורמט CSS
    const match = color.match(/(\d+(?:\.\d+)?)°,\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%/);
    if (!match) return "hsl(0, 0%, 0%)";

    const h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    const l = parseFloat(match[3]);

    return `hsl(${h}, ${s}%, ${l}%)`;
};

// המרת HSL ל-RGBA עם שקיפות
export const hslToRgba = (hslString, alpha = 0.2) => {
    if (!hslString) return null;

    // פרסור hsl(H, S%, L%)
    const match = hslString.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
    if (!match) return null;

    const h = parseFloat(match[1]) / 360;
    const s = parseFloat(match[2]) / 100;
    const l = parseFloat(match[3]) / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // אפור
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
};