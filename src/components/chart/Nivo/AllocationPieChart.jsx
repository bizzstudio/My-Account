// src/components/chart/Nivo/AllocationPieChart.jsx
import React, { useState, useContext, useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { Select, WindmillContext } from '@windmill/react-ui';
import { t } from 'i18next';
import getSymbolFromCurrency from 'currency-symbol-map';
import { SidebarContext } from '@/context/SidebarContext';

export default function AllocationPieChart({ 
  data = [], 
  height = '380px',
  currency,
  currencySymbol
}) {
    const [groupBy, setGroupBy] = useState('category');
    const { rates } = useContext(SidebarContext);
    const { mode } = useContext(WindmillContext);

    // Find the correct group data based on selected groupBy
    const selectedGroup = data.find(group => group.groupBy === groupBy);
    
    // Convert USD to selected currency using rates directly
    const convertUsdToSelectedCurrency = (valueUsd) => {
        const value = Number(valueUsd) || 0;
        if (currency === "USD") return value;
        const rate = rates?.[currency] ?? 1;
        return value * rate;
    };
    
    // Format a currency value with symbol
    const formatCurrency = (value) => {
        return `${currencySymbol || currency} ${value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    // Transform the data for the pie chart
    const pieData = useMemo(() => {
        if (!selectedGroup?.breakdown) return [];
        
        return selectedGroup.breakdown.map(item => {
            const convertedValue = convertUsdToSelectedCurrency(item.valueUSD);
            
            return {
                id: item.category,
                label: `${item.category}`,
                value: Math.round(item.valueUSD),
                formattedValue: formatCurrency(convertedValue),
                rawValue: convertedValue,
                percentage: item.sharePercent.toFixed(1) + '%',
                originalLabel: item.category
            };
        });
    }, [selectedGroup, currency, rates]);

    return (
        <div>
            <Select
                className="!w-fit h-fit absolute top-1 right-1"
                value={groupBy}
                onChange={e => setGroupBy(e.target.value)}
            >
                <option value="category">{t("By Investment Category")}</option>
                <option value="currency">{t("By Currency")}</option>
                <option value="account">{t("By Account")}</option>
            </Select>

            <div style={{ height }}>
                {pieData.length === 0 ? (
                    <p className="text-gray-500">{t("No data")}</p>
                ) : (
                    <ResponsivePie
                        data={pieData}
                        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                        innerRadius={0.5}
                        padAngle={0.7}
                        cornerRadius={3}
                        activeOuterRadiusOffset={8}
                        borderWidth={1}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 0.2]]
                        }}
                        arcLinkLabelsSkipAngle={1}
                        arcLinkLabelsDiagonalLength={15}
                        arcLinkLabelsStraightLength={10}
                        arcLinkLabelsTextColor={mode === 'dark' ? '#9ca3af' : '#333333'}
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsColor={{ from: 'color' }}
                        arcLinkLabel={d => `${d.data.originalLabel} (${d.data.percentage})`}
                        arcLabelsSkipAngle={20}
                        arcLabels={d => d.data.formattedValue}
                        // arcLabelsTextColor="#ffffff"
                        tooltip={({ datum }) => (
                            <div style={{
                                background: 'white',
                                padding: '9px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}>
                                <strong>{datum.data.originalLabel}</strong>
                                <div>
                                    {datum.data.formattedValue} ({datum.data.percentage})
                                </div>
                            </div>
                        )}
                        arcLabelsTextColor={{
                            from: 'color',
                            modifiers: [['darker', 2]]
                        }}
                        defs={[
                            {
                                id: 'dots',
                                type: 'patternDots',
                                background: 'inherit',
                                color: 'rgba(255, 255, 255, 0.3)',
                                size: 4,
                                padding: 1,
                                stagger: true
                            },
                            {
                                id: 'lines',
                                type: 'patternLines',
                                background: 'inherit',
                                color: 'rgba(255, 255, 255, 0.3)',
                                rotation: -45,
                                lineWidth: 6,
                                spacing: 10
                            }
                        ]}
                        // fill={[
                        //     {
                        //         match: {
                        //             id: 'ruby'
                        //         },
                        //         id: 'dots'
                        //     },
                        //     {
                        //         match: {
                        //             id: 'c'
                        //         },
                        //         id: 'dots'
                        //     },
                        //     {
                        //         match: {
                        //             id: 'go'
                        //         },
                        //         id: 'dots'
                        //     },
                        //     {
                        //         match: {
                        //             id: 'python'
                        //         },
                        //         id: 'dots'
                        //     },
                        //     {
                        //         match: {
                        //             id: 'scala'
                        //         },
                        //         id: 'lines'
                        //     },
                        //     {
                        //         match: {
                        //             id: 'lisp'
                        //         },
                        //         id: 'lines'
                        //     },
                        //     {
                        //         match: {
                        //             id: 'elixir'
                        //         },
                        //         id: 'lines'
                        //     },
                        //     {
                        //         match: {
                        //             id: 'javascript'
                        //         },
                        //         id: 'lines'
                        //     }
                        // ]}
                        legends={[
                            {
                                anchor: 'bottom',
                                direction: 'row',
                                justify: false,
                                translateX: 0,
                                translateY: 56,
                                itemsSpacing: 25,
                                itemWidth: 100,
                                itemHeight: 18,
                                itemTextColor: '#999',
                                itemDirection: 'left-to-right',
                                itemOpacity: 1,
                                symbolSize: 18,
                                symbolShape: 'circle',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: '#000'
                                        }
                                    }
                                ]
                            }
                        ]}
                        valueFormat={value => {
                            const item = pieData.find(item => item.value === value);
                            return item ? item.formattedValue : '';
                        }}
                    />
                )}
            </div>
        </div>
    );
}
