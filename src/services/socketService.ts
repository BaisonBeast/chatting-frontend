import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
let socket: Socket | null = null;

export const connectSocket = (userEmail: string): Socket => {
    if (!socket) {
        socket = io(API_URL, { autoConnect: false });
    }
    if (!socket.connected) {
        socket.connect();
        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });
        socket.emit("join", userEmail);
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
