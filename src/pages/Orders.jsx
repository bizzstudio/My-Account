/**
 * File: src/pages/Order.jsx
 * Route: /Order
 * Purpose: Display and manage orders list with filters
 */
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { Card, CardBody, TableContainer, TableFooter, Button } from "@windmill/react-ui";
import { t } from "i18next";
import { FiPlus, FiTrash2, FiDownload } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

// Internal imports
import useExport from "@/hooks/useExport";
import useOrderFilter from "@/hooks/Order/useOrderFilter";
import TableLoading from "@/components/preloader/TableLoading";
import OrdersTable from "@/components/order/OrdersTable";
import OrderFilters from "@/components/order/OrderFilters";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import OrderServices from "@/services/OrderServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkStatusChangeModal from "@/components/modal/BulkStatusChangeModal";
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import DropdownMenu from "@/components/menu/DropdownMenu";
import CustomPagination from "@/components/ui/CustomPagination";
import UserServices from "@/services/UserServices";
import BulkStatusChangeSection from "@/components/order/SelectedOrdersActions";
import StandardTable from "@/components/table/StandardTable";
import StandardTableHeader from "@/components/table/StandardTableHeader";
import { notifySuccess, notifyError } from "@/utils/toast";

const Orders = () => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState || {};
    const { setBreadcrumbs, suppliers, statuses, fetchStatuses, updateOrdersCounts, isUpdate, setIsUpdate } = useContext(SidebarContext);
    const navigate = useNavigate();
    const location = useLocation();
    const urlStatusInitializedRef = useRef(false);
    const lastUrlStatusParamRef = useRef("");
    const orderColumns = [
        { key: "checkbox" },                // checkbox
        { key: "date", label: t("Date") },
        { key: "orderNumber", label: t("OrderNumber") },
        { key: "customer", label: t("Customer") },
        { key: "platform", label: t("Platform") },
        { key: "products", label: t("Products") },
        { key: "city", label: t("City") },
        { key: "status", label: t("Status") },
        { key: "deliveryType", label: t("DeliveryType") },
        { key: "actions", label: t("Actions") },
      ];      

    // export
    const { exportToExcel } = useExport();

    // selection
    const [isCheckAll, setIsCheckAll] = useState(false);
    const [isCheck, setIsCheck] = useState([]);
    const [isLoadingAllIds, setIsLoadingAllIds] = useState(false);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage] = useState(20);

    // filters
    const filters = useOrderFilter(statuses);

    // Data
    const [ordersData, setOrdersData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Toggle drawer / delete
    const { serviceId, handleDeleteMany, allId } = useToggleDrawer();

    // Bulk status change
    const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
    const [isBulkStatusSubmitting, setIsBulkStatusSubmitting] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState(filters.searchTerm);
    const [allAdmins, setAllAdmins] = useState([]);

    const fetchAllAdmins = useCallback(async () => {
        if (userInfo?.role === "super-admin") {
            try {
                const res = await UserServices.getAllUser();
                setAllAdmins(res || []);
            } catch (err) {
                console.error("Error fetching admins:", err);
            }
        }
    }, [userInfo]);

    useEffect(() => {
        fetchAllAdmins();
    }, [fetchAllAdmins]);

    useEffect(() => {
        setBreadcrumbs([
            { href: "/Order", label: t("Orders") },
        ]);
        if (!statuses || statuses.length === 0) {
            fetchStatuses?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // טיפול בסטטוס מה-URL - רק פעם אחת כשהסטטוסים נטענים
    useEffect(() => {
        if (statuses && statuses.length > 0 && !urlStatusInitializedRef.current) {
            urlStatusInitializedRef.current = true;
            
            const params = new URLSearchParams(location.search);
            const statusParam = params.get("status") || "";
            
            lastUrlStatusParamRef.current = statusParam; // עדכן את ה-ref
            
            if (statusParam) {
                // מציאת הסטטוס לפי שם
                const matchingStatus = statuses.find(s => s.name === statusParam);
                if (matchingStatus && matchingStatus._id) {
                    filters.setSelectedStatuses([matchingStatus._id]);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statuses]);

    // טיפול בשינויים ב-URL (כשלוחצים על סטטוס אחר בסיידבר)
    useEffect(() => {
        if (!urlStatusInitializedRef.current || !statuses || statuses.length === 0) {
            return; // עוד לא מוכן
        }
        
        const params = new URLSearchParams(location.search);
        const statusParam = params.get("status") || "";
        
        // בדוק אם הפרמטר ב-URL באמת השתנה
        if (statusParam === lastUrlStatusParamRef.current) {
            return; // אין שינוי, לא צריך לעשות כלום
        }
        
        lastUrlStatusParamRef.current = statusParam;
        
        if (statusParam) {
            // מציאת הסטטוס לפי שם
            const matchingStatus = statuses.find(s => s.name === statusParam);
            if (matchingStatus && matchingStatus._id) {
                filters.setSelectedStatuses([matchingStatus._id]);
                setCurrentPage(1); // חזור לעמוד ראשון
            }
        } else {
            // אין סטטוס ב-URL, נקה את הבחירה
            filters.setSelectedStatuses([]);
            setCurrentPage(1); // חזור לעמוד ראשון
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const body = filters.buildParams(currentPage, resultsPerPage, userInfo);
            const res = await OrderServices.getAllOrders(body);
            // try to be resilient to different response shapes
            setOrdersData(res || null);
            
            // עדכון כמויות הסטטוסים בסיידבר
            if (updateOrdersCounts) {
                updateOrdersCounts();
            }
        } catch (err) {
            console.error("fetchOrders error:", err);
            setError(err?.message || "Error");
        } finally {
            setLoading(false);
            setIsUpdate(false);
        }
    }, [filters, currentPage, resultsPerPage, userInfo, setIsUpdate, updateOrdersCounts]);

    // extract orders and total robustly
    const orders = ordersData?.orders || ordersData?.docs || ordersData?.data || [];
    const totalResults = ordersData?.totalDoc || ordersData?.total || ordersData?.count || 0;

    // select all orders in current filter (all results, not just current page)
    const handleSelectAll = async () => {
        if (isCheckAll) {
            // אם כבר הכל מסומן, נבטל את הסימון
            setIsCheck([]);
            setIsCheckAll(false);
        } else {
            // נבחר את כל ההזמנות בסינון הנוכחי
            try {
                setIsLoadingAllIds(true);
                const body = filters.buildParams(1, 999999, userInfo); // limit גבוה מאוד לקבל הכל
                const res = await OrderServices.getAllOrders(body);
                const allOrders = res?.orders || res?.docs || res?.data || [];
                const allIds = allOrders.map(order => String(order._id));
                setIsCheck(allIds);
                setIsCheckAll(true);
            } catch (err) {
                console.error("Error fetching all order IDs:", err);
                notifyError(t("FailedToSelectAllOrders"));
            } finally {
                setIsLoadingAllIds(false);
            }
        }
    };

    // sync isCheckAll with selection (check if all filtered orders are selected)
    useEffect(() => {
        if (isCheck.length === 0) {
            setIsCheckAll(false);
        } else if (isCheck.length === totalResults) {
            setIsCheckAll(true);
        } else {
            setIsCheckAll(false);
        }
    }, [isCheck.length, totalResults]);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, isUpdate]);

    // clear selection when filters change (not when page changes)
    useEffect(() => {
        setIsCheck([]);
        setIsCheckAll(false);
    }, [
        filters.selectedStatuses,
        filters.selectedSuppliers,
        filters.selectedOwner,
        debouncedSearch,
    ]);

    const handleChangePage = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters.searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
        fetchOrders();
    }, [debouncedSearch]);

    const handleResetFilters = () => {
        filters.resetFilters();
        setCurrentPage(1);
    };

    const handleFilterChange = () => {
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchOrders();
    }, [
        filters.selectedStatuses,
        filters.selectedSuppliers,
        filters.selectedOwner,
        filters.dateFrom,
        filters.dateTo,
        isUpdate,
    ]);

    // Export - map items to printable string for excel
    const orderFields = [
        { key: "createdAt", label: t("Date") },
        { key: "displayOrderNumber", label: t("OrderNumber") },
        { key: "customerDetails.customerName", label: t("CustomerName") },
        { key: "supplier.name", label: t("Platform") },
        { key: "productNames", label: t("ProductName") },
        { key: "customerDetails.city", label: t("City") },
        { key: "statusLabel", label: t("Status") },
        { key: "deliveryType", label: t("DeliveryType") },
    ];

    const handleExportToExcel = async () => {
        try {
            let ordersToExport = orders;

            // אם יש הזמנות נבחרות, נשלוף את כל ההזמנות המסוננות
            if (isCheck.length > 0) {
                const body = filters.buildParams(1, 999999, userInfo);
                const res = await OrderServices.getAllOrders(body);
                const allFilteredOrders = res?.orders || res?.docs || res?.data || [];
                
                // סינון רק ההזמנות הנבחרות
                ordersToExport = allFilteredOrders.filter(order => 
                    isCheck.includes(String(order._id))
                );
            }

            const dataToExport = ordersToExport.map(o => {
                // convert cart products to readable string (just product names)
                const productNames = (o.cart || [])
                    .map(ci => ci.sku || ci.description || '-')
                    .join(", ");
                
                return {
                    ...o,
                    productNames: productNames,
                    statusLabel: o?.status?.label || o?.status?.name || '-',
                    "supplier.name": o?.supplier?.name || '-',
                    "customerDetails.customerName": o?.customerDetails?.customerName || '-',
                    "customerDetails.city": o?.customerDetails?.city || '-',
                };
            });

            exportToExcel(dataToExport, orderFields, t("Orders"));
        } catch (err) {
            console.error("Export error:", err);
            notifyError(t("FailedToExportOrders"));
        }
    };

    const handleBulkStatusChange = async (newStatus) => {
        try {
            setIsBulkStatusSubmitting(true);
            await OrderServices.updateManyOrders({
                ids: isCheck,
                status: newStatus._id,
            });
            notifySuccess(t("OrdersStatusUpdatedSuccessfully"));
            setIsBulkStatusModalOpen(false);
            setIsCheck([]);
            setIsUpdate(true);
            
            // עדכון כמויות הסטטוסים בסיידבר
            if (updateOrdersCounts) {
                updateOrdersCounts();
            }
        } catch (err) {
            console.error("Bulk status change error:", err);
            notifyError(t("FailedToUpdateOrdersStatus"));
        } finally {
            setIsBulkStatusSubmitting(false);
        }
    };

    // Import not included for orders by default - you can add if needed

    return (
        <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
            <PageTitle>{t("OrdersPageTitle")}</PageTitle>

            {/* Delete modal for multi-select */}
            {isCheck?.length >= 1 && (
                <DeleteModal
                    ids={isCheck}
                    setIsCheck={setIsCheck}
                    title={t("theSelectedOrders")}
                    table="orders"
                />
            )}

            {/* Bulk Status Change Modal */}
            <BulkStatusChangeModal
                isOpen={isBulkStatusModalOpen}
                onClose={() => setIsBulkStatusModalOpen(false)}
                onConfirm={handleBulkStatusChange}
                selectedCount={isCheck.length}
                isSubmitting={isBulkStatusSubmitting}
            />

            {/* Filters Card */}
            <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
            <CardBody className="flex flex-col gap-4 overflow-visible">

                    <OrderFilters
                        filters={filters}
                        suppliers={suppliers}
                        allAdmins={allAdmins}
                        userInfo={userInfo}
                        onFilterChange={handleFilterChange}
                    />
                </CardBody>
            </Card>

            {/* Bulk Status Change Section - מופיע רק כשיש הזמנות נבחרות */}
            <BulkStatusChangeSection
                selectedIds={isCheck}
                onOpenModal={() => setIsBulkStatusModalOpen(true)}
                totalResults={totalResults}
                onExport={handleExportToExcel}
            />

            {loading ? (
                <TableLoading row={12} col={11} width={163} height={20} />
            ) : error ? (
                <span className="text-center mx-auto text-red-500">{error}</span>
            ) : orders?.length !== 0 ? (
                <>
                    <TableContainer className="mb-8 rounded-b-lg hidden md:block">
                        <StandardTable>
                            <StandardTableHeader 
                                columns={orderColumns}
                                isCheckAll={isCheckAll}
                                handleSelectAll={handleSelectAll}
                                isLoadingAllIds={isLoadingAllIds}
                                totalResults={totalResults}
                            />

                            <OrdersTable
                                orders={orders}
                                isCheck={isCheck}
                                setIsCheck={setIsCheck}
                                isCheckAll={isCheckAll}
                                handleSelectAll={handleSelectAll}
                                isMobile={false}
                            />
                        </StandardTable>

                        <TableFooter>
                            <CustomPagination
                                totalResults={totalResults}
                                resultsPerPage={resultsPerPage}
                                onChange={handleChangePage}
                                label={t("Table navigation")}
                                currentPage={currentPage}
                            />
                        </TableFooter>
                    </TableContainer>

                    {/* Mobile view */}
                    <div className="block md:hidden mb-1">
                        <OrdersTable
                            orders={orders}
                            isCheck={isCheck}
                            setIsCheck={setIsCheck}
                            isCheckAll={isCheckAll}
                            handleSelectAll={handleSelectAll}
                            isMobile={true}
                        />
                        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <CustomPagination
                                totalResults={totalResults}
                                resultsPerPage={resultsPerPage}
                                onChange={handleChangePage}
                                label={t("Table navigation")}
                                currentPage={currentPage}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <NotFound title={t("NoOrderFound")} />
            )}
        </div>
    );
};

export default Orders;
