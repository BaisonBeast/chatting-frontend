import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

let socket: Socket | null = null;

export const connectSocket = (userEmail: string): Socket => {
    if (!socket) {
        socket = io(API_URL, {
            path: "/socket.io",
            withCredentials: true,
            transports: ["websocket", "polling"],
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket?.id);
            socket?.emit("join", userEmail);
        });

        socket.on("disconnect", (reason) => {
            console.warn("⚠️ Socket disconnected:", reason);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err.message);
        });
    }

    if (!socket.connected) {
        socket.connect();
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = (): Socket | null => socket;
