// src/components/tutorial/TutorialCard.jsx
import React, { useState, useMemo } from "react";
import { t } from "i18next";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import YouTubeVideoPreview from "@/components/product/YouTubeVideoPreview";

const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    return null;
};

const VideoPopupModal = ({ url, title, onClose }) => {
    const videoId = useMemo(() => getYouTubeVideoId(url), [url]);
    if (!videoId) return null;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            dir="rtl"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                        aria-label={t("Close")}
                    >
                        ✕
                    </button>
                </div>
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                        title={title || "Video"}
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};

const TutorialCard = ({ tutorial, isAdmin, handleUpdate, handleModalOpen }) => {
    const [videoPopupUrl, setVideoPopupUrl] = useState(null);

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

            {/* סרטון — לחיצה פותחת פופאפ */}
            {tutorial.videoUrl && (
                <div className="mt-1">
                    <YouTubeVideoPreview
                        url={tutorial.videoUrl}
                        onClick={() => setVideoPopupUrl(tutorial.videoUrl)}
                    />
                </div>
            )}

            {videoPopupUrl && (
                <VideoPopupModal
                    url={videoPopupUrl}
                    title={tutorial.title}
                    onClose={() => setVideoPopupUrl(null)}
                />
            )}
        </div>
    );
};

export default TutorialCard;
