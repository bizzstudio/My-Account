// src/components/tutorial/TutorialCard.jsx
import React from "react";
import { t } from "i18next";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import YouTubeVideoPreview from "@/components/product/YouTubeVideoPreview";

const TutorialCard = ({ tutorial, isAdmin, handleUpdate, handleModalOpen }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            {/* כותרת מעל הסרטון + כפתורי פעולה (רק לאדמין) */}
            <div className="flex items-start justify-between gap-2">
                {isAdmin && (
                    <div className="flex gap-2 flex-shrink-0">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 text-right leading-snug">
                    {tutorial.title}
                </h3>
                        <button
                            onClick={() => handleUpdate(tutorial._id)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            title={t("Edit")}
                        >
                            <FiEdit2 size={15} />
                        </button>
                        <button
                            onClick={() => handleModalOpen(tutorial._id, tutorial.title)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title={t("Delete")}
                        >
                            <FiTrash2 size={15} />
                        </button>
                    </div>
                )}
            </div>

            {/* סרטון */}
            {tutorial.videoUrl && (
                <div className="mt-1">
                    <YouTubeVideoPreview url={tutorial.videoUrl} />
                </div>
            )}
        </div>
    );
};

export default TutorialCard;
