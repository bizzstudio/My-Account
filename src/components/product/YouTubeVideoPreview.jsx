// src/components/product/YouTubeVideoPreview.jsx
import React, { useMemo } from "react";
import { t } from "i18next";

const YouTubeVideoPreview = ({ url }) => {
    // פונקציה לחילוץ ID מה-URL של יוטיוב
    const getYouTubeId = (url) => {
        if (!url) return null;

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    };

    const videoId = useMemo(() => getYouTubeId(url), [url]);

    if (!url || !videoId) {
        return (
            <div className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("YouTubeVideoUrlPlaceholder")}
                </p>
            </div>
        );
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
        <div className="w-full">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative w-full rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                style={{ paddingBottom: "56.25%" }}
            >
                <img
                    src={thumbnailUrl}
                    alt=""
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                />
            </a>
        </div>
    );
};

export default YouTubeVideoPreview;
