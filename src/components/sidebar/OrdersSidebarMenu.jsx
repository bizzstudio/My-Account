// src/components/sidebar/OrdersSidebarMenu.jsx
import React, { useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SidebarContext } from "@/context/SidebarContext";

const OrdersSidebarMenu = ({ route }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { statuses } = useContext(SidebarContext);
  
  // חישוב סה"כ הזמנות מכל הסטטוסים
  const totalOrders = useMemo(() => {
    return statuses.reduce((sum, status) => sum + (status.ordersCount || 0), 0);
  }, [statuses]);

  // סידור הסטטוסים לפי הסדר המבוקש
  const ORDER_MAP = {
    "הזמנות חדשות": 0,
    "משלוחים": 1,
    "איסוף עצמי": 2,
    "שילוח פנימי": 3,
    "ביטולים": 4,
    "הזמנות שגויות": 5,
  };
  
  const sortedStatuses = useMemo(() => {
    return [...statuses].sort((a, b) => {
      const posA = ORDER_MAP[a.label] ?? Infinity;
      const posB = ORDER_MAP[b.label] ?? Infinity;
  
      return posA - posB;
    });
  }, [statuses]);  

  const selectedStatus = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get("status") || "";
  }, [location.search]);

  const isOrderPage = location.pathname === "/Order";

  const handleStatusClick = (statusName) => {
    const params = new URLSearchParams(location.search);
    if (statusName === "") {
      params.delete("status");
    } else {
      params.set("status", statusName);
    }
    navigate(`/Order?${params.toString()}`, { replace: true });
  };

  const handleMainClick = () => {
    // ניווט לדף הזמנות ללא סינון (הכל)
    navigate('/Order', { replace: true });
  };

  return (
    <>
      <li className="relative px-6 py-4" key={route.name}>
        <button
          className={`flex gap-2 items-center justify-between focus:outline-none w-full text-base font-bold transition-colors duration-150 ${
            isOrderPage
              ? "text-mainColor dark:text-gray-200"
              : "hover:text-mainColor hover:dark:text-mainColor-dark dark:hover:text-gray-200"
          }`}
          onClick={handleMainClick}
          aria-haspopup="true"
        >
          <span className="flex gap-2 items-center">
            <route.icon className="w-6 h-6" aria-hidden="true" />
            <span className="mt-1">{t(`${route.name}`)}</span>
          </span>
        </button>

        {(
          <ul
            className="p-2 mt-2 overflow-hidden text-base font-medium text-gray-500 rounded-md dark:text-gray-400 dark:bg-gray-900"
            aria-label="submenu"
          >
            {/* כפתורי הסטטוסים */}
            {sortedStatuses && sortedStatuses.length > 0 && sortedStatuses.map((status, index) => {
              const isActive = selectedStatus === status.name && isOrderPage;
              const needsDivider = status.label === "שילוח פנימי";
              
              return (
                <React.Fragment key={status._id}>
                  <li className="relative">
                    <button
                      onClick={() => handleStatusClick(status.name)}
                      className={`flex items-center gap-2 font-serif py-3 text-base w-full text-start cursor-pointer transition-colors duration-150 ${
                        isActive
                          ? "text-mainColor-dark font-bold"
                          : "text-gray-600 hover:text-mainColor hover:dark:text-mainColor-dark"
                      }`}
                    >
                      {isActive && (
                        <span
                          className="absolute inset-y-0 left-0 w-1 rounded-tl-lg rounded-bl-lg"
                          style={{ backgroundColor: status.color }}
                          aria-hidden="true"
                        ></span>
                      )}
                      
                      {/* עיגול עם מספר ההזמנות */}
                      <span
                        className="flex items-center justify-center min-w-[24px] h-[24px] rounded-full bg-white dark:bg-gray-800 text-xs font-semibold px-1.5"
                        style={{ 
                          border: `2px solid ${status.color}`,
                          color: status.color
                        }}
                      >
                        {status.ordersCount || 0}
                      </span>
                      
                      <span className="text-gray-500 hover:text-mainColor hover:dark:text-mainColor-dark dark:hover:text-gray-200">
                        {status.label}
                      </span>
                    </button>
                  </li>
                  
                  {/* קו מפריד אחרי "שילוח פנימי" */}
                  {needsDivider && (
                    <li className="my-2 mx-3">
                      <hr className="border-gray-300 dark:border-gray-600" />
                    </li>
                  )}
                </React.Fragment>
              );
            })}

            {/* קו מפריד לפני היסטוריה */}
            <li className="my-2 mx-3">
              <hr className="border-gray-300 dark:border-gray-600" />
            </li>

            {/* כפתור היסטורית הזמנות */}
            <li className="relative">
              <button
                onClick={() => handleStatusClick("")}
                className={`flex items-center gap-2 font-serif py-3 text-base w-full text-start cursor-pointer transition-colors duration-150 ${
                  selectedStatus === "" && isOrderPage
                    ? "text-mainColor-dark font-bold"
                    : "text-gray-600 hover:text-mainColor hover:dark:text-mainColor-dark"
                }`}
              >
                {selectedStatus === "" && isOrderPage && (
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-mainColor rounded-tl-lg rounded-bl-lg"
                    aria-hidden="true"
                  ></span>
                )}
                
                {/* עיגול עם מספר כל ההזמנות */}
                <span
                  className="flex items-center justify-center min-w-[24px] h-[24px] rounded-full bg-white dark:bg-gray-800 text-xs font-semibold px-1.5 border-2 border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-300"
                >
                  {totalOrders}
                </span>
                
                <span className="text-gray-500 hover:text-mainColor hover:dark:text-mainColor-dark dark:hover:text-gray-200">
                  {t("HistoryOrders")}
                </span>
              </button>
            </li>
          </ul>
        )}
      </li>
    </>
  );
};

export default OrdersSidebarMenu;
