// src/services/apiClient.js
import axios from "axios";

// Use env if present, fallback to localhost (so you don't break anything today)
export const baseURL =
	import.meta.env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const api = axios.create({
	baseURL,
});
