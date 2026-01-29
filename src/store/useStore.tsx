import { create } from "zustand";
import { Message, Messages } from "../interfaces/message.interface";
import { SingleChat } from "../interfaces/chat.interface";

interface User {
    id: string;
    email: string;
    username: string;
    profilePic: string;
    background: number;
    token: string;
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
    removeChat: (chatId: string) => void;
    addLike: (messageId: string, name: string) => void;
    deleteMessage: (messageId: string) => void;
    onlineUsers: string[];
    setOnlineUsers: (users: string[]) => void;
    groupList: any[];
    setGroupList: (groupList: any[]) => void;
    addGroup: (group: any) => void;
    selectedChatType: "chat" | "group";
    setSelectedChatType: (type: "chat" | "group") => void;
    isInviteOpen: boolean;
    setInviteOpen: (open: boolean) => void;
    isChatListOpen: boolean;
    setChatListOpen: (open: boolean) => void;
}

const params = new URLSearchParams(window.location.search);
const isSimulator = params.get("simulator") === "true";
const storage = isSimulator ? sessionStorage : localStorage;

const initUser = () => {
    const dataParam = params.get("data");
    if (isSimulator && dataParam) {
        try {
            const user = JSON.parse(decodeURIComponent(dataParam));
            storage.setItem("user", JSON.stringify(user));
            window.history.replaceState({}, document.title, window.location.pathname + "?simulator=true");
            return user;
        } catch (e) {
            console.error("Failed to parse simulator data", e);
        }
    }
    return JSON.parse(storage.getItem("user") || "null");
};

const useChatStore = create<ChatStore>((set) => ({
    user: initUser(),
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
        if (user != null) storage.setItem("user", JSON.stringify(user));
        else storage.removeItem("user");
        set(() => ({ user }));
    },
    setChatList: (chatList) => set(() => ({ chatList })),
    removeChat: (chatId: string) =>
        set((state) => ({
            chatList: state.chatList.filter((chat) => chat.id !== chatId),
        })),
    addLike: (messageId, name) =>
        set((state) => ({
            messages: state.messages.map((message) =>
                message._id === messageId
                    ? { ...message, like: [...message.like, name] }
                    : message
            ),
        })),
    deleteMessage: (messageId) =>
        set((state) => ({
            messages: state.messages.map((message) =>
                message._id === messageId
                    ? { ...message, isDeleted: true, message: '' }
                    : message
            ),
        })),
    onlineUsers: [],
    setOnlineUsers: (users) => set(() => ({ onlineUsers: users })),
    groupList: [],
    setGroupList: (groupList) => set(() => ({ groupList })),
    addGroup: (group) => set((state) => ({ groupList: [...state.groupList, group] })),
    selectedChatType: "chat",
    setSelectedChatType: (type) => set(() => ({ selectedChatType: type })),
    isInviteOpen: false,
    setInviteOpen: (isInviteOpen) => set(() => ({ isInviteOpen })),
    isChatListOpen: false, // Default to false or true depending on preference, likely false initially
    setChatListOpen: (isChatListOpen) => set(() => ({ isChatListOpen })),
}));

export default useChatStore;
