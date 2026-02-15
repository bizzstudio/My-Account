
/**
 * יוצר תצוגה של טווח כיתות מבית הספר
 * @param {Array} classes - מערך של כיתות עם שמות ומספר כיתות בשכבה
 * @returns {string} - טווח הכיתות בפורמט "ד'-י"ב" או שם שכבה בודדת
 */
export const generateClassRange = (classes) => {
    if (!classes || classes.length === 0) return "-";

    // סדר השכבות
    const gradeOrder = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ז\'', 'ח\'', 'ט\'', 'י\'', 'י"א', 'י"ב'];

    // מיון הכיתות לפי הסדר
    const sortedClasses = classes.sort((a, b) => {
        const aIndex = gradeOrder.indexOf(a.name);
        const bIndex = gradeOrder.indexOf(b.name);
        return aIndex - bIndex;
    });

    // אם יש רק שכבה אחת
    if (sortedClasses.length === 1) {
        return sortedClasses[0].name;
    }

    // מצא את השכבה הראשונה והאחרונה
    const firstGrade = sortedClasses[0].name;
    const lastGrade = sortedClasses[sortedClasses.length - 1].name;

    // אם יש טווח רציף, הצג כטווח
    if (firstGrade !== lastGrade) {
        return `${firstGrade}-${lastGrade}`;
    }

    // אם כל הכיתות באותה שכבה
    return firstGrade;
};

/**
 * יוצר רשימה מפורטת של כל הכיתות (לצורך tooltip או תצוגה מפורטת)
 * @param {Array} classes - מערך של כיתות עם שמות ומספר כיתות בשכבה
 * @returns {string} - רשימה מפורטת של כל הכיתות
 */
export const generateDetailedClassList = (classes) => {
    if (!classes || classes.length === 0) return "-";

    const classList = [];
    classes.forEach(grade => {
        for (let i = 1; i <= grade.classesInGrade; i++) {
            classList.push(`${grade.name}${i}`);
        }
    });

    return classList.join(", ");
};

