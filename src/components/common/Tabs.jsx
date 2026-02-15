// src/components/common/Tabs.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Tabs = ({ tabs = [{ label: { id: '', label: <></>, content: <></> }, onClick: () => { } }], tab = 'tab', fitContent = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const initialTab = query.get(tab) || tabs[0]?.id || '';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isInitialMount, setIsInitialMount] = useState(true);
    const [tabWidths, setTabWidths] = useState({});
    const [tabPositions, setTabPositions] = useState({});
    const [tabTopPositions, setTabTopPositions] = useState({});
    const tabRefs = useRef({});
    const containerRef = useRef(null);

    // עדכון הכרטיסייה ב-URL כאשר הכרטיסייה משתנה
    useEffect(() => {
        navigate(`?${tab}=${activeTab}`, { replace: true });
        if (tabs.find((tab) => tab.id === activeTab)?.onClick) {
            tabs.find((tab) => tab.id === activeTab).onClick();
        }
        if (isInitialMount) {
            setIsInitialMount(false);
        }
    }, [activeTab, navigate, tab, tabs, isInitialMount]);

    // פונקציה למדידת רוחב ומיקום של כל כפתור
    const measureTabs = () => {
        if (fitContent && containerRef.current) {
            const widths = {};
            const positions = {};
            const topPositions = {};
            const containerRect = containerRef.current.getBoundingClientRect();
            const containerInlineStartX = containerRect.x;
            const containerInlineEndX = containerRect.x + containerRect.width;
            const containerTopY = containerRect.y;
            const dir = getComputedStyle(containerRef.current).direction; // 'ltr' | 'rtl'

            tabs.forEach((tabItem) => {
                const buttonRef = tabRefs.current[tabItem.id];
                if (buttonRef) {
                    const width = buttonRef.offsetWidth;
                    widths[tabItem.id] = width;
                    // משתמשים ב-getBoundingClientRect כדי לקבל את המיקום האמיתי אחרי justify-evenly,
                    // ואז ממירים למיקום לוגי (inline-start) בלי שימוש ב-left/right.
                    const buttonRect = buttonRef.getBoundingClientRect();
                    const buttonInlineStartX = buttonRect.x;
                    const buttonInlineEndX = buttonRect.x + buttonRect.width;
                    const buttonTopY = buttonRect.y;

                    const inlineStartOffset =
                        dir === 'rtl'
                            ? containerInlineEndX - buttonInlineEndX
                            : buttonInlineStartX - containerInlineStartX;

                    const topOffset = buttonTopY - containerTopY;

                    positions[tabItem.id] = inlineStartOffset;
                    topPositions[tabItem.id] = topOffset;
                }
            });

            setTabWidths(widths);
            setTabPositions(positions);
            setTabTopPositions(topPositions);
        }
    };

    // מדידת רוחב ומיקום של כל כפתור כאשר fitContent מופעל
    useEffect(() => {
        if (fitContent && containerRef.current) {
            // משתמשים ב-setTimeout כדי לוודא שהמדידה מתבצעת אחרי ה-render
            const timeoutId = setTimeout(measureTabs, 0);

            // משתמשים ב-ResizeObserver כדי למדוד מחדש כאשר הרוחב משתנה
            const resizeObserver = new ResizeObserver(() => {
                measureTabs();
            });

            // עוקבים אחרי ה-container כדי לזהות שינויים ב-justify-evenly
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }

            tabs.forEach((tabItem) => {
                const buttonRef = tabRefs.current[tabItem.id];
                if (buttonRef) {
                    resizeObserver.observe(buttonRef);
                }
            });

            return () => {
                clearTimeout(timeoutId);
                resizeObserver.disconnect();
            };
        }
    }, [fitContent, tabs, activeTab]);

    const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabObj = tabs.find(tab => tab.id === activeTab);
    const activeColor = activeTabObj?.color || "var(--main-color)";

    let indicatorStyle = {};
    if (fitContent) {
        // חלוקה לפי רוחב
        const activeWidth = tabWidths[activeTab] || 0;
        const activePosition = tabPositions[activeTab] || 0;
        const activeTopPosition = tabTopPositions[activeTab] || 0;
        const activeButtonRef = tabRefs.current[activeTab];
        const activeHeight = activeButtonRef?.offsetHeight || 0;
        
        indicatorStyle = {
            height: `${Math.max(activeHeight - 4, 0)}px`,
            border: '0.5px solid rgba(0, 0, 0, 0.04)',
            insetInlineStart: `${activePosition + 2}px`,
            top: `${activeTopPosition + 2}px`,
            width: `${Math.max(activeWidth - 4, 0)}px`,
        };
    } else {
        // חלוקה שווה
        const indicatorWidth = 100 / tabs.length;
        indicatorStyle = {
            height: 'calc(100% - 4px)',
            border: '0.5px solid rgba(0, 0, 0, 0.04)',
            insetInlineStart: `calc(${activeTabIndex * indicatorWidth}% + 2px)`,
            top: '2px',
            width: `calc(${indicatorWidth}% - 4px)`,
        };
    }

    return (
        <div className="w-full">
            <div
                ref={containerRef}
                className={`relative ${fitContent ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-2' : 'flex justify-around'} bg-gray-200 dark:bg-gray-700 dark:text-white rounded-[9px]`}
            >
                {/* אינדיקטור */}
                <div
                    className="absolute z-9 rounded-[7px] transition-all duration-300 ease-out shadow-md"
                    style={{
                        ...indicatorStyle,
                        backgroundColor: activeColor,
                    }}
                ></div>

                {/* כפתורי הכרטיסיות */}
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        ref={(el) => (tabRefs.current[tab.id] = el)}
                        className={`relative py-3 z-10 flex items-center justify-center
                            ${fitContent ? 'w-full px-2 rounded-md' : 'w-full'}
                            text-base cursor-pointer transition-all duration-300
                            ${activeTab === tab.id ? 'opacity-100 text-white font-bold '
                                : 'opacity-60'
                            }
                        `}

                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.onClick) {
                                tab.onClick();
                            }
                        }}
                    >
                        <span
                            className="relative inline-flex flex-col items-center"
                        >
                            {/* הטקסט */}
                            <span>
                                {tab.label}
                            </span>

                            {/* קו תחתון */}
                            <span
                                style={{
                                    width: "70%",
                                    height: "2px",
                                    backgroundColor:
                                        activeTab === tab.id
                                            ? "#fff"
                                            : tab.color || "transparent",

                                    marginTop: 2,
                                }}
                            />
                        </span>
                        {/* <span
                            style={{
                                borderTop: `2px solid ${tab.color || 'transparent'}`,
                                borderBottom: `2px solid ${tab.color || 'transparent'}`,
                                paddingTop: 2,
                                paddingBottom: 2,
                            }}
                        >
                            {tab.label}
                        </span> */}



                    </button>
                ))}
            </div>

            {/* תוכן הכרטיסיות */}
            <div className="mt-4">
                {tabs.map(
                    (tab) =>
                        activeTab === tab.id && <div key={tab.id}>{tab.content}</div>
                )}
            </div>
        </div>
    );
};

export default Tabs;