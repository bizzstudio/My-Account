// AutoDirectionQuill.jsx
import React, { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const AutoDirectionQuill = ({ value, onChange, modules = {}, placeholder = "" }) => {
    const quillRef = useRef(null);

    // שמירה בסטייט על הכיוון הנוכחי כדי למנוע עדכונים מיותרים
    const [textDirection, setTextDirection] = useState("");

    // פונקציה לבדיקת כיוון טקסט
    const determineDirection = (text) => {
        // ניקוי התוכן מתגיות HTML
        const plainText = text.replace(/<\/?[^>]+(>|$)/g, "").trim();

        // אם התוכן ריק לאחר הסרת התגיות, נקבע RTL כברירת מחדל
        if (!plainText || plainText.length === 0) {
            return "rtl";
        };

        // בדיקה אם התו הראשון הוא בעברית
        const hebrewRegex = /[\u0590-\u05FF]/; // טווח התווים בעברית
        return hebrewRegex.test(plainText.charAt(0)) ? "rtl" : "ltr";
    };

    // עדכון כיוון טקסט בתיבת ReactQuill
    const updateQuillDirection = (direction) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        // בודקים את מצב הפורמט הנוכחי
        const currentFormats = quill.getFormat();
        const currentDirection = currentFormats.direction;
        const currentAlign = currentFormats.align;

        // תמיד נעדכן אם currentDirection או currentAlign הם undefined
        if (currentDirection === undefined || currentAlign === undefined || currentDirection !== direction) {
            // console.log("Updating direction to: ", direction, "and align to: ", direction === "rtl" ? "right" : "left")
            // todo: fix this bullshit 😡
            quill.format("direction", direction);
            quill.format("align", direction === "rtl" ? "right" : "left");
        }
    };

    // שינוי כיוון הטקסט לפי התו הראשון
    const handleQuillChange = (content) => {
        const direction = determineDirection(content);

        // מעדכנים רק אם הכיוון באמת השתנה
        if (direction !== textDirection) {
            setTextDirection(direction);
            updateQuillDirection(direction);
        };

        // מעבירים למעלה את התוכן המעודכן
        onChange(content);
    };

    useEffect(() => {
        // הגדרת כיוון ראשוני בעת טעינת התוכן או שינוי של value מבחוץ
        const initialDirection = determineDirection(value || "");
        if (initialDirection !== textDirection) {
            setTextDirection(initialDirection);
            // אפשר לעדכן את העורך רק אם באמת יש שינוי
            updateQuillDirection(initialDirection);
        }
    }, [value]);

    return (
        <ReactQuill
            ref={quillRef}
            value={value}
            onChange={handleQuillChange}
            theme="snow"
            modules={{
                ...modules,
                toolbar: modules.toolbar?.container || [
                    [{ header: [1, 2, 3, false] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }],
                    [{ align: [] }],
                    ["link"],
                    [{ indent: "-1" }, { indent: "+1" }],
                    [{ direction: "rtl" }],
                    [{ background: [] }],
                ],
            }}
            placeholder={placeholder}
        />
    );
};

export default AutoDirectionQuill;