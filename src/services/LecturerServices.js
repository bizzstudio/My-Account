// src/services/LecturerServices.js
import requests from "./httpService";

const LecturerServices = {
    addLecturer: async (body) => {
        return requests.post("/lecturers", body);
    },

    getAllLecturers: async (body) => {
        return requests.get("/lecturers", body);
    },

    getLecturerById: async (id, body) => {
        return requests.get(`/lecturers/${id}`, body);
    },

    updateLecturer: async (id, body) => {
        return requests.put(`/lecturers/${id}`, body);
    },

    deleteLecturer: async (id) => {
        return requests.delete(`/lecturers/${id}`);
    },

    deleteManyLecturers: async (body) => {
        return requests.post("/lecturers/delete-many", body);
    },
};

export default LecturerServices;