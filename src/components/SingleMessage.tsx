import React, { useEffect, useState } from "react";
import { PopoverClose } from "@radix-ui/react-popover";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import useChatStore from "@/store/useStore";
import { Message, Messages } from "@/interfaces/message.interface";
import moment from "moment";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidErrorAlt } from "react-icons/bi";
import axios from "axios";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";

interface SingleMessageProps {
    message: Message;
    id: number;
}

const API_URL = import.meta.env.VITE_API_URL;

const SingleMessage: React.FC<SingleMessageProps> = ({ message, id }) => {
    const calculateDaysAgo = (isoDate: string) => {
        const pastDate = new Date(isoDate);
        const currentDate = new Date();
        const differenceInMs = currentDate.getTime() - pastDate.getTime();
        const differenceInDays = Math.floor(
            differenceInMs / (24 * 60 * 60 * 1000)
        );
        return differenceInDays;
    };

    const { toast } = useToast();
    const { socket } = useSocket();
    const day = calculateDaysAgo(message.updatedAt);
    const { user, messages, chatList, selectedChat, setMessages } =
        useChatStore();
    const [showMenuIcon, setShowMenuIcon] = useState<boolean>(false);

    const handleDeleteMessage = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/messages/delete/${id}`, {
                data: {
                    loggedUserEmail: user?.email,
                    otherSideUserEmail:
                        chatList[selectedChat].participant.email,
                },
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error deleting message",
                description:
                    "Failed to delete message. Please try again later.",
            });
        }
    };

    const handleLike = async () => {
        try {
            const resp = await axios.post(
                `${API_URL}/api/messages/likeMessage`,
                {
                    messageId: message._id,
                    likeGivenUserEmail: user?.email,
                    otherSideUserEmail: chatList[selectedChat].participant.email,
                }
            );
            console.log(resp.data);
        } catch (err: any) {
            if (err.response && err.response.data) {
                const { message } = err.response.data;

                toast({
                    title: "Please try again",
                    description: `${message}`,
                });
            } else {
                toast({
                    title: "Something went wrong",
                    description: "Please try again after some time...",
                });
            }
            console.error(err);
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.on("deleteMessage", (data) => {});
        socket.on("likemessage", (data) => {
            console.log(data);
            const newMessages: Messages = messages.map((msg) => {
                if (msg._id === data.messageId) {
                    msg.like.push(data.email);
                }
                return msg;
            });
            setMessages(newMessages);
        });

        return () => {
            if (socket) {
                socket.off("deleteMessage");
                socket.off("likemessage");
                socket.emit("leaveChat");
            }
        };
    }, [socket]);

    return (
        <div
            key={id}
            onMouseEnter={() => setShowMenuIcon(true)}
            onMouseLeave={() => setShowMenuIcon(false)}
            className={`relative  max-w-sm	m-3 p-3 rounded-br-2xl mr-6
                        ${
                            message.senderEmail === user?.email
                                ? "right"
                                : "left"
                        }
                        `}
        >
            <div className="flex flex-col relative">
                <p className="text-lg font-medium">
                    {message.isDeleted ? <BiSolidErrorAlt /> : message.message}
                </p>
                <h6 className="text-[10px] text-end">{`${
                    day === 0
                        ? "Today at"
                        : day === 1
                        ? "Yesterday at"
                        : `${day} days ago at`
                } ${moment(message.updatedAt).format("LT")}`}</h6>
                {message.like.length > 0 && (
                    <p className={`absolute right-[-35px] bottom-[-15px] `}>
                        👍{message.like.length}
                    </p>
                )}
            </div>
            <Popover>
                <PopoverTrigger
                    className={`absolute top-0 ${
                        message.senderEmail === user?.email
                            ? "left-[-20px]"
                            : "right-[5px]"
                    }`}
                >
                    <BsThreeDotsVertical
                        size={25}
                        className={`absolute top-5 cursor-pointer 
                            ${showMenuIcon ? "" : "hidden"}
                            `}
                    />
                </PopoverTrigger>
                <PopoverContent
                    className={`w-56 flex flex-col absolute top-[-10px] ${
                        message.senderEmail === user?.email
                            ? "right-[-17px]"
                            : "left-0"
                    }`}
                >
                    <PopoverClose className="text-start ">
                        <div className="cursor-pointer w-full p-2  hover:bg-gray-200 mt-1 ">
                            Edit Chat
                        </div>
                        <div
                            className="cursor-pointer w-full p-2  hover:bg-gray-200 mt-1"
                            onClick={() => handleDeleteMessage(message._id)}
                        >
                            Delete Chat
                        </div>
                        <div
                            className="cursor-pointer w-full p-2  hover:bg-gray-200 mt-1"
                            onClick={handleLike}
                        >
                            Like Chat
                        </div>
                    </PopoverClose>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default SingleMessage;
