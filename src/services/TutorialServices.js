// src/services/TutorialServices.js
import requests from "./httpService";

const TutorialServices = {
    addTutorial: async (body) => {
        return requests.post("/tutorials", body);
    },

    getAllTutorials: async () => {
        return requests.get("/tutorials");
    },

    getTutorialById: async (id) => {
        return requests.get(`/tutorials/${id}`);
    },

    updateTutorial: async (id, body) => {
        return requests.put(`/tutorials/${id}`, body);
    },

    deleteTutorial: async (id) => {
        return requests.delete(`/tutorials/${id}`);
    },

    deleteManyTutorials: async (body) => {
        return requests.patch("/tutorials/delete-many", body);
    },
};

export default TutorialServices;
