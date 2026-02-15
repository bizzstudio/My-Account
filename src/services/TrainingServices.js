// src/services/TrainingServices.js
import requests from "./httpService";

const TrainingServices = {
    addTraining: async (body) => {
        return requests.post("/trainings", body);
    },

    getAllTrainings: async (body) => {
        return requests.get("/trainings", body);
    },

    getAvailableTrainings: async (type) => {
        if (!type) {
            throw new Error('Training type is required');
        }
        return requests.get(`/trainings/available/${type}`);
    },

    getTrainingById: async (id, body) => {
        return requests.get(`/trainings/${id}`, body);
    },

    updateTraining: async (id, body) => {
        return requests.put(`/trainings/${id}`, body);
    },

    deleteTraining: async (id) => {
        return requests.delete(`/trainings/${id}`);
    },

    deleteManyTrainings: async (body) => {
        return requests.post("/trainings/delete-many", body);
    },
};

export default TrainingServices;

