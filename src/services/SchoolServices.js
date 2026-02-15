// src/services/SchoolServices.js
import requests from "./httpService";

const SchoolServices = {
    addSchool: async (body) => {
        return requests.post("/schools", body);
    },

    getAllSchools: async (body) => {
        return requests.get("/schools", body);
    },

    getSchoolById: async (id, body) => {
        return requests.get(`/schools/${id}`, body);
    },

    updateSchool: async (id, body) => {
        return requests.put(`/schools/${id}`, body);
    },

    updateSchoolStatus: async (id, body) => {
        return requests.put(`/schools/update-status/${id}`, body);
    },

    deleteSchool: async (id) => {
        return requests.delete(`/schools/${id}`);
    },

    deleteManySchools: async (body) => {
        return requests.patch("/schools/delete-many", body);
    },
};

export default SchoolServices;