import "../css/ChatArea.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosAttach } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiMicrophoneOn } from "react-icons/ci";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { io, Socket } from "socket.io-client";
import useChatStore from "../store/useStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { AiOutlineClose } from "react-icons/ai";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const API_URL = import.meta.env.VITE_API_URL;
let socket: Socket;

const ChatArea = () => {
    const { chatId } = useParams();
    const [showMenu, setShowMenu] = useState(false);
    const { messages, addMessage, setMessages, deleteChatList, user } =
        useChatStore();
    const [showCrossIcon, setShowCrossIcon] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        // fetchMessages();
        if (!socket) socket = io(API_URL);

        socket.emit("joinChat", chatId);

        socket.on("receiveMessage", (message) => {
            addMessage(message);
            scrollToBottom();
        });

        return () => {
            socket.off("receiveMessage");
            socket.emit("leaveChat", chatId);
        };
    }, [chatId]);

    useEffect(() => {
        window.addEventListener("load", scrollToBottom);
        return () => window.removeEventListener("load", scrollToBottom);
    }, [chatId]);

    const scrollToBottom = () => {
        window.scrollTo(100, document.body.scrollHeight);
    };

    const fetchMessages = async () => {
        try {
            const fetchedMessages = await axios.get(
                `${API_URL}/api/messages/${chatId}`
            );
            setMessages(fetchedMessages.data);
            scrollToBottom();
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    };

    const handleSendMessage = async (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (newMessage.trim()) {
                const messageData = {
                    chatId,
                    senderName: user,
                    message: newMessage,
                };

                try {
                    setNewMessage("");
                    await axios.post(
                        `${API_URL}/api/messages/newMessage`,
                        messageData
                    );
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            }
        }
    };

    const handleDeleteChat = async () => {
        try {
            const res = await axios.delete(
                `${API_URL}/api/chat/deleteChat/${chatId}`
            );
            console.log(res);
            deleteChatList(chatId as string);
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const onEmojiClick = (emojidata: EmojiClickData) => {
        setNewMessage((prevMessage) => prevMessage + emojidata.emoji);
    };

    const calculateDaysAgo = (isoDate: Date) => {
        const pastDate = new Date(isoDate);
        const currentDate = new Date();
        const differenceInMs = currentDate.getTime() - pastDate.getTime();
        const differenceInDays = Math.floor(
            differenceInMs / (24 * 60 * 60 * 1000)
        );
        return differenceInDays;
    };

    function getInitials(name: string) {
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

    return (
        <div className="w-3/4 h-screen flex flex-col">
            <nav className="flex h-19 items-center justify-between p-3 bg-slate-50">
                <div className="flex items-center gap-5 pl-3">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <h2>{messages.name}</h2>
                </div>
                <div className="flex gap-5">
                    <IoIosAttach size={25} className="cursor-pointer" />
                    <Popover>
                        <PopoverTrigger>
                            <BsThreeDotsVertical
                                size={25}
                                className="cursor-pointer"
                            />
                        </PopoverTrigger>
                        <PopoverContent className="w-56 flex flex-col items-start">
                            <div
                                className="cursor-pointer w-full pl-2"
                                onClick={handleDeleteChat}
                            >
                                Delete chat
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </nav>
            <div
                className="flex flex-col flex-grow"
                style={{ backgroundImage: `url(${user?.background}.png)` }}
            >
                {messages?.messages?.map((message, id) => {
                    const day = calculateDaysAgo(message.time);
                    return (
                        <div
                            key={id}
                            className={`chat ${
                                message.senderName === user ? "right" : "left"
                            }`}
                        >
                            <p>{message.message}</p>
                            <h6>{`${
                                day === 0
                                    ? "Today at"
                                    : day === 1
                                    ? "Yesterday at"
                                    : `${day} days ago at`
                            } ${moment(message.time).format("LT")}`}</h6>
                        </div>
                    );
                })}
            </div>
            <footer className="flex gap-3 rounded items-center relative mt-3 pl-2 pr-2 bg-slate-100 h-1/10">
                <MdOutlineEmojiEmotions
                    className="cursor-pointer"
                    size={25}
                    color="black"
                    onClick={() => {
                        setShowEmojiPicker((prev) => !prev);
                        setShowCrossIcon((prev) => !prev);
                    }}
                />
                <div className="emoji-container">
                    {showCrossIcon && (
                        <AiOutlineClose
                            className="z-10 absolute top-1 right-1 cursor-pointer"
                            size={20}
                            onClick={() => {
                                setShowEmojiPicker(false);
                                setShowCrossIcon((prev) => !prev);
                            }}
                        />
                    )}
                    {showEmojiPicker && (
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            height={350}
                            width={300}
                            className="cursor-pointer"
                            skinTonesDisabled
                        />
                    )}
                </div>
                <textarea
                    className="bg-slate-50  outline-none p-2 text-xl max-h-[80px] rounded flex-wrap w-full resize-none"
                    placeholder="Enter message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleSendMessage}
                />
                <CiMicrophoneOn
                    className={"cursor-pointer"}
                    size={25}
                    color="black"
                />
            </footer>
        </div>
    );
};

export default ChatArea;
