import React, { useEffect, useState } from "react";
import { PopoverClose } from "@radix-ui/react-popover";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import useChatStore from "@/store/useStore";
import { Message } from "@/interfaces/message.interface";
import moment from "moment";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidErrorAlt } from "react-icons/bi";
import axios from "axios";
import { useSocket } from "@/context/SocketContext";

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

    const { socket } = useSocket();
    const day = calculateDaysAgo(message.updatedAt);
    const { user, chatList, selectedChat } = useChatStore();
    const [showMenuIcon, setShowMenuIcon] = useState<boolean>(false);

    const handleDeleteMessage = async (id: string) => {
        await axios.delete(`${API_URL}/api/messages/delete/${id}`, {
            data: {
                loggedUserEmail: user?.email,
                otherSideUserEmail: chatList[selectedChat].participant.email,
            },
        });
    };

    useEffect(() => {
        if (!socket) return;

        socket.on("deleteMessage", (data) => {
            console.log(data);
        });

        return () => {
            if (socket) {
                socket.off("deleteMessage");
                socket.emit("leaveChat");
            }
        };
    }, [socket]);

    return (
        <div
            key={id}
            onMouseEnter={() => setShowMenuIcon(true)}
            onMouseLeave={() => setShowMenuIcon(false)}
            className={`relative  max-w-sm	m-3 p-3 rounded-br-2xl
                        ${
                            message.senderEmail === user?.email
                                ? "right"
                                : "left"
                        }
                        `}
        >
            <div className="flex flex-col">
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
                        <div className="cursor-pointer w-full p-2  hover:bg-gray-200 mt-1">
                            Like Chat
                        </div>
                    </PopoverClose>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default SingleMessage;
