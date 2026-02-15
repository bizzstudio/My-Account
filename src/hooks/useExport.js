// src/hooks/useExport.js
import { useCallback, useContext } from 'react';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { t } from "i18next";
import { SidebarContext } from "@/context/SidebarContext";

dayjs.locale('he');

/**
 * Hook for exporting data to Excel
 * @param {Array} data - Array of objects to export
 * @param {Array} fields - Array of field configurations with key and label
 * @param {string} filename - Name of the Excel file (without extension)
 * @returns {Object} - Export function and loading state
 */
const useExport = () => {
    const { lang } = useContext(SidebarContext) || {};
    const exportToExcel = useCallback((data, fields, filename = 'export') => {
        if (!Array.isArray(data) || data.length === 0) {
            console.warn('No data to export');
            return;
        }

        if (!Array.isArray(fields) || fields.length === 0) {
            console.warn('No fields configuration provided');
            return;
        }

        try {
            // Helper function to get nested object values
            const getNestedValue = (obj, path) => {
                return path.split('.').reduce((current, key) => {
                    if (current === null || current === undefined) return '';
                    return current[key];
                }, obj);
            };

            // Helper function to format values
            const formatValue = (value, key, item = null) => {
                if (value === null || value === undefined) return '';

                // Handle date fields
                if (key.includes('Date') || key.includes('At') || key === 'date') {
                    if (value) {
                        return dayjs(value).format('DD/MM/YYYY HH:mm');
                    }
                    return '';
                }

                // Handle boolean fields
                if (typeof value === 'boolean') {
                    return value ? t('Yes') : t('No');
                }

                // Handle status fields
                if (key === 'status') {
                    return value === 'active' ? t('Active') : t('Inactive');
                }

                // Handle cargoType – הצגה דרך תרגום, בלי מספרים
                if (key === 'cargoType') {
                    return value != null ? t(`CargoType_${value}`) : '';
                }

                // Handle quantityType field
                if (key === 'quantityType') {
                    const typeMap = {
                        'unit': t('Unit'),
                        'kg': t('Kilogram'),
                        'liter': t('Liter'),
                        'box': t('Box'),
                        'carton': t('Carton'),
                        'other': t('Other')
                    };
                    return typeMap[value] || value;
                }

                // Handle language field
                if (key === 'language') {
                    return value === 'hebrew' ? t('Hebrew') : value;
                }

                // Handle training type field - include topic if exists and not info-meeting
                if (key === 'type') {
                    const typeMap = {
                        'guardian-training': 'הדרכת אפוטרופוסים',
                        'info-meeting': 'פגישת מידע',
                        'exposure-lecture': 'הרצאת חשיפה'
                    };
                    const typeLabel = typeMap[value] || value;

                    // אם יש נושא וזה לא פגישת מידע, נוסיף את הנושא
                    if (item && item.topic && value !== 'info-meeting') {
                        return `${typeLabel} - ${item.topic}`;
                    }

                    return typeLabel;
                }

                // Handle duration field (for trainings)
                if (key === 'duration') {
                    if (!value) return '-';
                    const hours = Math.floor(value / 60);
                    const mins = value % 60;
                    if (hours > 0 && mins > 0) {
                        return `${hours} ${t('Hours')} ${mins} ${t('Minutes')}`;
                    } else if (hours > 0) {
                        return `${hours} ${t('Hours')}`;
                    }
                    return `${mins} ${t('Minutes')}`;
                }

                // Handle topics array field (for lecturers)
                if (key === 'topics' && Array.isArray(value)) {
                    return value.length > 0 ? value.join(', ') : '-';
                }

                // Handle trainingsCount object field (for lecturers) - now returns {total, byType}
                if (key === 'trainingsCount' && typeof value === 'object' && value !== null) {
                    return value.total || 0;
                }

                // Handle trainings array field (for registrants) - show all trainings concatenated
                if (key === 'trainings' && Array.isArray(value)) {
                    if (value.length === 0) return '-';
                    const typeMap = {
                        'guardian-training': t('GuardianTraining'),
                        'info-meeting': t('InfoMeeting'),
                        'exposure-lecture': t('ExposureLecture')
                    };
                    return value.map(t => {
                        const training = t.training;
                        if (!training) return '';
                        const date = training.date ? dayjs(training.date).format('DD/MM/YYYY') : '';

                        // בניית טקסט ההדרכה - אם זה פגישת מידע רק הסוג, אחרת סוג - נושא
                        let trainingText;
                        if (training.type === 'info-meeting') {
                            trainingText = typeMap[training.type] || training.type;
                        } else {
                            const typeLabel = typeMap[training.type] || training.type;
                            trainingText = training.topic
                                ? `${typeLabel} - ${training.topic}`
                                : typeLabel;
                        }

                        return `${trainingText}${date ? ` (${date})` : ''}`.trim();
                    }).filter(Boolean).join(' | ') || '-';
                }

                // Handle images array - join URLs with line break
                if (key === 'images' && Array.isArray(value)) {
                    return value.length > 0 ? value.join(', ') : '';
                }

                // Handle tags, additionalCategories, seoKeywords arrays - join with comma
                if ((key === 'tags' || key === 'additionalCategories' || key === 'seoKeywords') && Array.isArray(value)) {
                    return value.length > 0 ? value.join(', ') : '';
                }

                // Handle array fields (generic)
                if (Array.isArray(value)) {
                    return value.length > 0 ? value.join(', ') : '';
                }

                // Handle HTML fields - keep HTML as-is for description fields
                if (key === 'description' || key === 'shortDescription' || key === 'longDescription') {
                    return value || '';
                }

                // Handle object fields (like lecturer, training, owner)
                if (typeof value === 'object' && value !== null) {
                    if (value.fullName) return value.fullName;
                    if (value.name) return value.name;
                    if (value.topic) return value.topic;
                    if (value.email) return value.email;
                    return JSON.stringify(value);
                }

                // Handle empty strings
                if (value === '') return '';

                return value.toString();
            };

            // Prepare data for Excel
            const excelData = data.map(item => {
                const row = {};
                fields.forEach(field => {
                    // אם יש getValue custom, נשתמש בו
                    const value = field.getValue
                        ? field.getValue(item)
                        : getNestedValue(item, field.key);
                    row[field.label] = formatValue(value, field.key, item);
                });
                return row;
            });

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            // Apply RTL only when language is Hebrew
            workbook.Workbook = workbook.Workbook || {};
            workbook.Workbook.Views = [{ RTL: true }];
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const columnWidths = fields.map(field => ({
                wch: Math.max(field.label.length, 15) // Minimum width of 15
            }));
            worksheet['!cols'] = columnWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

            // Generate filename with timestamp
            const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
            const fullFilename = `${filename}_${timestamp}.xlsx`;

            // Save file
            XLSX.writeFile(workbook, fullFilename);

            console.log(`Excel file exported successfully: ${fullFilename}`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    }, []);

    return {
        exportToExcel
    };
};

export default useExport;
