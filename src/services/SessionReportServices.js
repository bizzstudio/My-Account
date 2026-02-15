// src/services/SessionReportServices.js
import requests from "./httpService";

const SessionReportServices = {
    addSessionReport: async (body) => {
        return requests.post("/session-reports", body);
    },

    getAllSessionReports: async (body) => {
        return requests.get("/session-reports", body);
    },

    getSessionReportById: async (id, body) => {
        return requests.get(`/session-reports/${id}`, body);
    },

    updateSessionReport: async (id, body) => {
        return requests.put(`/session-reports/${id}`, body);
    },

    deleteSessionReport: async (id) => {
        return requests.delete(`/session-reports/${id}`);
    },

    deleteManySessionReports: async (body) => {
        return requests.patch("/session-reports/delete-many", body);
    },
};

export default SessionReportServices;