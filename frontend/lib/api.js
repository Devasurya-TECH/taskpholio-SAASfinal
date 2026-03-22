import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const api = axios.create({
  baseURL: `${baseUrl.replace(/\/$/, '')}/api/v1`
});

export default api;
