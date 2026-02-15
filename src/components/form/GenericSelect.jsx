// src/components/form/GenericSelect.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { WindmillContext } from "@windmill/react-ui";

const GenericSelect = ({
    options,               // מערך האופציות: [{ value, label (JSX או string) }]
    selected,              // ערך שנבחר כרגע (value)
    onChange,              // פונקציית שינוי (value) => {}
    isSearchable = false,  // האם לאפשר חיפוש
    minWidth = 80,         // רוחב מינימלי
}) => {
    const { mode } = useContext(WindmillContext);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minWidth: isMobile ? "fit-content" : minWidth,
            backgroundColor: mode === "dark" ? "#2D3748" : "white",
            borderColor: state.isFocused ? "#eb8c42" : mode === "dark" ? "#4b5563" : "#ccc",
            color: mode === "dark" ? "white" : "black",
            boxShadow: "none",
            fontSize: "0.9rem",
            direction: "ltr",
            "&:hover": { borderColor: "#eb8c42" },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: mode === "dark" ? "#2D3748" : "white",
            zIndex: 9999,
        }),
        singleValue: (provided) => ({
            ...provided,
            color: mode === "dark" ? "white" : "black",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused
                ? mode === "dark" ? "#4A5568" : "#E2E8F0"
                : mode === "dark" ? "#2D3748" : "white",
            color: mode === "dark" ? "white" : "black",
            cursor: "pointer",
        }),
        input: (provided) => ({
            ...provided,
            color: mode === "dark" ? "white" : "black",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: mode === "dark" ? "#A0AEC0" : "#718096",
        }),
    };

    return (
        <div style={{ minWidth: minWidth }}>
            <Select
                options={options}
                styles={customStyles}
                value={options.find((opt) => opt.value === selected)}
                onChange={(selectedOption) => onChange(selectedOption.value)}
                isSearchable={isSearchable}
            />
        </div>
    );
};

export default GenericSelect;