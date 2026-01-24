import { FiCheck, FiX } from "react-icons/fi";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import useChatStore from "@/store/useStore";
import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/context/SocketContext";

interface Invite {
    _id: string;
    username: string;
    profilePic: string;
    email: string;
}



const InviteList = () => {
    const { user } = useChatStore();
    const { toast } = useToast();
    const { socket } = useSocket();

    const [inviteIsOpen, setinviteIsOpen] = useState(false);
    const [inviteList, setInviteList] = useState<Invite[]>([]);

    useEffect(() => {
        fetchAllInviteList();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("newInvite", (inviteData: Invite) => {
            setInviteList((prevList) => [...prevList, inviteData]);
            toast({
                title: "New Invite",
                description: `${inviteData.username} invited you.`,
            });
        });

        return () => {
            socket.off("newInvite");
        };
    }, [socket]);

    const fetchAllInviteList = async () => {
        try {
            const resp = await axios.get(`/api/chat/getAllInvites`, {
                params: {
                    email: user?.email,
                },
            });
            setInviteList(resp.data.data);
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

    const filterInviteList = (email: string) => {
        const newInviteList = inviteList.filter(
            (invite) => invite.email !== email
        );
        setInviteList(newInviteList);
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
            const resp = await axios.post(`/api/chat/acceptInvite`, {
                loggedUserEmail: user?.email,
                newUserEmail: email,
            });
            if (resp.data.status === "SUCCESS") {
                filterInviteList(email);
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
            const resp = await axios.post(`/api/chat/rejectInvite`, {
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
        <div className="w-full max-w-full mx-auto">
            <Collapsible
                open={inviteIsOpen}
                onOpenChange={setinviteIsOpen}
                className="w-full"
            >
                <CollapsibleTrigger asChild>
                    <div className="p-5 w-full bg-slate-50 cursor-pointer text-xl flex justify-between font-semibold">
                        Invite's
                        <div className="flex gap-2 items-center">
                            {inviteList.length > 0 && (
                                <p className="bg-red-300 rounded-full pl-2 pr-2">
                                    {inviteList.length}
                                </p>
                            )}
                            {inviteIsOpen ? (
                                <IoIosArrowUp />
                            ) : (
                                <IoIosArrowDown />
                            )}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {inviteList.length > 0 ? (
                        inviteList.map((invite, indx) => (
                            <div
                                key={invite._id}
                                className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md border-b-2 border-sky-50 hover:bg-gray-200"
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
                                                {getInitials(invite.username)}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <span className="ml-2 font-medium">
                                        {invite.username.length > 20
                                            ? invite.username.slice(0, 25) +
                                            "..."
                                            : invite.username.slice(0, 25)
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="p-1 text-green-600 hover:bg-green-100 rounded-full"
                                        onClick={() =>
                                            handleAcceptInvite(invite.email)
                                        }
                                    >
                                        <FiCheck className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                                        onClick={() =>
                                            handleRejectInvite(invite.email)
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
    );
};

export default InviteList;
