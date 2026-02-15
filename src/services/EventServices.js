// src/services/EventServices.js
import requests from "./httpService";

const EventServices = {
    addEvent: async (body) => {
        return requests.post("/events", body);
    },

    getAllEvents: async (body) => {
        return requests.get("/events", body);
    },

    getEventById: async (id, body) => {
        return requests.get(`/events/${id}`, body);
    },

    updateEvent: async (id, body) => {
        return requests.put(`/events/${id}`, body);
    },

    deleteEvent: async (id) => {
        return requests.delete(`/events/${id}`);
    },

    deleteManyEvents: async (body) => {
        return requests.post("/events/delete-many", body);
    },
};

export default EventServices;