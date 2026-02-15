// src/services/PopupServices.js
import requests from "./HttpService";

const PopupServices = {
  // Add a new popup
  addPopup: async (body, managerId = null) => {
    const data = managerId ? { ...body, manager: managerId } : body;
    return requests.post(`/popup/add`, data);
  },

  // Get all popups
  getAllPopups: async (managerId = null) => {
    const url = managerId ? `/popup/all?managerId=${managerId}` : `/popup/all`;
    return requests.get(url);
  },

  // Get popup by ID
  getPopupById: async (id) => {
    return requests.get(`/popup/${id}`);
  },

  // Update a popup by ID
  updatePopup: async (id, body) => {
    return requests.put(`/popup/${id}`, body);
  },

  // Delete a popup by ID
  deletePopup: async (id) => {
    return requests.delete(`/popup/${id}`);
  },

  // Delete multiple popups by IDs
  deleteManyPopups: async (body) => {
    return requests.patch(`/popup/delete-many`, body);
  }
};

export default PopupServices;