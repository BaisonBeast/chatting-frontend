import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    (config) => {
        const params = new URLSearchParams(window.location.search);
        const isSimulator = params.get("simulator") === "true";
        const storage = isSimulator ? sessionStorage : localStorage;

        const userStr = storage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user?.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
