import requests from "./httpService";

const OrderServices = {
  addOrder: async (orderData) => {
    return requests.post("/order/add", orderData);
  },

  getOrderById: async (id) => {
    return requests.get(`/order/${id}`);
  },

  getAllOrders: async (filters) => {
    console.log("OrderServices.getAllOrders filters:", filters);
    const queryString = new URLSearchParams(filters).toString();
    return requests.get(`/order?${queryString}`);
  },

  // קבלת כל ה-IDs של הזמנות בסינון הנוכחי
  getAllOrderIds: async (filters) => {
    const filtersWithoutPagination = { ...filters };
    delete filtersWithoutPagination.page;
    delete filtersWithoutPagination.limit;
    const queryString = new URLSearchParams({ ...filtersWithoutPagination, idsOnly: 'true' }).toString();
    return requests.get(`/order?${queryString}`);
  },
  
  deleteOrder: async (id) => {
    return requests.delete(`/order/${id}`);
  },

  // מחיקת מספר הזמנות (delete many) - גוף הבקשה: { ids: [...] }
  deleteManyOrders: async (body) => {
    return requests.patch("/order/delete/many", body);
  },
  
  // עדכון סטטוס למספר הזמנות (bulk update) - גוף הבקשה: { ids: [...], status: statusId }
  updateManyOrders: async (body) => {
    return requests.patch("/order/bulk-update", body);
  },
  
  updateOrder: async (id, data) => {
    return requests.patch(`/order/${id}`, data);
  },
};

export default OrderServices;
