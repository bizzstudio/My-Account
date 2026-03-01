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
};

export default TemplateServices;
