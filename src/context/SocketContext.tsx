import React, { createContext, useContext, useEffect, useState } from "react";
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
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        let heartbeatInterval: NodeJS.Timeout;
        if (userEmail) {
            const socketInstance = connectSocket(userEmail);
            setSocket(socketInstance);

            heartbeatInterval = setInterval(() => {
                if (socketInstance && socketInstance.connected) {
                    socketInstance.emit("heartbeat", userEmail);

                    // Poll for online status of friends
                    if (chatList && chatList.length > 0) {
                        const friendEmails = chatList.map(chat => chat.participant.email);
                        socketInstance.emit("checkOnlineStatus", friendEmails);
                    }
                }
            }, 5000);

            socketInstance.on("onlineStatusUpdate", (users: string[]) => {
                setOnlineUsers(users);
            });
        }
        return () => {
            clearInterval(heartbeatInterval);
            disconnectSocket();
            setSocket(null);
        };
    }, [userEmail, chatList]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
