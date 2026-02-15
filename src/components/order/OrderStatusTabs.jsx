// src/components/order/OrderStatusTabs.jsx
import React, { useMemo } from "react";
import { t } from "i18next";
import Tabs from "@/components/common/Tabs";

const OrderStatusTabs = ({ statuses = [] }) => {
    /**
     * בונים את הטאבים בפורמט ש-Tabs מצפה לו
     * ה-QUERY עצמו מנוהל בתוך Tabs (status)
     */
    const tabs = useMemo(() => {
        const allTab = {
            id: "", // ALL = אין status ב-query
            label: <span>{t("All")}</span>,
            color: "var(--main-color)"
        };

        const statusTabs = statuses.map((status) => ({
            id: status.name,
            label: <span className="whitespace-nowrap">{status.label}</span>,
            color: status.color, // 👈 הצבע של הסטטוס
        }));

        return [allTab, ...statusTabs];
    }, [statuses]);

    return (
        <Tabs
            tabs={tabs}
            tab="status"     // ?status=...
            fitContent       // רוחב לפי תוכן
        />
    );
};

export default OrderStatusTabs;
