import "../css/ChatArea.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosAttach } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiMicrophoneOn } from "react-icons/ci";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import useChatStore from "../store/useStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { AiOutlineClose } from "react-icons/ai";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSocket } from "@/context/SocketContext";
import blank_image from "../assets/blank_image.jpg";
import { useToast } from "@/hooks/use-toast";
import { PopoverClose } from "@radix-ui/react-popover";
import SingleMessage from "./SingleMessage";

const API_URL = import.meta.env.VITE_API_URL;

const ChatArea = () => {
    const {
        removeChat,
        addMessage,
        setMessages,
        user,
        selectedChat,
        chatList,
        messages,
        setSelectedChat,
    } = useChatStore();
    const [showCrossIcon, setShowCrossIcon] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [chatId, setChatId] = useState("");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [messagesToShow, setMessagesToShow] = useState(20);

    const { toast } = useToast();
    const { socket } = useSocket();

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (selectedChat !== -1) setChatId(chatList[selectedChat].id);
    }, [selectedChat]);

    useEffect(() => {
        if (chatId !== "") fetchMessages();
    }, [chatId]);

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (data) => {
            console.log(data)
            addMessage(data.message);
        });

        socket.on("removeChat", (data) => {
            toast({
                title: "Chat removed",
                description: `${data.message}`,
            });
            const chatId = data.chatId;
            removeChat(chatId);
            setSelectedChat(-1);
        });

        return () => {
            if (socket) {
                socket.off("newMessage");
                socket.off("removeChat");
                socket.emit("leaveChat");
            }
        };
    }, [socket]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    const handleScroll = () => {
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            if (messagesToShow < messages.length) {
                setMessagesToShow((prev) =>
                    Math.min(prev + 20, messages.length)
                );
            }
        }
    };

    const displayedMessages = messages.slice(
        Math.max(messages.length - messagesToShow, 0)
    );

    const fetchMessages = async () => {
        try {
            const fetchedMessages = await axios.get(
                `${API_URL}/api/messages/allMessage/${chatId}`
            );
            setMessages(fetchedMessages.data.data);
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

    const handleSendMessage = async (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && selectedChat !== -1) {
            e.preventDefault();
            if (newMessage.trim()) {
                const messageData = {
                    message: newMessage,
                    loggedInUser: user?.email,
                    otherSideUser: chatList[selectedChat].participant.email,
                    messageType: 'text'
                };
                try {
                    setNewMessage("");
                    const res = await axios.post(
                        `${API_URL}/api/messages/newMessage/${chatId}`,
                        messageData
                    );
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
            }
        }
    };

    const handleDeleteChat = async () => {
        try {
            const res = await axios.delete(
                `${API_URL}/api/chat/deleteChat/${chatId}`,
                {
                    data: {
                        loggedUserEmail: user?.email,
                        otherSideUserEmail:
                            chatList[selectedChat].participant.email,
                    },
                }
            );
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

    const onEmojiClick = (emojidata: EmojiClickData) => {
        setNewMessage((prevMessage) => prevMessage + emojidata.emoji);
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
                        <AvatarImage
                            src={
                                selectedChat !== -1
                                    ? chatList[selectedChat]?.participant
                                          ?.profilePic
                                    : "https://github.com/shadcn.png"
                            }
                        />
                        <AvatarFallback>
                            {selectedChat !== -1
                                ? getInitials(
                                      chatList[selectedChat]?.participant
                                          ?.username as string
                                  )
                                : "CN"}
                        </AvatarFallback>
                    </Avatar>
                    <h2>
                        {selectedChat !== -1
                            ? chatList[selectedChat].participant.username
                            : "General"}
                    </h2>
                </div>
                <div className="flex gap-5">
                    <Popover>
                        <PopoverTrigger>
                            <IoIosAttach size={25} className="cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="w-56 flex flex-col  ">
                            <PopoverClose className="w-full">
                                <div className="cursor-pointer w-full p-2 hover:bg-gray-200 text-start">
                                    Attach photo
                                </div>
                                <div className="cursor-pointer w-full p-2 hover:bg-gray-200  text-start">
                                    Attach Video
                                </div>
                                <div className="cursor-pointer w-full p-2 hover:bg-gray-200  text-start">
                                    Attach file
                                </div>
                            </PopoverClose>
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger>
                            <BsThreeDotsVertical
                                size={25}
                                className="cursor-pointer"
                            />
                        </PopoverTrigger>
                        <PopoverContent className="w-56 flex flex-col items-start">
                            <PopoverClose>
                                <div
                                    className="cursor-pointer w-full pl-2"
                                    onClick={handleDeleteChat}
                                >
                                    Delete chat
                                </div>
                            </PopoverClose>
                        </PopoverContent>
                    </Popover>
                </div>
            </nav>
            <div
                className="flex flex-col flex-grow overflow-y-auto"
                style={
                    user
                        ? {
                              backgroundImage: `url(${
                                  user.background + 1
                              }.png)`,
                              filter: "grayscale(10%) contrast(80%)",
                          }
                        : undefined
                }
                ref={containerRef}
            >
                {selectedChat !== -1 ? (
                    displayedMessages?.map((message, id) => {
                        return <SingleMessage message={message} id={id} />;
                    })
                ) : (
                    <img className="h-full w-full" src={blank_image} />
                )}
            </div>
            {selectedChat !== -1 && (
                <footer className="flex gap-3 rounded items-center relative pl-2 pr-2 bg-slate-100">
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
                                className="z-10 absolute top-0 right-1 cursor-pointer"
                                size={20}
                                onClick={() => {
                                    setShowEmojiPicker(false);
                                    setShowCrossIcon((prev) => !prev);
                                }}
                            />
                        )}
                        {showEmojiPicker && (
                            <EmojiPicker
                                onEmojiClick={(emojidata) => {
                                    onEmojiClick(emojidata);
                                    setShowEmojiPicker((prev) => !prev);
                                    setShowCrossIcon((prev) => !prev);
                                }}
                                height={350}
                                width={300}
                                className="cursor-pointer"
                                skinTonesDisabled
                            />
                        )}
                    </div>
                    <textarea
                        className="bg-slate-50  outline-none p-2 text-xl rounded flex-wrap w-full resize-none tracking-wider"
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
            )}
        </div>
    );
};

export default ChatArea;
