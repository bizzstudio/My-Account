// src/services/UserServices.js
import requests from "./httpService";

const UserServices = {
  registerUser: async (body) => {
    return requests.post("/user/register", body);
  },

  loginUser: async (body) => {
    return requests.post(`/user/login`, body);
  },

  validateToken: async () => {
    return requests.get("/user/validate-token");
  },

  forgetPassword: async (body) => {
    return requests.put("/user/forget-password", body);
  },

  resetPassword: async (body) => {
    return requests.put("/user/reset-password", body);
  },

  verifyMfa: async (body) => {
    return requests.post("/user/mfa/verify", body);
  },

  signUpWithProvider: async (body) => {
    return requests.post("/user/signup", body);
  },

  addUser: async (body) => {
    return requests.post("/user/add", body);
  },

  getAllUser: async (body) => {
    return requests.get("/user", body);
  },

  getUserById: async (id, body) => {
    return requests.get(`/user/${id}`, body);
  },

  updateUser: async (id, body) => {
    return requests.put(`/user/${id}`, body);
  },

  updateUserStatus: async (id, body) => {
    return requests.put(`/user/update-status/${id}`, body);
  },

  deleteUser: async (id) => {
    return requests.delete(`/user/${id}`);
  },

  getUnReadMessages: async (id) => {
    return await requests.get(`/user/unread-messages/${id}`);
  },

  getAllMessages: async (id) => {
    return await requests.get(`/user/all-messages/${id}`);
  },
};

export default UserServices;
