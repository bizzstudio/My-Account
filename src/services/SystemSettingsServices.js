// src/services/SystemSettingsServices.js
import requests from "@/services/httpService";

const SystemSettingsServices = {
  getSettings: () => requests.get("/system-settings"),
  updateSettings: (data) => requests.patch("/system-settings", data),
};

export default SystemSettingsServices;
