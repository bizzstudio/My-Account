// Tooltip2.jsx
import React from 'react';
import { GrTextAlignFull } from "react-icons/gr";

const Tooltip2 = ({
    tooltipContent,
    buttonText = "Hover for Info"
}) => {
    return (
        <div className="relative inline-block group">
            {/* הכפתור/אלמנט שמופיע לפני הריחוף */}
            <span className="text-sm text-center">{buttonText}</span>

            {/* התוכן שיופיע בעת ריחוף (Tooltip) */}
            <div className="absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-3 w-max transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2">
                <div className="relative p-4 bg-white dark:bg-gray-600 backdrop-blur-md rounded-2xl shadow-around">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center p-2 rounded-full bg-mainColor dark:bg-mainColor-dark text-white">
                            <GrTextAlignFull size={20} />
                        </div>

                        <div className="text-sm break-words whitespace-pre-wrap dark:text-white max-w-72">
                            {tooltipContent}
                        </div>
                    </div>

                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-600 rotate-45" />
                </div>
            </div>
        </div>
    );
}

export default Tooltip2;