import requests from "./httpService";

const TemplateServices = {
  getAllTemplates: async () => {
    return requests.get("/templates");
  },

  uploadTemplate: async (formData) => {
    return requests.post("/templates", formData, {
      headers: { "Content-Type": undefined },
    });
  },

  deleteTemplate: async (id) => {
    return requests.delete(`/templates/${id}`);
  },

  getTemplateFileUrl: (id) => {
    return `${import.meta.env.VITE_APP_API_BASE_URL}/templates/${id}/file`;
  },

  /** הורדת קובץ התבנית כ-blob (עם Auth) — לשימוש בקישור מהגדרות */
  downloadTemplateFile: async (id) => {
    return requests.get(`/templates/${id}/file`, { responseType: "blob" });
  },

  /** סנכרון רשימת תבניות עם Drive (מסיר מהרשימה קבצים שנמחקו בדרייב) — דורש מימוש בבקאנד */
  syncWithDrive: async () => {
    return requests.post("/templates/sync");
  },
};

export default TemplateServices;
