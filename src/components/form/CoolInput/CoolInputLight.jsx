// CoolInputLight.jsx
import React, { useEffect } from 'react'
import styles from './style.module.css';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

// קומפוננטת אינפוט שמקבלת מילה לפלייסהולדר
export default function CoolInputLight({
    label = '',
    type,
    name,
    defaultValue,
    value,
    autoComplete = 'on',
    onChange = () => { },
    icon,
    isRequired = true,
    disabled = false,
}) {

    const { t } = useTranslation();

    let currentLang = Cookies.get('i18next');

    switch (currentLang) {
        case 'he':
            currentLang = true;
            break;
        case 'en':
            currentLang = false;
            break;
        default:
            currentLang = true;
            break;
    };

    useEffect(() => {
        const input = document.getElementById(name);
        if (input) {
            input.addEventListener('animationstart', (e) => {
                if (e.animationName === 'onAutoFillStart') {
                    // Trigger onChange event with the current value
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                }
            });
        }
    }, [name]);

    // פונקציה לפירוק הטקסט לקטעים עם כיוון מתאים ושמירה על עיצוב
    const formatLabel = (text) => {
        const regex = /[A-Za-z0-9]+|[^A-Za-z0-9]+/g; // מחלק את הטקסט למקטעים של מספרים/אנגלית או כל השאר
        const parts = text.match(regex);
        let globalIndex = 0;

        return parts.map((part, index) => {
            const isLTR = /[A-Za-z0-9]/.test(part); // בודק אם זה מספרים או אנגלית
            return (
                <span
                    key={index}
                    dir={isLTR ? 'ltr' : 'rtl'}
                    className="inline-flex"
                >
                    {part.split('').map((char) => (
                        <span
                            key={globalIndex}
                            className={`${styles.labelChar} bg-transparent text-p2-1`}
                            style={{ "--index": globalIndex++ }}
                        >
                            {char}
                        </span>
                    ))}
                </span>
            );
        });
    };

    return (
        <div className={`${styles.waveGroup}`} dir={currentLang ? 'rtl' : 'ltr'}>
            <input
                disabled={disabled}
                required={isRequired}
                type={type}
                className={`${styles.input} border-b border-b-p2-1 pt-3 pb-1 
                ${currentLang ? `${icon ? 'pl-9 pr-1' : 'px-1'}` : `${icon ? 'pr-9 pl-1' : 'px-1'}`}`}
                name={name}
                id={name}
                pattern={type === 'tel' ? '[0-9]*' : undefined} // אפשור של מספרים בלבד
                defaultValue={defaultValue}
                placeholder=''
                autoComplete={autoComplete}
                onChange={onChange}
                value={value}
            />
            <span className={`${styles.bar} after:bg-p2-2 before:bg-p2-2`} >
                {icon && <span className={`${styles.icon} text-p2-1 opacity-60`}>{icon}</span>}
            </span>
            <label className={`${styles.label} ${currentLang ? 'right-[5px]' : 'left-[5px]'}`}>
                {formatLabel(label)}
            </label>
        </div>
    )
};