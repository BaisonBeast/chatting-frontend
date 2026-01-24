import React, { createContext, useContext, useEffect } from "react";
import {
    connectSocket,
    disconnectSocket,
    getSocket,
} from "@/services/socketService";
import { Socket } from "socket.io-client";
import useChatStore from "@/store/useStore";

interface SocketContextProps {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({ socket: null });

export const SocketProvider: React.FC<{
    userEmail: string;
    children: React.ReactNode;
}> = ({ userEmail, children }) => {
    const { setOnlineUsers, chatList } = useChatStore();

    useEffect(() => {
        let heartbeatInterval: NodeJS.Timeout;
        if (userEmail) {
            const socket = connectSocket(userEmail);

            heartbeatInterval = setInterval(() => {
                if (socket && socket.connected) {
                    socket.emit("heartbeat", userEmail);

                    // Poll for online status of friends
                    if (chatList && chatList.length > 0) {
                        const friendEmails = chatList.map(chat => chat.participant.email);
                        socket.emit("checkOnlineStatus", friendEmails);
                    }
                }
            }, 5000);

            socket.on("onlineStatusUpdate", (users: string[]) => {
                setOnlineUsers(users);
            });
        }
        return () => {
            clearInterval(heartbeatInterval);
            disconnectSocket();
        };
    }, [userEmail, chatList]);

    return (
        <SocketContext.Provider value={{ socket: getSocket() }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
