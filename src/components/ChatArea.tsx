import "../css/ChatArea.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosAttach } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
import { useEffect, useRef, useState } from "react";
import axios from "@/services/api";
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
import { FileVideo, MoreVertical, Paperclip, Trash2, Video, File, Image } from "lucide-react";
import { API_ROUTES } from "@/utils/ApiRoutes";
import VideoCall from "./VideoCall";



const ChatArea = () => {
    const {
        removeChat,
        addMessage,
        setMessages,
        user,
        selectedChat,
        chatList,
        groupList,
        selectedChatType,
        messages,
        setSelectedChat,
        onlineUsers
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

    // Video Call State
    const [inCall, setInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{ signal: any; from: string; name: string } | null>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
        handleFetchAutoComplete();
    }, [messages]);

    useEffect(() => {
        if (selectedChat !== -1) {
            if (selectedChatType === "chat" && chatList[selectedChat]) {
                setChatId(chatList[selectedChat].id);
            } else if (selectedChatType === "group" && groupList[selectedChat]) {
                setChatId(groupList[selectedChat]._id);
            }
        }
    }, [selectedChat, selectedChatType, chatList, groupList]);

    useEffect(() => {
        if (chatId !== "") {
            fetchMessages();
        }
    }, [chatId]);

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (data) => {
            if (data.chatId === chatId) {
                addMessage(data.message);
            }
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

        socket.on("callUser", (data) => {
            // Only accept call if we are not already in one? or just show notification
            setIncomingCall({ signal: data.signal, from: data.from, name: data.name });
            setInCall(true); // Open the video call interface immediately with "Incoming" state
        });

        return () => {
            if (socket) {
                socket.off("newMessage");
                socket.off("removeChat");
                socket.off("callUser");
                socket.emit("leaveChat");
            }
        };
    }, [socket, chatId]);

    const handleFetchSuggestions = async () => {
        if (!newMessage.trim()) return;
        try {
            const resp = await axios.get(
                `${API_ROUTES.CHAT.CHAT_SUGGESTION}?textContent=${newMessage}`
            );
            setSuggestionsToShow(resp.data.split(","));
        } catch (err: any) {
            if (err.response && err.response.data) {
                const { message } = err.response.data;

                console.error("Suggestion fetch failed:", message);

            } else {
                console.error("Suggestion fetch error");

            }
            console.error(err);
        }
    };

    const fetchMessages = async () => {
        try {
            const fetchedMessages = await axios.get(
                `${API_ROUTES.MESSAGES.ALL_MESSAGES}/${chatId}`
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
                    otherSideUser: selectedChatType === "chat" ? chatList[selectedChat].participant.email : "",
                    messageType: "text",
                };
                try {
                    setNewMessage("");
                    const res = await axios.post(
                        `${API_ROUTES.MESSAGES.NEW_MESSAGE}/${chatId}`,
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
                `${API_ROUTES.CHAT.REPLY_SUGGESTION}?textContent=${messages[messages.length - 1].message
                }`
            );
            setSuggestionsToShow(resp.data.split(","));
        } catch (err: any) {
            if (err.response && err.response.data) {
                const { message } = err.response.data;
                console.error(message);
            } else {
                console.error("Something went wrong");
            }
            console.error(err);
        }
    };

    const handleDeleteChat = async () => {
        if (selectedChatType !== "chat") return; // Group deletion not implemented yet
        try {
            const res = await axios.delete(
                `${API_ROUTES.CHAT.DELETE_CHAT}/${chatId}`,
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
        <div className="w-3/4 h-screen flex flex-col relative">
            {inCall && user && selectedChat !== -1 && selectedChatType === "chat" && (
                <VideoCall
                    chatIds={{
                        currentUserId: user.email!,
                        chatPartnerId: chatList[selectedChat].participant.email
                    }}
                    onEndCall={() => {
                        setInCall(false);
                        setIncomingCall(null);
                    }}
                    incomingCall={incomingCall ? incomingCall : undefined}
                    isIncomingCall={!!incomingCall}
                />
            )}
            <nav className="flex items-center justify-between p-2 bg-white shadow-md border-b border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12 border-2 border-emerald-100 shadow-sm">
                                <AvatarImage
                                    src={
                                        selectedChat !== -1
                                            ? selectedChatType === "chat"
                                                ? chatList[selectedChat]?.participant?.profilePic
                                                : groupList[selectedChat]?.groupIcon
                                            : "https://github.com/shadcn.png"
                                    }
                                    alt="Chat participant avatar"
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold">
                                    {selectedChat !== -1
                                        ? selectedChatType === "chat"
                                            ? getInitials(chatList[selectedChat]?.participant?.username)
                                            : getInitials(groupList[selectedChat]?.groupName)
                                        : "CN"}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <h2 className="text-xl font-bold text-emerald-800 tracking-tight">
                                    {selectedChat !== -1
                                        ? selectedChatType === "chat"
                                            ? chatList[selectedChat]?.participant.username
                                            : groupList[selectedChat]?.groupName
                                        : "General Chat"}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {selectedChat !== -1
                                        ? selectedChatType === "chat"
                                            ? onlineUsers.includes(chatList[selectedChat].participant.email) ? "🟢 Active now" : "Offline"
                                            : `${groupList[selectedChat]?.participants?.length || 0} members`
                                        : "Default channel"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                    {selectedChat !== -1 && selectedChatType === "chat" && (
                        <button
                            onClick={() => {
                                setIncomingCall(null); // Ensure we are caller
                                setInCall(true);
                            }}
                            className="rounded-full p-2 hover:bg-emerald-50 transition-colors group"
                            title="Video Call"
                        >
                            <Video
                                size={22}
                                className="text-gray-600 group-hover:text-emerald-600 transition-colors"
                            />
                        </button>
                    )}

                    {/* Attachment Popover */}
                    {selectedChat !== -1 ? (
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
                    ) : (
                        <div className="rounded-full p-2 opacity-50 cursor-not-allowed">
                            <Paperclip size={22} className="text-gray-400" />
                        </div>
                    )}

                    {selectedChat !== -1 ? (
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
                    ) : (
                        <div className="rounded-full p-2 opacity-50 cursor-not-allowed">
                            <MoreVertical size={22} className="text-gray-400" />
                        </div>
                    )}
                </div>
            </nav>
            <div
                className={`flex flex-col flex-grow overflow-y-auto ${backgroundColors[user?.background as number] || "bg-slate-50"
                    }`}
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
