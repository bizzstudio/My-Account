// src/components/form/SelectReactSelect.jsx
import React, { useContext } from 'react';
import Select, { components } from 'react-select';
import { WindmillContext } from "@windmill/react-ui";
import { FaUser } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

const SelectReactSelect = ({
    placeholder,
    options,
    onChange,
    value,
    images = true,
    isSearchable = false,
    minWidth = 200
}) => {
    const { mode } = useContext(WindmillContext);
    const { t } = useTranslation();

    // קומפוננטת עיצוב מותאמת אישית להצגת התמונה ליד שם המשתמש
    const CustomOption = (props) => (
        <components.Option {...props}>
            {images ?
                <div className="flex items-center gap-2 p-1">
                    {/* תמונה */}
                    {props.data.image ? (
                        <img
                            src={props.data.image}
                            alt={props.data.label}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                            <FaUser size={12} />
                        </div>
                    )}
                    {props.data.label}
                </div> :
                <>{props.data.label}</>
            }
        </components.Option>
    );

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
            minWidth: minWidth,
            '&:hover': {
                borderColor: state.isFocused ? 'var(--main-color)' : mode === 'dark' ? 'var(--main-color)' : provided.borderColor,
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            minHeight: '46px',
            padding: '6px',
            overflow: 'hidden',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: mode === 'dark' ? '#d1d5db' : '#374151',
            fontWeight: '500',
            fontSize: '14px',
        }),
        option: (provided, state) => ({
            ...provided,
            padding: '3px 10px',
            backgroundColor: state.isSelected 
                ? 'var(--main-color)'
                : mode === 'dark'
                    ? state.isFocused ? '#334155' : '#1F2937'
                    : state.isFocused ? 'var(--main-color-super-light)' : provided.backgroundColor,
            color: state.isSelected 
                ? '#fff'
                : mode === 'dark' ? '#D1D5DB' : state.isFocused ? '#000' : provided.color,
        }),
        placeholder: (provided) => ({
            ...provided,
            fontSize: '14px',
            color: mode === 'dark' ? '#d1d5db' : '#000',
            fontWeight: '400',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 100 }),
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
            isMulti={false}
            options={options}
            components={{ Option: CustomOption }}
            onChange={onChange}
            closeMenuOnSelect={true}
            styles={customStyles}
            menuPlacement='auto'
            value={value}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            isSearchable={isSearchable}
            noOptionsMessage={() => t('noOptionsMessage')}
        />
    );
};

export default SelectReactSelect;
