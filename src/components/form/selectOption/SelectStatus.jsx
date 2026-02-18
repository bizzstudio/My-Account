import React, { useContext, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { WindmillContext } from "@windmill/react-ui";

import { SidebarContext } from "@/context/SidebarContext";
import OrderServices from "@/services/OrderServices";
import { notifySuccess, notifyError } from "@/utils/toast";
import ChangStatusModal from "../../modal/ChangStatusModal";

/** אופציונלי: כשהמשתמש מאשר שינוי לאותו סטטוס (ללא קריאת API) – קוראים ל-callback */
const selectStatus = ({ order, onSameStatusConfirm }) => {
    const { statuses, setIsUpdate } = useContext(SidebarContext);
    const { mode } = useContext(WindmillContext);
    const { t } = useTranslation();

    const [currentStatus, setCurrentStatus] = useState(null);
    const [tempStatus, setTempStatus] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // מציאת הסטטוס הנוכחי לפי ObjectId
    useEffect(() => {
        if (!order?.status || !statuses?.length) return;

        const found = statuses.find(
            (s) => String(s._id) === String(order.status._id || order.status)
        );

        setCurrentStatus(found || null);
    }, [order, statuses]);

    const options = useMemo(
        () =>
            statuses.map((status) => ({
                value: status._id,
                label: status.label,
                color: status.color,
                isFinal: status.isFinal,
                data: status,
            })),
        [statuses]
    );

    const selectedOption = currentStatus
        ? options.find((o) => String(o.value) === String(currentStatus._id))
        : null;

    const handleSelectChange = (option) => {
        if (!option) return;
        setTempStatus(option.data);
        setIsModalOpen(true);
    };

    const isSameStatus = currentStatus && tempStatus && String(currentStatus._id) === String(tempStatus._id);

    const handleConfirmChange = async () => {
        if (isSameStatus) {
            setIsModalOpen(false);
            onSameStatusConfirm?.();
            return;
        }

        try {
            setIsSubmitting(true);

            await OrderServices.updateOrder(order._id, {
                status: tempStatus._id,
                cart: Array.isArray(order.cart) ? order.cart : [],
            });

            notifySuccess(t("Status updated successfully"));
            setCurrentStatus(tempStatus);
            setIsUpdate(true);
            setIsModalOpen(false);
        } catch (err) {
            notifyError(t("Failed to update status"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const withAlpha = (hex, alpha = 0.15) => {
        if (!hex?.startsWith("#")) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };


    if (!currentStatus) return <span>-</span>;

    const statusColor = currentStatus?.color || "var(--main-color)";
    const statusBg = withAlpha(statusColor, mode === "dark" ? 0.25 : 0.15);

    const customStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 36,
            height: 36,
            minWidth: 140,
            backgroundColor: statusBg,
            borderRadius: 8,
            borderColor: statusColor,
            boxShadow: "none",
            cursor: "pointer",
            paddingLeft: 8,
            paddingRight: 8,
            ":hover": {
                backgroundColor: withAlpha(statusColor, mode === "dark" ? 0.35 : 0.22),
                borderColor: statusColor,
            },
        }),

        option: (base, state) => ({
            ...base,
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: state.isFocusedk
                ? "var(--main-color-super-light)"
                : base.backgroundColor,
            ":before": {
                content: '""',
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: state.data.color || "#9CA3AF",
                display: "inline-block",
            },
        }),

        dropdownIndicator: (base) => ({
            ...base,
            color: statusColor,
            ":hover": {
                color: statusColor,
            },
        }),

        valueContainer: (base) => ({
            ...base,
            justifyContent: "center",
            padding: 0,
        }),

        singleValue: (base) => ({
            ...base,
            color: statusColor,
            fontWeight: 500,
            textAlign: "center",
        }),

        indicatorSeparator: () => ({ display: "none" }),
        menuPortal: (base) => ({ ...base, zIndex: 1000 }),
    };


    return (
        <>
            {isModalOpen && (
                <ChangStatusModal
                    yes={handleConfirmChange}
                    cancel={() => setIsModalOpen(false)}
                    status={tempStatus?.label}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                />
            )}

            <Select
                value={selectedOption}
                options={options}
                onChange={handleSelectChange}
                styles={customStyles}
                isDisabled={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
            />
        </>
    );
};

export default selectStatus;
