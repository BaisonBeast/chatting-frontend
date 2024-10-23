import { create } from "zustand";
import { Message, Messages } from "../interfaces/message.interface";
import { SingleChat } from "../interfaces/chat.interface";

interface User {
    id: string;
    email: string;
    username: string;
    profilePic: string;
    background: number;
}

interface ChatStore {
    user: null | User;
    messages: Messages;
    chatList: SingleChat[];
    selectedChat: number;
    setSelectedChat: (indx: number) => void;
    addMessage: (newMessage: Message) => void;
    addChat: (chat: SingleChat) => void;
    setMessages: (messages: Messages) => void;
    setUser: (user: User | null) => void;
    setChatList: (chatList: SingleChat[]) => void;
}

const useChatStore = create<ChatStore>((set) => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    selectedChat: -1,
    setSelectedChat: (selectedChat) => set(() => ({ selectedChat })),
    messages: [],
    chatList: [],
    addMessage: (newMessage) =>
        set((state) => ({
            messages: [...state.messages, newMessage],
        })),
    addChat: (chat) =>
        set((state) => ({ chatList: [...state.chatList, chat] })),
    setMessages: (messages) => set(() => ({ messages })),
    setUser: (user: User | null) => {
        if (user != null) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
        set(() => ({ user }));
    },
    setChatList: (chatList) => set(() => ({ chatList })),
}));

export default useChatStore;
