import React, { useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    MoreVertical,
    Edit2,
    Trash2,
    ThumbsUp,
    AlertTriangle,
} from "lucide-react";
import moment from "moment";
import axios from "axios";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";
import useChatStore from "@/store/useStore";
import { Message } from "@/interfaces/message.interface";

const API_URL = import.meta.env.VITE_API_URL;

interface SingleMessageProps {
    message: Message;
    id: number;
}

const SingleMessage: React.FC<SingleMessageProps> = ({ message, id }) => {
    const { toast } = useToast();
    const { socket } = useSocket();
    const { user, chatList, selectedChat, addLike, deleteMessage } =
        useChatStore();
    const [isHovered, setIsHovered] = useState(false);

    // Calculate days ago
    const calculateDaysAgo = (isoDate: string) => {
        const pastDate = new Date(isoDate);
        const currentDate = new Date();
        const differenceInMs = currentDate.getTime() - pastDate.getTime();
        return Math.floor(differenceInMs / (24 * 60 * 60 * 1000));
    };

    const day = calculateDaysAgo(message.updatedAt);

    // Determine message styling based on sender
    const isOwnMessage = message.senderEmail === user?.email;
    const messageStyles = isOwnMessage
        ? "bg-blue-50 border-blue-200 text-blue-900 self-end rounded-bl-2xl"
        : "bg-green-50 border-green-200 text-green-900 self-start rounded-br-2xl";

    // Handle message delete
    const handleDeleteMessage = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/messages/delete/${id}`, {
                data: {
                    loggedUserEmail: user?.email,
                    otherSideUserEmail:
                        chatList[selectedChat].participant.email,
                },
            });
            toast({
                title: "Message Deleted",
                description: "Your message has been successfully deleted.",
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "Error Deleting Message",
                description:
                    "Failed to delete message. Please try again later.",
                variant: "destructive",
            });
        }
    };

    // Handle like message
    const handleLike = async () => {
        try {
            await axios.post(`${API_URL}/api/messages/likeMessage`, {
                messageId: message._id,
                likeGivenUserEmail: user?.email,
                otherSideUserEmail: chatList[selectedChat].participant.email,
            });
            toast({
                title: "Message Liked",
                description: "You've liked this message.",
            });
        } catch (err: any) {
            toast({
                title: "Like Failed",
                description: err.response?.data?.message || "Please try again.",
                variant: "destructive",
            });
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleLikeMessage = (data: {
            messageId: string;
            email: string;
        }) => {
            addLike(data.messageId, data.email);
        };

        socket.on("deleteMessage", (data) => {
            deleteMessage(data.messageId);
        });
        socket.removeAllListeners("likemessage");
        socket.on("likemessage", handleLikeMessage);

        return () => {
            if (socket) {
                socket.off("deleteMessage");
                socket.off("likemessage", handleLikeMessage);
                socket.emit("leaveChat");
            }
        };
    }, [socket]);

    // Render timestamp
    const renderTimestamp = () => {
        const timeFormat = `${
            day === 0
                ? "Today at"
                : day === 1
                ? "Yesterday at"
                : `${day} days ago at`
        } ${moment(message.updatedAt).format("LT")}`;

        return (
            <span className="text-xs text-gray-500 mt-1 block text-right">
                {timeFormat}
            </span>
        );
    };

    return (
        <div
            key={id}
            className={`
        relative max-w-md w-full mx-4 my-3 p-4 
        border-2 ${messageStyles}
        transition-all duration-300 ease-in-out
        shadow-md hover:shadow-lg 
        group
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Message Content */}
            <div className="relative">
                {message.isDeleted ? (
                    <div className="flex items-center text-red-500">
                        <AlertTriangle className="mr-2" size={20} />
                        <span className="italic">Message Deleted</span>
                    </div>
                ) : (
                    <p className="text-base font-medium">{message.message}</p>
                )}

                {/* Timestamp */}
                {renderTimestamp()}

                {/* Like Counter */}
                {message.like.length > 0 && (
                    <div className="absolute bottom-[-15px] right-[-10px] flex items-center text-blue-600">
                        <ThumbsUp size={16} className="mr-1" />
                        <span className="text-xs">{message.like.length}</span>
                    </div>
                )}
            </div>

            {/* Action Menu */}
            {!message.isDeleted && (
                <Popover>
                    <PopoverTrigger
                        className={`
              absolute top-2 transition-opacity duration-300
              ${isHovered ? "opacity-100" : "opacity-0"}
              ${isOwnMessage ? "left-[-40px]" : "right-[-40px]"}
            `}
                    >
                        <button className="hover:bg-gray-100 p-2 rounded-full">
                            <MoreVertical size={20} className="text-gray-600" />
                        </button>
                    </PopoverTrigger>

                    <PopoverContent
                        className={`
              w-56 bg-white border shadow-lg rounded-lg
              ${isOwnMessage ? "left-[-60px]" : "right-[-60px]"}
            `}
                    >
                        <div className="py-1">
                            {isOwnMessage && (
                                <>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                                        <Edit2
                                            size={16}
                                            className="mr-2 text-blue-500"
                                        />
                                        Edit Message
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteMessage(message._id)
                                        }
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-red-500"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Delete Message
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleLike}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                            >
                                <ThumbsUp
                                    size={16}
                                    className="mr-2 text-blue-500"
                                />
                                Like Message
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
};

export default SingleMessage;
