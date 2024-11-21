import "../css/Sidebar.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import axios from "axios";
import useChatStore from "../store/useStore";
import { io, Socket } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { HashLoader } from "react-spinners";
import UpdateUser from "./UpdateUser";
import { PopoverClose } from "@radix-ui/react-popover";
import InviteList from "./InviteList";
import ChatList from "./ChatList";
import GroupList from "./GroupList";

const API_URL = import.meta.env.VITE_API_URL;

let socket: Socket;

const Sidebar = () => {
    const { addChat, setUser, user } = useChatStore();

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState<boolean>(false);

    const { toast } = useToast();

    useEffect(() => {
        if (!socket) socket = io(API_URL);
        socket.on("cratedChat", (message) => {
            addChat(message);
        });
        return () => {
            socket.off("crateChat");
        };
    }, []);

    const handleInvite = async () => {
        if (inviteEmail === "") {
            toast({ title: "Pleaes enter the email whome you want to invite" });
            return;
        }
        if (inviteEmail === user?.email) {
            toast({ title: "Self invitation is not allowed" });
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
                <InviteList />

                {/* Chat List */}
                <ChatList searchTerm={searchTerm} />

                {/* Group List */}
                <GroupList />
            </div>
        </div>
    );
};

export default Sidebar;
