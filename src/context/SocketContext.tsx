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
                    // Access latest chatList directly from store to avoid dependency cycle
                    const currentChatList = useChatStore.getState().chatList;
                    if (currentChatList && currentChatList.length > 0) {
                        const friendEmails = currentChatList.map(chat => chat.participant.email);
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
    }, [userEmail]); // Removed chatList from dependency to prevent re-connect loop

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
