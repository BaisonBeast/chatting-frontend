import { create } from "zustand";
import { Message, Messages } from "../interfaces/message.interface";
import { Chat } from "../interfaces/chat.interface";

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
    chatList: Chat[];
    inputBox: boolean;
    addMessage: (newMessage: Message) => void;
    addChat: (chat: Chat) => void;
    setInputBox: () => void;
    deleteChatList: (chatId: string) => void;
    setMessages: (messages: Messages) => void;
    setUser: (user: User | null) => void;
    setChatList: (chatList: Chat[]) => void;
}

const useChatStore = create<ChatStore>((set) => ({
    user: JSON.parse(localStorage.getItem("user") || 'null') ,
    messages: {
        name: "general",
        messages: [],
    },
    chatList: [],
    inputBox: false,
    addMessage: (newMessage) =>
        set((state) => ({
            messages: {
                ...state.messages,
                messages: [...state.messages.messages, newMessage],
            },
        })),
    addChat: (chat) =>
        set((state) => ({ chatList: [...state.chatList, chat] })),
    setMessages: (messages) => set(() => ({ messages })),
    setUser: (user: User | null) => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
        set({ user });
    },
    setChatList: (chatList) => set(() => ({ chatList })),
    setInputBox: () => set((state) => ({ inputBox: !state.inputBox })),
    deleteChatList: (chatId) =>
        set((state) => ({
            chatList: state.chatList.filter((chat) => chat.chatId !== chatId),
        })),
}));

export default useChatStore;
