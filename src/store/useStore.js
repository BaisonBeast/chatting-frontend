import { create } from 'zustand'

const useChatStore = create((set) => ({
    user: localStorage.getItem('username') || null,
    messages: {},
    chatList: [],
    inputBox: false,
    addMessage: (newMessage) => set((state) => ({
        messages: {
            ...state.messages,
            messages: [...state.messages.messages, newMessage]
        }
    })),
    addChat: (chat) => set((state) => ({ chatList: [...state.chatList, chat] })),
    setMessages: (messages) => set(() => ({ messages })),
    setUser: (user) => set(() => ({user})),
    setChatList: (chatList) => set(() => ({ chatList })),
    setInputBox: () => set((state) => ({inputBox: !state.inputBox})),
    deleteChatList: (chatId) => set((state) => ({ 
        chatList: state.chatList.filter(chat => chat.chatId !== chatId)
    })),
}));

export default useChatStore;  