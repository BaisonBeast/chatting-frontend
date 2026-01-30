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
        if (error.response) {
            const { status } = error.response;
            if (status === 401 || status === 403) {
                // Clear storage
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to login if not already there
                if (!window.location.pathname.includes("/login")) {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
