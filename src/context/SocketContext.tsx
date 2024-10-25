import React, { createContext, useContext, useEffect } from "react";
import {
    connectSocket,
    disconnectSocket,
    getSocket,
} from "@/services/socketService";
import { Socket } from "socket.io-client";

interface SocketContextProps {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({ socket: null });

export const SocketProvider: React.FC<{
    userEmail: string;
    children: React.ReactNode;
}> = ({ userEmail, children }) => {
    useEffect(() => {
        if (userEmail) {
            connectSocket(userEmail);
        }
        return () => disconnectSocket();
    }, [userEmail]);

    return (
        <SocketContext.Provider value={{ socket: getSocket() }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
