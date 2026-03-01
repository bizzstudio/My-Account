import requests from "./httpService";

const ProductServices = {
  addProduct: async (body) => {
    return requests.post("/products/add", body);
  },

  addAllProducts: async (body) => {
    return requests.post("/products/all", body);
  },

  getAllProducts: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return requests.get(`/products?${queryString}`);
  },

  getProductById: async (id) => {
    return requests.get(`/products/${id}`);
  },

  updateProduct: async (id, body) => {
    return requests.patch(`/products/${id}`, body);
  },

  deleteProduct: async (id) => {
    return requests.delete(`/products/${id}`);
  },

  deleteManyProducts: async (body) => {
    return requests.patch("/products/delete/many", body); // בלי /api כפול
  },
  

  findProductByTranscript: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return requests.get(`/products/voice-search?${queryString}`);
  },

  getFacebookFeedCSV: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return requests.get(`/products/facebook-feed-csv?${queryString}`);
  },
};

export default ProductServices;
