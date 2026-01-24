export const API_ROUTES = {
    AUTH: {
        LOGIN: "/api/chatUser/login",
        REGISTER: "/api/chatUser/register",
        UPDATE: "/api/chatUser/update",
    },
    CHAT: {
        INVITE_USER: "/api/chat/inviteUser",
        GET_ALL_CHATS: "/api/chat/getAllChats",
        GET_ALL_INVITES: "/api/chat/getAllInvites",
        ACCEPT_INVITE: "/api/chat/acceptInvite",
        REJECT_INVITE: "/api/chat/rejectInvite",
        DELETE_CHAT: "/api/chat/deleteChat", // /:chatId
        CHAT_SUGGESTION: "/api/chat/chatSuggestion", // ?textContent=
        REPLY_SUGGESTION: "/api/chat/replySuggestion", // ?textContent=
    },
    MESSAGES: {
        ALL_MESSAGES: "/api/messages/allMessage", // /:chatId
        NEW_MESSAGE: "/api/messages/newMessage", // /:chatId
    }
};
