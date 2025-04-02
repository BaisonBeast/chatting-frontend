import "../css/ChatArea.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosAttach } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
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
import { useToast } from "@/hooks/use-toast";
import { PopoverClose } from "@radix-ui/react-popover";
import SingleMessage from "./SingleMessage";
import BlankChatArea from "./BlankChatArea";
import useSpeechToText from "react-hook-speech-to-text";
import { backgroundColors } from "./UpdateUser";
import { FileVideo, MoreVertical, Paperclip, Trash2 } from "lucide-react";

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
    const [suggestionsToShow, setSuggestionsToShow] = useState([]);
    const { isRecording, results, startSpeechToText, stopSpeechToText } =
        useSpeechToText({
            continuous: true,
        });
    const { toast } = useToast();
    const { socket } = useSocket();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
        handleFetchAutoComplete();
    }, [messages]);

    useEffect(() => {
        if (selectedChat !== -1) {
            setChatId(chatList[selectedChat].id);
        }
    }, [selectedChat]);

    useEffect(() => {
        if (chatId !== "") {
            fetchMessages();
        }
    }, [chatId]);

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (data) => {
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

    const handleFetchSuggestions = async () => {
        if (!newMessage.trim()) return;
        try {
            const resp = await axios.get(
                `${API_URL}/api/chat/chatSuggestion?textContent=textContent=${newMessage}`
            );
            setSuggestionsToShow(resp.data.split(","));
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
                    messageType: "text",
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

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (newMessage.trim()) {
                handleFetchSuggestions();
            }
        }, 1500);

        return () => clearTimeout(debounceTimer);
    }, [newMessage]);

    const handleFetchAutoComplete = async () => {
        if (messages.length === 0) return;
        try {
            const resp = await axios.get(
                `${API_URL}/api/chat/replySuggestion?textContent=${
                    messages[messages.length - 1].message
                }`
            );
            setSuggestionsToShow(resp.data.split(","));
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

    useEffect(() => {
        if (!isRecording && results.length > 0) {
            const transcripts = results.map((result) => result).join(" ");

            setNewMessage((prev) => prev + " " + transcripts);

            results.splice(0, results.length);
            inputRef?.current?.focus();
        }
    }, [results, isRecording]);

    const handleStopSpeech = () => {
        stopSpeechToText();
    };

    return (
        <div className="w-3/4 h-screen flex flex-col">
            <nav className="flex items-center justify-between p-2 bg-white shadow-md border-b border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 border-2 border-emerald-100 shadow-sm">
                            <AvatarImage
                                src={
                                    selectedChat !== -1
                                        ? chatList[selectedChat]?.participant
                                              ?.profilePic
                                        : "https://github.com/shadcn.png"
                                }
                                alt="Chat participant avatar"
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold">
                                {selectedChat !== -1
                                    ? getInitials(
                                          chatList[selectedChat]?.participant
                                              ?.username
                                      )
                                    : "CN"}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <h2 className="text-xl font-bold text-emerald-800 tracking-tight">
                                {selectedChat !== -1
                                    ? chatList[selectedChat].participant
                                          .username
                                    : "General Chat"}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {selectedChat !== -1
                                    ? "Active now"
                                    : "Default channel"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                    {/* Attachment Popover */}
                    <Popover>
                        <PopoverTrigger className="rounded-full p-2 hover:bg-gray-100 transition-colors group">
                            <Paperclip
                                size={22}
                                className="text-gray-600 group-hover:text-emerald-600 transition-colors"
                            />
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-64 bg-white shadow-xl rounded-xl border-none p-2"
                        >
                            <PopoverClose className="w-full">
                                {[
                                    { icon: Image, label: "Attach Photo" },
                                    { icon: FileVideo, label: "Attach Video" },
                                    { icon: File, label: "Attach File" },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                                    >
                                        <span className="text-sm text-gray-700">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </PopoverClose>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger className="rounded-full p-2 hover:bg-gray-100 transition-colors group">
                            <MoreVertical
                                size={22}
                                className="text-gray-600 group-hover:text-emerald-600 transition-colors"
                            />
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-64 bg-white shadow-xl rounded-xl border-none p-2"
                        >
                            <PopoverClose className="w-full">
                                <div
                                    onClick={handleDeleteChat}
                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-red-50 cursor-pointer transition-colors group"
                                >
                                    <Trash2
                                        size={20}
                                        className="text-red-500 group-hover:text-red-600"
                                    />
                                    <span className="text-sm text-red-600 group-hover:text-red-700">
                                        Delete Chat
                                    </span>
                                </div>
                            </PopoverClose>
                        </PopoverContent>
                    </Popover>
                </div>
            </nav>
            <div
                className="flex flex-col flex-grow overflow-y-auto"
                style={{
                    background: `${
                        backgroundColors[user?.background as number]
                    }`,
                }}
                ref={containerRef}
            >
                {selectedChat !== -1 ? (
                    messages?.map((message, id) => {
                        return (
                            <SingleMessage message={message} id={id} key={id} />
                        );
                    })
                ) : (
                    <BlankChatArea />
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
                    <div
                        className="
                            left-0 
                            right-0 
                            overflow-x-auto 
                            whitespace-nowrap 
                            py-2 
                            px-4 
                            shadow-sm 
                            z-10
                            absolute
                            bottom-20
                        "
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        <div className="flex items-center space-x-2 overflow-x-auto">
                            {suggestionsToShow.map(
                                (suggestion: string, index) =>
                                    suggestion?.length > 0 && (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setNewMessage(
                                                    newMessage + suggestion
                                                );
                                                inputRef?.current?.focus();
                                            }}
                                            className="
                px-3 
                py-1 
                text-sm 
                bg-blue-100 
                text-blue-800 
                rounded-full 
                cursor-pointer 
                hover:bg-blue-200 
                transition-colors 
                duration-200 
                flex-shrink-0
                shadow-sm
                hover:shadow-md
                active:scale-95
              "
                                        >
                                            {suggestion}
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                    <textarea
                        className="bg-slate-50  outline-none p-2 text-xl rounded flex-wrap w-full resize-none tracking-wider"
                        placeholder="Enter message"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                        }}
                        onKeyDown={handleSendMessage}
                        ref={inputRef}
                        autoFocus
                    />
                    {isRecording ? (
                        <CiMicrophoneOff
                            className="cursor-pointer"
                            size={25}
                            color="red"
                            onClick={handleStopSpeech}
                        />
                    ) : (
                        <CiMicrophoneOn
                            className="cursor-pointer"
                            size={25}
                            color="black"
                            onClick={startSpeechToText}
                        />
                    )}
                </footer>
            )}
        </div>
    );
};

export default ChatArea;
