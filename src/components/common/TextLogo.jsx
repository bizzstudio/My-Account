// src/components/common/TextLogo.jsx
import React from "react";

const TextLogo = ({ text, size = "medium" }) => {
    const sizeClasses = {
        small: "text-lg sm:text-xl",
        medium: "text-2xl sm:text-3xl",
        large: "text-3xl sm:text-4xl md:text-[90px]",
    };

    return (
        <div className="flex items-center justify-center">
            <span className={`font-extrabold text-mainColor ${sizeClasses[size]}`}>
                {text}
            </span>
        </div>
    );
};

export default TextLogo;