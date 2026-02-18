// src/components/order/OrdersTable.jsx
import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React, { useContext } from "react";
import { t } from "i18next";
import dayjs from "dayjs";

import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import OrderCard from "./OrderCardComponent";
import CheckBox from "@/components/form/others/CheckBox";
import { UserContext } from "@/context/UserContext";
import SelectStatus from "../form/selectOption/SelectStatus";
import { useNavigate } from "react-router-dom";


const OrdersTable = ({ orders, isCheck, setIsCheck, isCheckAll, handleSelectAll, isMobile = false }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState || {};
    const navigate = useNavigate();

    const {
        title,
        serviceId,
        handleModalOpen,
        isSubmitting,
    } = useToggleDrawer();

    const handleClick = (e) => {
        const { id, checked } = e.target;
        setIsCheck(prev => {
            if (checked) {
                return prev.includes(String(id)) ? prev : [...prev, String(id)];
            } else {
                return prev.filter(item => String(item) !== String(id));
            }
        });
    };

    const toggleDrawerData = {
        handleModalOpen,
        isSubmitting,
        handleUpdate: (id) => navigate(`/Order/${id}/edit`),
        isCheckAll,
        handleSelectAll
    };

    return (
        <>
            {isCheck?.length < 1 && (
                <DeleteModal id={serviceId} title={title} table="orders" />
            )}

            {isMobile ? (
                <div>
                    {orders?.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            isCheck={isCheck}
                            setIsCheck={setIsCheck}
                            handleClick={handleClick}
                            toggleDrawerData={toggleDrawerData}
                        />
                    ))}
                </div>
            ) : (
                <TableBody>
                    {orders?.map((order) => (
                        <TableRow key={order._id}>
                            <TableCell className="text-center">
                                <CheckBox
                                    type="checkbox"
                                    name={String(order._id)}
                                    id={String(order._id)}
                                    handleClick={handleClick}
                                    isChecked={isCheck?.includes(String(order._id))}
                                />
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">
                                    {order?.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : "-"}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{order.displayOrderNumber || "-"}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{order?.customerDetails?.customerName || "-"}</span>
                                <div className="text-xs text-gray-500">{order?.customerDetails?.customerPhone || ""}</div>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{t(`Platform_${order.supplier.name}`) || "-"}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <div className="text-sm flex flex-col gap-1">
                                    {order?.cart?.length > 0 ? (
                                        order.cart.map((item, index) => (
                                            <div key={index}>{item?.description || "-"}</div>
                                        ))
                                    ) : (
                                        "-"
                                    )}
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{order?.customerDetails?.address?.city || "-"}</span>
                            </TableCell>


                            <TableCell className="text-center">
                                <SelectStatus order={order} />
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-sm">{order?.deliveryType != null ? t(`DeliveryType_${order.deliveryType}`) : "-"}</span>
                            </TableCell>

                            <TableCell className="text-center">
                                <EditDeleteButton
                                    id={order._id}
                                    product={order}
                                    isSubmitting={isSubmitting}
                                    handleUpdate={(id) => navigate(`/Order/${id}/edit`)}
                                    handleModalOpen={handleModalOpen}
                                    title={order.displayOrderNumber || t("Order")}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </>
    );
};

export default OrdersTable;
