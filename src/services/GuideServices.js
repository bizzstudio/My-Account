// src/services/GuideServices.js
import requests from "./httpService";

const GuideServices = {
    addGuide: async (body) => {
        return requests.post("/guides", body);
    },

    getAllGuides: async (body) => {
        return requests.get("/guides", body);
    },

    getGuideById: async (id, body) => {
        return requests.get(`/guides/${id}`, body);
    },

    updateGuide: async (id, body) => {
        return requests.put(`/guides/${id}`, body);
    },

    updateGuideStatus: async (id, body) => {
        return requests.put(`/guides/update-status/${id}`, body);
    },
   

    deleteGuide: async (id) => {
        return requests.delete(`/guides/${id}`);
    },

    deleteManyGuides: async (body) => {
        return requests.patch("/guides/delete-many", body);
    },
};

export default GuideServices;