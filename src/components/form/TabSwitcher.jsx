// TabSwitcher.jsx
import React, { useEffect } from 'react';

const TabSwitcher = ({ tabs = [{ id: '', label: '' }], activeTabId, setActiveTabId, disabled }) => {
    const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    const indicatorWidth = 100 / tabs.length;

    return (
        <div className={`w-full ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
            <div className="relative flex items-start justify-around p-1 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-[9px]">
                {/* אינדיקטור */}
                <div
                    className="absolute top-[2px] bg-mainColor z-[9] rounded-[7px] transition-all duration-300 ease-out shadow-md"
                    style={{
                        height: 'calc(100% - 4px)',
                        border: '0.5px solid rgba(0, 0, 0, 0.04)',
                        right: `${activeTabIndex * indicatorWidth}%`,
                        width: `${indicatorWidth}%`,
                    }}
                ></div>

                {/* כפתורי הכרטיסיות */}
                {tabs.map((tab, index) => (
                    <button
                        type='button'
                        key={tab.id}
                        className={`relative z-10 flex items-center justify-center w-full h-[28px] text-sm ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} transition-all duration-300 ${activeTabId === tab.id
                            ? 'opacity-100 text-white font-bold'
                            : 'opacity-60'
                            }`}
                        onClick={() => {
                            setActiveTabId(tab.id);
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* תוכן הכרטיסיות */}
            <div className="mt-4">
                {tabs.map(
                    (tab) => activeTabId === tab.id && <div key={tab.id}>{tab.content}</div>
                )}
            </div>
        </div>
    );
};

export default TabSwitcher;