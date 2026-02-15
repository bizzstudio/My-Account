// src/components/chart/Nivo/GenericLineChart.jsx
import React, { useContext } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { timeFormat } from 'd3-time-format';
import { t } from 'i18next';
import { SidebarContext } from '@/context/SidebarContext';
import useCurrency from '@/hooks/useCurrency';
import { WindmillContext } from '@windmill/react-ui';

export default function GenericLineChart({
    data = [],                // מערך הנתונים המקורי
    xKey = 'date',            // שם השדה בציר X
    yKey = 'value',           // שם השדה בציר Y
    lineId = 'Line',          // מזהה הגרף (לטוליפ וללג'נד)
    xLabel = t('Date'),       // טקסט בציר X
    yLabel = t('Value'),      // טקסט בציר Y
    yFormat = " >-.2f",       // פורמט מספרים בציר Y
    tickValuesX = 5,          // מספר טיקים בציר X
    tickValuesY = 4,          // מספר טיקים בציר Y
    currency,                  // המטבע הנבחר
    currencySymbol,           // סמל המטבע
}) {
    const { rates } = useContext(SidebarContext);
    const { mode } = useContext(WindmillContext);

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const formatValue = (value) => {
        if (!value) return null;
        const cur = useCurrency(value);
        return cur.formatted;
    };

    // חישוב הערך הכי גדול וכמות הספרות שלו
    const maxValue = Math.max(...data.map(point => {
        const value = getNestedValue(point, yKey);
        return value !== null && value !== undefined ? Math.abs(value) : 0;
    }));
    
    const digitCount = maxValue > 0 ? Math.floor(Math.log10(maxValue)) + 1 : 1;
    const dynamicLeft = digitCount * 10 + 15;

    const lineData = [
        {
            id: lineId,
            data: data.map(point => ({
                x: getNestedValue(point, xKey),
                y: getNestedValue(point, yKey) ?? null,
                gainAmount: point.gainAmount,
                gainPercent: point.gainPercent
            })).filter(p => p.y !== null),
        },
    ];

    // הגדרת theme דינאמי לפי מצב
    const nivoTheme = {
        axis: {
            ticks: {
                text: {
                    fill: mode === 'dark' ? '#d1d5db' : '#374151', // צבע טקסט ה־ticks
                },
            },
            legend: {
                text: {
                    fill: mode === 'dark' ? '#d1d5db' : '#374151',
                },
            },
        },
        grid: {
            line: {
                stroke: mode === 'dark' ? '#374151' : '#e5e7eb', // כהה יותר ב-dark, בהיר ב-light
                strokeWidth: 1,
            },
        },
    };

    return (
        <div className='flex-grow w-full'>
            {lineData[0].data.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">{t('No data')}</p>
            ) : (
                <ResponsiveLine
                    data={lineData}
                    colors={['#eb8c42']} // צבע הקו
                    tooltip={({ point }) => {
                        const gainAmount = point.data.gainAmount;
                        const gainPercent = point.data.gainPercent;
                        const gainAmountCur = useCurrency(gainAmount);

                        return (
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded-md">
                                <strong>{xLabel}:</strong> {timeFormat('%b %d, %Y')(new Date(point.data.x))}<br />
                                <strong>{yLabel}:</strong> {formatValue(point.data.y)}
                                {gainAmount !== undefined && gainPercent !== undefined && (
                                    <p
                                        className={`text-sm ${gainAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}
                                    >
                                        {gainAmount >= 0 ? '+' : ''}
                                        {gainAmountCur.formatted}
                                        {' '}({gainPercent}%)
                                    </p>
                                )}
                            </div>
                        );
                    }}
                    enablePoints={false}
                    enableArea={true}
                    areaOpacity={0.08} // אטימות המילוי
                    enableGridX={false} // גריד בציר X
                    enableGridY={true} // גריד בציר Y
                    gridXValues={tickValuesX}
                    gridYValues={tickValuesY * 2}
                    margin={{ top: 40, right: 10, bottom: 60, left: dynamicLeft }}
                    xScale={{
                        type: 'time',
                        format: '%Y-%m-%d',
                        precision: 'day'
                    }}
                    yScale={{
                        type: 'linear',
                        min: (() => {
                            // בדיקה אם יש ערכים שליליים בנתונים
                            const hasNegativeValues = data.some(point => {
                                const value = getNestedValue(point, yKey);
                                return value !== null && value !== undefined && value < 0;
                            });
                            return hasNegativeValues ? 'auto' : 0;
                        })(),
                        max: 'auto',
                        stacked: true,
                        reverse: false
                    }}
                    yFormat={yFormat}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        format: '%b %d',
                        tickValues: tickValuesX,
                        // legend: xLabel,
                        legendOffset: 36,
                        legendPosition: 'middle'
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        // legend: yLabel,
                        legendOffset: -40,
                        legendPosition: 'middle',
                        truncateTickAt: 0,
                        tickValues: tickValuesY,
                        format: value => formatValue(value)
                    }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabel="data.yFormatted"
                    pointLabelYOffset={-12}
                    enableTouchCrosshair={true}
                    useMesh={true}
                    // legends={[
                    //     {
                    //         anchor: 'bottom-right',
                    //         direction: 'column',
                    //         translateX: 100,
                    //         itemWidth: 80,
                    //         itemHeight: 20,
                    //         symbolSize: 12,
                    //         symbolShape: 'circle',
                    //         effects: [
                    //             {
                    //                 on: 'hover',
                    //                 style: {
                    //                     itemBackground: 'rgba(0, 0, 0, .03)',
                    //                     itemOpacity: 1
                    //                 }
                    //             }
                    //         ]
                    //     }
                    // ]}
                    defs={[
                        {
                            id: 'gradientFill',
                            type: 'linearGradient',
                            colors: [
                                { offset: 0, color: '#eb8c42', opacity: 1 },
                                { offset: 100, color: '#eb8c42', opacity: 0.2 },
                            ],
                        }
                    ]}
                    fill={[
                        {
                            match: '*',
                            id: 'gradientFill',
                        },
                    ]}
                    theme={nivoTheme}
                />
            )}
        </div>
    );
};