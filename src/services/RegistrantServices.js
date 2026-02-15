// src/services/RegistrantServices.js
import requests from "./httpService";

const RegistrantServices = {
    addRegistrant: async (body) => {
        return requests.post("/registrants", body);
    },

    getAllRegistrants: async (body) => {
        return requests.get("/registrants", body);
    },

    getRegistrantById: async (id, body) => {
        return requests.get(`/registrants/${id}`, body);
    },

    updateRegistrant: async (id, body) => {
        return requests.put(`/registrants/${id}`, body);
    },

    deleteRegistrant: async (id) => {
        return requests.delete(`/registrants/${id}`);
    },

    deleteManyRegistrants: async (body) => {
        return requests.post("/registrants/delete-many", body);
    },

    checkEmailExists: async (email, type) => {
        if (!email || !type) {
            throw new Error('Email and type are required');
        }
        return requests.get(`/registrants/check-email/${encodeURIComponent(email)}/${type}`);
    },
};

export default RegistrantServices;

