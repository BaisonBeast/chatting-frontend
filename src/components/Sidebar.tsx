import "../css/Sidebar.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { FiCheck, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import useChatStore from "../store/useStore";
import { io, Socket } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { HashLoader } from "react-spinners";
import UpdateUser from "./UpdateUser";
import { PopoverClose } from "@radix-ui/react-popover";

const API_URL = import.meta.env.VITE_API_URL;

let socket: Socket;

interface Participient {
    username: string;
    profilePic: string;
}

interface ChatList {
    participent: Participient;
    lastSeen: string;
}

interface SingleChat {
    createdAt: string;
    participents: Participient[];
    updatedAt: string;
}

interface Invite {
    _id: string;
    username: string;
    profilePic: string;
    email: string;
}

const Sidebar = () => {
    const { addChat, setUser, user } = useChatStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [inviteIsOpen, setinviteIsOpen] = useState(false);
    const [chatIsOpen, setchatIsOpen] = useState(false);
    const [groupIsOpen, setGroupIsOpen] = useState(false);
    const [inviteList, setInviteList] = useState<Invite[]>([]);
    const [chatList, setChatList] = useState<ChatList[]>([]);
    const [groupList, setGroupList] = useState([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState<boolean>(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchAllChatList();
        fetchAllInviteList();

        if (!socket) socket = io(API_URL);
        socket.on("cratedChat", (message) => {
            addChat(message);
        });
        return () => {
            socket.off("crateChat");
        };
    }, []);

    const fetchAllChatList = async () => {
        try {
            const resp = await axios.get(`${API_URL}/api/chat/getAllChats`, {
                params: {
                    email: user?.email,
                },
            });
            const chatList = resp.data.data.map((chat: SingleChat) => {
                const [firstParticipant, secondParticipant] = chat.participents;
                const isUserFirst =
                    firstParticipant.username === user?.username;

                const obj: Participient = {
                    username: isUserFirst
                        ? secondParticipant.username
                        : firstParticipant.username,
                    profilePic: isUserFirst
                        ? secondParticipant.profilePic
                        : firstParticipant.profilePic,
                };

                return {
                    participents: obj,
                    lastSeen: chat.updatedAt,
                };
            });

            setChatList(chatList);
        } catch (err) {
            toast({
                title: "Something went wrong",
                description: "Please try again after some time...",
            });
        }
    };

    const fetchAllInviteList = async () => {
        try {
            const resp = await axios.get(`${API_URL}/api/chat/getAllInvites`, {
                params: {
                    email: user?.email,
                },
            });
            setInviteList(resp.data.data);
        } catch (err) {
            toast({
                title: "Something went wrong",
                description: "Please try again after some time...",
            });
        }
    };

    const filteredChats = chatList.filter((chat) =>
        chat.participent.username
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const filterInviteList = (email: string) => {
        const newInviteList = inviteList.filter(
            (invite) => invite.email !== email
        );
        setInviteList(newInviteList);
    };

    const handleInvite = async () => {
        if(inviteEmail === '') {
            toast({title: 'Pleaes enter the email whome you want to invite'});
            return;
        }
        try {
            setLoading(true);
            const resp = await axios.post(`${API_URL}/api/chat/inviteUser`, {
                invitedEmail: inviteEmail,
                inviteeEmail: user?.email,
                inviteeUsername: user?.username,
                inviteeProfilePic: user?.profilePic,
            });
            toast({
                title: `${resp.data.message}`,
            });
            setInviteEmail("");
        } catch (err) {
            console.log(err);
            toast({
                title: "Something went wrong",
                description: "Please try again after some time...",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

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

    const handleAcceptInvite = async (email: string) => {
        try {
            const resp = await axios.post(`${API_URL}/api/chat/acceptInvite`, {
                loggedUserEmail: user?.email,
                newUserEmail: email,
            });

            if (resp.data.status === "success") {
                toast(resp.data.message);
                filterInviteList(email);
            } else if (resp.data.status === "failed") {
                toast(resp.data.message);
            } else {
                toast({ title: "Unexpected response received." });
            }
        } catch (err: any) {
            if (err.response && err.response.data) {
                const { message } = err.response.data;
                toast({
                    title: "Invalid credentials",
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

    const handleRejectInvite = async (email: string) => {
        try {
            const resp = await axios.post(`${API_URL}/api/chat/rejectInvite`, {
                loggedUserEmail: user?.email,
                newUserEmail: email,
            });
            toast(resp.data.message);
            filterInviteList(email);
        } catch (err: any) {
            if (err.response && err.response.data) {
                const { message } = err.response.data;
                toast({
                    title: "Invalid credentials",
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

    return (
        <div className="w-1/4 h-screen flex flex-col">
            {/* Navbar */}
            <nav className="flex w-full items-center justify-between border-b-2 p-3 h-15">
                <Sheet>
                    <SheetTrigger asChild>
                        <Avatar className="cursor-pointer">
                            <AvatarImage src={`${user?.profilePic}`} />
                            <AvatarFallback>
                                {getInitials(user?.username as string)}
                            </AvatarFallback>
                        </Avatar>
                    </SheetTrigger>
                    <UpdateUser />
                </Sheet>
                <div className="flex align-center">
                    <Popover>
                        <PopoverTrigger>
                            <MdOutlineMessage
                                size={25}
                                className="mr-4 cursor-pointer"
                            />
                        </PopoverTrigger>
                        <PopoverContent className="flex justify-center bg-slate-50 h-60 w-60">
                            <div className=" w-[98%] bg-slate-100 rounded flex flex-col justify-center items-center gap-5">
                                <h2>Invite a friend</h2>
                                <Input
                                    placeholder="Email"
                                    className="w-[95%]"
                                    value={inviteEmail}
                                    onChange={(e) =>
                                        setInviteEmail(e.target.value)
                                    }
                                />
                                <PopoverClose>
                                    <Button onClick={handleInvite}>
                                        {loading ? <HashLoader /> : "Invite"}
                                    </Button>
                                </PopoverClose>
                            </div>
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
                            <div
                                className="cursor-pointer pl-2 w-full"
                                onClick={handleLogout}
                            >
                                Logout
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </nav>

            {/* Search */}
            <div className="bg-slate-600 w-full relative h-12 border-b-2">
                <CiSearch className="absolute text-2xl top-3 left-2" />
                <input
                    className="border-none outline-none h-full w-full pl-8 text-lg"
                    type="text"
                    placeholder="Search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                />
            </div>

            <div className="flex flex-col flex-grow overflow-y-auto">
                {/* Invite List */}
                <div className="w-full max-w-full mx-auto">
                    <Collapsible
                        open={inviteIsOpen}
                        onOpenChange={setinviteIsOpen}
                        className="w-full"
                    >
                        <CollapsibleTrigger asChild>
                            <div className="p-5 w-full bg-slate-50 cursor-pointer text-xl flex justify-between">
                                Invites
                                {inviteIsOpen ? (
                                    <IoIosArrowUp />
                                ) : (
                                    <IoIosArrowDown />
                                )}
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            {inviteList.length > 0 ? (
                                inviteList.map((invite, indx) => (
                                    <div
                                        key={invite._id}
                                        className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md"
                                    >
                                        <div className="flex items-center">
                                            <Avatar>
                                                {invite.profilePic ? (
                                                    <AvatarImage
                                                        src={invite.profilePic}
                                                        alt={invite.username}
                                                    />
                                                ) : (
                                                    <AvatarFallback>
                                                        {getInitials(
                                                            invite.username
                                                        )}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <span className="ml-2 font-medium">
                                                {invite.username}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-1 text-green-600 hover:bg-green-100 rounded-full"
                                                onClick={() =>
                                                    handleAcceptInvite(
                                                        invite.email
                                                    )
                                                }
                                            >
                                                <FiCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                                                onClick={() =>
                                                    handleRejectInvite(
                                                        invite.email
                                                    )
                                                }
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 bg-slate-200 pt-3 pb-3 pl-3">
                                    Please add friends to start chtting...
                                </p>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* Chat List */}
                <div className="w-full max-w-md mx-auto">
                    <Collapsible open={chatIsOpen} onOpenChange={setchatIsOpen}>
                        <CollapsibleTrigger asChild>
                            <div className="p-5 bg-slate-50 cursor-pointer text-xl flex justify-between">
                                Chat's
                                {chatIsOpen ? (
                                    <IoIosArrowUp />
                                ) : (
                                    <IoIosArrowDown />
                                )}
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            {chatList.length > 0 ? (
                                chatList.map((chat, indx) => (
                                    <div
                                        key={indx}
                                        className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md"
                                    >
                                        <div className="flex items-center">
                                            <Avatar>
                                                {chat.participent.profilePic ? (
                                                    <AvatarImage
                                                        src={
                                                            chat.participent
                                                                .profilePic
                                                        }
                                                        alt={
                                                            chat.participent
                                                                .username
                                                        }
                                                    />
                                                ) : (
                                                    <AvatarFallback>
                                                        {getInitials(
                                                            chat.participent
                                                                .username
                                                        )}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <span className="ml-2 font-medium">
                                                {chat.participent.username}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {moment(chat.lastSeen).format("LT")}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 bg-slate-200 pt-3 pb-3 pl-3">
                                    Please add friends to start chtting...
                                </p>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* Group List */}
                <div className="w-full max-w-md mx-auto">
                    <Collapsible
                        open={groupIsOpen}
                        onOpenChange={setGroupIsOpen}
                    >
                        <CollapsibleTrigger asChild>
                            <div className="p-5 bg-slate-50 cursor-pointer text-xl flex justify-between">
                                Group's
                                {groupIsOpen ? (
                                    <IoIosArrowUp />
                                ) : (
                                    <IoIosArrowDown />
                                )}
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div>
                                {filteredChats.length > 0 ? (
                                    filteredChats.map((chat, indx) => (
                                        <div
                                            key={indx}
                                            className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md"
                                        >
                                            <div className="flex items-center">
                                                <Avatar>
                                                    {/* {groupList.avatar ? (
                                                        <AvatarImage
                                                            src={
                                                                groupList.avatar
                                                            }
                                                            alt={
                                                                groupList.username
                                                            }
                                                        />
                                                    ) : (
                                                        <AvatarFallback>
                                                            {getInitials(
                                                                chat.chatName
                                                            )}
                                                        </AvatarFallback>
                                                    )} */}
                                                </Avatar>
                                                <span className="ml-2 font-medium">
                                                    {/* {groupList.username} */}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {/* {moment(
                                                    groupList.chatTime
                                                ).format("LT")} */}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 bg-slate-200 pt-3 pb-3 pl-3">
                                        Please create groups....
                                    </p>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
