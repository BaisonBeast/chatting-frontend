import React, { useEffect, useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import useChatStore from "@/store/useStore";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import moment from "moment";
import { SingleChat } from "@/interfaces/chat.interface";
import { useSocket } from "@/context/SocketContext";

const API_URL = import.meta.env.VITE_API_URL;

interface ChatListProps {
    searchTerm: string;
}

const ChatList: React.FC<ChatListProps> = ({ searchTerm }) => {
    const { user, setSelectedChat, selectedChat, chatList, setChatList, addChat } = useChatStore();
    const { toast } = useToast();
    const { socket } = useSocket();

    const [chatIsOpen, setchatIsOpen] = useState(false);

    useEffect(() => {
        fetchAllChatList();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("createChat", (data) => {
            const otherParticipant =
                data.newChat.participants[0].email === user?.email
                        ? data.newChat.participants[1]
                        : data.newChat.participants[0];

            const newChatExtract: SingleChat = {
                id: data.newChat._id,
                createdAt: data.newChat.createdAt,
                updatedAt: data.newChat.updatedAt,
                participant: {
                    username: otherParticipant.username,
                    profilePic: otherParticipant.profilePic,
                    email: otherParticipant.email,
                },
            }
            
            addChat(newChatExtract)
            toast({
                title: "Chat Added",
                description: `${data.message}`,
            });
        });

        return () => {
            socket.off("createChat");
        };
    }, [socket]);

    const filteredChats = chatList.filter((chat) =>
        chat.participant.username
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    function getInitials(name?: string) {
        if (!name) {
            return "";
        }
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        if (words.length > 2) {
            return (
                words[0].charAt(0).toUpperCase() +
                words[1].charAt(0).toUpperCase()
            );
        }
        return (
            words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase()
        );
    }

    function getOtherParticipants(
        chatArray: any[],
        userEmail: string
    ): SingleChat[] {
        return chatArray?.map((chat) => {
            const otherParticipant =
                chat.participants[0].email === userEmail
                    ? chat.participants[1]
                    : chat.participants[0];
            return {
                id: chat._id,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
                participant: {
                    username: otherParticipant.username,
                    profilePic: otherParticipant.profilePic,
                    email: otherParticipant.parti,
                },
            };
        });
    }

    const fetchAllChatList = async () => {
        try {
            const resp = await axios.get(`${API_URL}/api/chat/getAllChats`, {
                params: {
                    email: user?.email,
                },
            });
            const result = getOtherParticipants(
                resp.data.data,
                user?.email as string
            );
            setChatList(result);
        } catch (err) {
            toast({
                title: "Something went wrong",
                description: "Please try again after some time...",
            });
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Collapsible open={chatIsOpen} onOpenChange={setchatIsOpen}>
                <CollapsibleTrigger asChild>
                    <div className="p-5 bg-slate-50 cursor-pointer text-xl flex justify-between">
                        Chat's
                        {chatIsOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {filteredChats.length > 0 ? (
                        filteredChats.map((chat, indx) => {
                            return (
                                <div
                                    key={chat.id}
                                    className="flex items-center justify-between px-4 py-2 border-b-2 border-sky-50 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 list-item"
                                    onClick={() => setSelectedChat(indx)}
                                    style={{background: `${selectedChat === indx ? '#E5E7EB': ''}`}}
                                >
                                    <div className="flex items-center">
                                        <Avatar>
                                            {chat.participant.profilePic ? (
                                                <AvatarImage
                                                    src={
                                                        chat.participant
                                                            .profilePic
                                                    }
                                                    alt={
                                                        chat.participant
                                                            .username
                                                    }
                                                />
                                            ) : (
                                                <AvatarFallback>
                                                    {getInitials(
                                                        chat.participant
                                                            .username
                                                    )}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <span className="ml-2 font-medium">
                                            {chat.participant.username}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {moment(chat.updatedAt).format("LT")}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-600 bg-slate-200 pt-3 pb-3 pl-3">
                            Please add friends to start chtting...
                        </p>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

export default ChatList;
