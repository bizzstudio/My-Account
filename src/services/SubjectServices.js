// src/services/SubjectServices.js
import requests from "./httpService";

const SubjectServices = {
    addSubject: async (body) => {
        return requests.post("/subjects", body);
    },

    getAllSubjects: async (body) => {
        return requests.get("/subjects", body);
    },

    getSubjectById: async (id, body) => {
        return requests.get(`/subjects/${id}`, body);
    },

    updateSubject: async (id, body) => {
        return requests.put(`/subjects/${id}`, body);
    },

    deleteSubject: async (id) => {
        return requests.delete(`/subjects/${id}`);
    },

    deleteManySubjects: async (body) => {
        return requests.patch("/subjects/delete-many", body);
    },
};

export default SubjectServices;