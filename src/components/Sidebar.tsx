import "../css/Sidebar.css";
import { CiSearch } from "react-icons/ci";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import axios from "@/services/api";
import useChatStore from "../store/useStore";
import { io, Socket } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { HashLoader } from "react-spinners";
import { PopoverClose } from "@radix-ui/react-popover";
import InviteList from "./InviteList";
import ChatList from "./ChatList";
import GroupList from "./GroupList";
import { LogOut, MoreVertical, Settings, UserPlus, Users, Monitor } from "lucide-react";
import UpdateUser from "./UpdateUser";
import CreateGroupModal from "./CreateGroupModal";
import { API_ROUTES } from "@/utils/ApiRoutes";

const API_URL = import.meta.env.VITE_API_URL;



const Sidebar = () => {
    const { addChat, setUser, user, isInviteOpen, setInviteOpen } = useChatStore();

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [updateProfileOpen, setUpdateProfileOpen] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

    const { toast } = useToast();



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
            const resp = await axios.post(API_ROUTES.CHAT.INVITE_USER, {
                recipientEmail: inviteEmail,
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
        const words = name?.trim().split(/\s+/);
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
        <div className="w-1/4 min-w-[320px] h-screen flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="flex w-full items-center justify-between px-4 py-3 max-w-7xl mx-auto">
                    {/* User Profile */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setUpdateProfileOpen(true)}>
                                <Avatar className="transition-all group-hover:scale-110">
                                    <AvatarImage
                                        src={user?.profilePic}
                                        alt={user?.username}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-blue-500 text-white">
                                        {getInitials(user?.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                        </SheetTrigger>
                        <UpdateUser
                            updateProfileOpen={updateProfileOpen}
                            setUpdateProfileOpen={setUpdateProfileOpen}
                        />
                    </Sheet>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4">
                        <CreateGroupModal
                            isOpen={isCreateGroupOpen}
                            onClose={() => setIsCreateGroupOpen(false)}
                        />

                        <button
                            onClick={() => setIsCreateGroupOpen(true)}
                            className="hover:bg-gray-100 p-2 rounded-full transition-colors group"
                            title="Create Group"
                        >
                            <Users
                                size={24}
                                className="text-gray-600 group-hover:text-blue-500 transition-colors"
                            />
                        </button>

                        {/* Invite Friend Popover */}
                        <Popover open={isInviteOpen} onOpenChange={setInviteOpen}>
                            <PopoverTrigger className="hover:bg-gray-100 p-2 rounded-full transition-colors group">
                                <UserPlus
                                    size={24}
                                    className="text-gray-600 group-hover:text-blue-500 transition-colors"
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-6 bg-white shadow-xl rounded-xl">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <UserPlus
                                            className="text-blue-500"
                                            size={30}
                                        />
                                        <h2 className="text-xl font-bold text-gray-800">
                                            Invite a Friend
                                        </h2>
                                    </div>
                                    <Input
                                        placeholder="Enter friend's email"
                                        value={inviteEmail}
                                        onChange={(e) =>
                                            setInviteEmail(e.target.value)
                                        }
                                        className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-blue-500 transition-colors"
                                    />
                                    <PopoverClose asChild>
                                        <Button
                                            onClick={handleInvite}
                                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                        >
                                            {loading ? (
                                                <HashLoader
                                                    size={20}
                                                    color="#ffffff"
                                                />
                                            ) : (
                                                <>
                                                    <UserPlus
                                                        className="mr-2"
                                                        size={20}
                                                    />
                                                    Send Invite
                                                </>
                                            )}
                                        </Button>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* More Options Popover */}
                        <Popover>
                            <PopoverTrigger className="hover:bg-gray-100 p-2 rounded-full transition-colors group">
                                <MoreVertical
                                    size={24}
                                    className="text-gray-600 group-hover:text-blue-500 transition-colors"
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-56 bg-white shadow-xl rounded-xl">
                                <div className="py-1">
                                    <div
                                        className="
                    flex items-center px-4 py-2 
                    hover:bg-gray-100 cursor-pointer 
                    transition-colors group
                  "
                                        onClick={() => {
                                            setUpdateProfileOpen(true);
                                        }}
                                    >
                                        <Settings
                                            size={20}
                                            className="mr-3 text-gray-500 group-hover:text-blue-500"
                                        />
                                        Settings
                                    </div>
                                    <div
                                        className="
                    flex items-center px-4 py-2 
                    hover:bg-gray-100 cursor-pointer 
                    transition-colors group
                  "
                                        onClick={async () => {
                                            if (!user) return;
                                            try {
                                                const resp = await axios.post(API_ROUTES.AUTH.DEMO_USER, {
                                                    email: user.email,
                                                });
                                                const demoUser = resp.data.data;
                                                const dataStr = encodeURIComponent(JSON.stringify(demoUser));
                                                const width = 1000;
                                                const height = 800;
                                                const left = window.screen.width / 2 - width / 2;
                                                const top = window.screen.height / 2 - height / 2;

                                                window.open(
                                                    `/?simulator=true&data=${dataStr}`,
                                                    "Simulator",
                                                    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
                                                );
                                            } catch (err) {
                                                console.error("Failed to start simulator", err);
                                                toast({ title: "Failed to start simulator" });
                                            }
                                        }}
                                    >
                                        <Monitor
                                            size={20}
                                            className="mr-3 text-gray-500 group-hover:text-blue-500"
                                        />
                                        Simulator
                                    </div>
                                    <div
                                        className="
                    flex items-center px-4 py-2 
                    hover:bg-gray-100 cursor-pointer 
                    text-red-500
                    transition-colors group
                  "
                                        onClick={handleLogout}
                                    >
                                        <LogOut
                                            size={20}
                                            className="mr-3 group-hover:text-red-600"
                                        />
                                        Logout
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
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
