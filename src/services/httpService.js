import axios from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 180000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor — לא דורס headers קיימים
instance.interceptors.request.use(
  (config) => {
    let tokenHolder = null;

    if (Cookies.get("userInfo")) {
      tokenHolder = JSON.parse(Cookies.get("userInfo"));
    }

    config.headers = {
      ...config.headers,
      Authorization: tokenHolder ? `Bearer ${tokenHolder.token}` : undefined,

      // חשוב: מבטל cache בדפדפן
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    return config;
  },
  (error) => Promise.reject(error)
);

// מחזיר רק את ה־data (אלא אם זה blob)
const responseBody = (response) => {
  // אם זה blob, נחזיר את ה-data שהוא ה-blob עצמו
  if (response.config.responseType === 'blob') {
    return response.data;
  }
  return response.data;
};

// ✅ API תקין ל־axios
const requests = {
  get: (url, config = {}) =>
    instance.get(url, config).then(responseBody),

  post: (url, body, config = {}) =>
    instance.post(url, body, config).then(responseBody),

  put: (url, body, config = {}) =>
    instance.put(url, body, config).then(responseBody),

  patch: (url, body, config = {}) =>
    instance.patch(url, body, config).then(responseBody),

  delete: (url, config = {}) =>
    instance.delete(url, config).then(responseBody),
};

export default requests;