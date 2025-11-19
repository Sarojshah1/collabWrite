import axios from "axios";
import { getToken, clearToken } from "@/lib/api";

const baseURL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export const http = axios.create({
  baseURL,
  // We are not using httpOnly cookies, so don't send credentials. This avoids stricter CORS requirements.
  withCredentials: false,
});

// Attach Authorization header and handle FormData content-type automatically
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  // If sending FormData, ensure Content-Type is not forced so browser sets boundary
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (config.headers) {
      delete (config.headers as any)["Content-Type"];
    }
  }
  return config;
});

// Handle errors globally and shape them for the UI
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const resp = error?.response;
    if (resp?.status === 401) {
      clearToken();
    }
    if (resp) {
      const message = resp.data?.message || `Request failed with status ${resp.status}`;
      const err: any = new Error(message);
      err.status = resp.status;
      err.details = resp.data?.details;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

export default http;
