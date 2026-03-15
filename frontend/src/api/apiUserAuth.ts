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

    const token = localStorage.getItem("client_user_token");

    console.log("---- API REQUEST DEBUG ----");
    console.log("Request URL:", config.url);
    console.log("Token from localStorage:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header attached");
    } else {
      console.warn("NO TOKEN FOUND");
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