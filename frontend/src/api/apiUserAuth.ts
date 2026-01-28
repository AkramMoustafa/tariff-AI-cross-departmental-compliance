import { BASE_URL } from "./client";
import axios from "axios";


const apiUserClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Attach HUMAN user token
 */
apiUserClient.interceptors.request.use(
  (config) => {
    // 🔑 Human token (issued by /api/auth/signup or /api/auth/login)
    const token = localStorage.getItem("client_user_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle auth errors
 */
apiUserClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[apiUserClient] Session expired or unauthorized user");

    }

    return Promise.reject(error);
  }
);

export default apiUserClient;