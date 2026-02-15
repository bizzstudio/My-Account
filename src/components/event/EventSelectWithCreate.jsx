// src/components/event/EventSelectWithCreate.jsx
import React, { useState, useContext } from 'react';
import Select, { components } from 'react-select';
import { WindmillContext } from "@windmill/react-ui";
import { FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { notifyWarning } from '@/utils/toast';

const EventSelectWithCreate = ({
    placeholder,
    value,
    onChange,
    onCreateClick,
    schoolId,
    events = [],
    disabled = false
}) => {
    const { mode } = useContext(WindmillContext);
    const { t } = useTranslation();

    // סינון אירועים לפי בית הספר שנבחר
    // מטפל גם ב-ObjectId וגם באובייקט populate
    const filteredEvents = schoolId
        ? events.filter(event => {
            const eventSchoolId = typeof event.school === 'object' && event.school !== null
                ? event.school._id
                : event.school;
            return eventSchoolId === schoolId;
        })
        : [];

    // המרה לפורמט react-select
    const eventOptions = filteredEvents.map(event => ({
        value: event._id,
        label: event.title,
        // color: event.color, // הוסר - צבעים לא בשימוש
        isCreateOption: false
    }));

    // הוספת אופציית "צור אירוע חדש" רק אם יש בית ספר נבחר
    const allOptions = schoolId
        ? [
            ...eventOptions,
            {
                value: '__create_new__',
                label: t('AddEvent'),
                isCreateOption: true
            }
        ]
        : []; // כשאין בית ספר, לא נציג אופציות

    // קומפוננטה מותאמת להצגת אופציית "צור חדש"
    const CustomOption = (props) => {
        if (props.data.isCreateOption) {
            return (
                <components.Option {...props}>
                    <div className="flex items-center gap-2 font-semibold text-mainColor hover:text-mainColor">
                        <FiPlus size={18} />
                        <span>{props.data.label}</span>
                    </div>
                </components.Option>
            );
        }

        return (
            <components.Option {...props}>
                {/* הוסר - הצגת צבע */}
                {/* <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: props.data.color || '#ccc' }}
                    />
                    <span>{props.data.label}</span>
                </div> */}
                <span>{props.data.label}</span>
            </components.Option>
        );
    };

    // קומפוננטה מותאמת להצגת הערך שנבחר
    const CustomSingleValue = (props) => {
        if (props.data.isCreateOption) {
            return null;
        }

        return (
            <components.SingleValue {...props}>
                {/* הוסר - הצגת צבע */}
                {/* <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: props.data.color || '#ccc' }}
                    />
                    <span>{props.data.label}</span>
                </div> */}
                <span>{props.data.label}</span>
            </components.SingleValue>
        );
    };

    const handleChange = (selectedOption) => {
        if (selectedOption?.isCreateOption) {
            onCreateClick();
        } else {
            onChange(selectedOption ? selectedOption.value : '');
        }
    };

    // טיפול בפתיחת התפריט - הצגת התראה אם אין בית ספר
    const handleMenuOpen = () => {
        if (!schoolId && !disabled) {
            notifyWarning(t('PleaseSelectSchoolFirst'));
        }
    };

    // מציאת האופציה שנבחרה
    const selectedOption = eventOptions.find(opt => opt.value === value) || null;

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? 'var(--main-color)' : provided.borderColor,
            minHeight: '46px',
            backgroundColor: mode === 'dark' ? '#374151' : "#f3f4f6",
            color: mode === 'dark' ? '#D1D5DB' : provided.color,
            boxShadow: state.isFocused ? `0 0 0 1px var(--main-color)` : provided.boxShadow,
            outline: 'none',
            border: mode === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--main-color)' : mode === 'dark' ? 'var(--main-color)' : provided.borderColor,
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            minHeight: '46px', // גובה מינימלי
            maxHeight: '122px', // גובה אוטומטי
            height: 'auto', // גובה אוטומטי
            padding: '6px', // padding אחיד
            overflow: 'auto',
            flexWrap: 'wrap', // מאפשר מעבר לשורה חדשה
            // alignItems: 'flex-start', // יישור למעלה
        }),
        option: (provided, state) => ({
            ...provided,
            padding: '3px 10px',
            backgroundColor: mode === 'dark'
                ? state.isFocused ? '#334155' : '#1F2937'
                : state.isFocused ? 'var(--main-color-super-light)' : provided.backgroundColor,
            color: mode === 'dark' ? '#D1D5DB' : state.isFocused ? '#000' : provided.color,
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: mode === 'dark' ? '#4B5563' : '#E5E7EB',  // צבע רקע של הערך הנבחר
            borderRadius: '6px',
            padding: '3px 8px',
            marginRight: '5px',
            marginBottom: '2px', // מרווח בין שורות
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: mode === 'dark' ? '#F3F4F6' : '#374151',  // צבע טקסט של הערך הנבחר
            fontWeight: '500',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: mode === 'dark' ? '#F3F4F6' : '#374151',
            '&:hover': {
                backgroundColor: 'var(--main-color)',
                color: '#fff',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            fontSize: '14px',  // שינוי גודל הטקסט של ה-placeholder
            color: mode === 'dark' ? '#d1d5db' : '#000',  // שינוי צבע ה-placeholder
            fontWeight: '400',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 100 }), // הוספת z-index גבוה
        menu: (provided) => ({
            ...provided,
            backgroundColor: mode === 'dark' ? '#1F2937' : '#fff',
            border: mode === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
            boxShadow: mode === 'dark'
                ? '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.3)'
                : provided.boxShadow,
            zIndex: 100,
        }),
        menuList: (provided) => ({
            ...provided,
            backgroundColor: mode === 'dark' ? '#1F2937' : '#fff',
            paddingTop: 0,
            paddingBottom: 0,
            maxHeight: 240,
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            backgroundColor: mode === 'dark' ? '#1F2937' : '#fff',
            color: mode === 'dark' ? '#D1D5DB' : '#374151',
        }),
        input: (provided) => ({
            ...provided,
            color: mode === 'dark' ? '#D1D5DB' : '#374151',
        }),
    };

    return (
        <Select
            placeholder={placeholder}
            options={allOptions}
            components={{
                Option: CustomOption,
                SingleValue: CustomSingleValue
            }}
            onChange={handleChange}
            onMenuOpen={handleMenuOpen}
            styles={customStyles}
            menuPlacement='auto'
            value={selectedOption}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            noOptionsMessage={() => t('noEventFound')}
            isDisabled={disabled}
            isClearable
        />
    );
};

export default EventSelectWithCreate;

