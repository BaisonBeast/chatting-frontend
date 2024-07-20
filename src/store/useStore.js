import { create } from 'zustand'

const useChatStore = create((set) => ({
    messages: {},
    chatList: [],
    inputBox: false,
    addMessage: (newMessage) => set((state) => ({
        messages: {
            ...state.messages,
            messages: [...state.messages.messages, newMessage]
        }
    })),
    setMessages: (messages) => set(() => ({ messages })),
    deleteChatList: (chatId) => set((state) => ({ 
        chatList: state.chatList.filter(chat => chat.chatId !== chatId)
    })),
    addChat: (chat) => set((state) => ({ chatList: [...state.chatList, chat] })),
    setChatList: (chatList) => set(() => ({ chatList })),
    setInputBox: () => set((state) => ({inputBox: !state.inputBox}))
}));

export default useChatStore;  