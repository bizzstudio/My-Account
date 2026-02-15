// services/StatusServices.js
import requests from "./httpService";

const StatusServices = {
  getAllStatuses() {
    return requests.get("/status");
  },
};

export default StatusServices;
