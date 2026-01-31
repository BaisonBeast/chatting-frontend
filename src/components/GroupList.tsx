import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import useChatStore from "@/store/useStore";
import axios from "@/services/api";
import { API_ROUTES } from "@/utils/ApiRoutes";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";

const GroupList = () => {
    const { groupList, setGroupList, setSelectedChat, setSelectedChatType } = useChatStore();
    const [groupIsOpen, setGroupIsOpen] = useState(false);

    const { toast } = useToast();
    const { socket } = useSocket();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await axios.get(API_ROUTES.GROUP.GET_ALL);
                if (data.status === "SUCCESS") {
                    setGroupList(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch groups", error);
            }
        };
        fetchGroups();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("createGroup", (data) => {
            setGroupList([...groupList, data.newChat]);
            toast({
                title: "New Group",
                description: data.message,
            });
        });

        return () => {
            socket.off("createGroup");
        }
    }, [socket, groupList]);

    return (
        <div className="w-full">
            <Collapsible open={groupIsOpen} onOpenChange={setGroupIsOpen}>
                <CollapsibleTrigger asChild>
                    <div className="p-5 bg-slate-50 cursor-pointer text-xl flex justify-between font-semibold">
                        <div className="flex items-center gap-2">
                            Group's
                        </div>
                        <div className="flex gap-2 items-center text-gray-400">
                            {groupList.length > 0 && (
                                <span className="bg-red-300 text-black text-sm px-2 py-0.5 rounded-full font-bold">
                                    {groupList.length}
                                </span>
                            )}
                            {groupIsOpen ? <IoIosArrowUp className="text-black" /> : <IoIosArrowDown className="text-black" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div>
                        {groupList.length > 0 ? (
                            groupList.map((group, indx) => (
                                <div
                                    key={group._id || indx}
                                    onClick={() => {
                                        setSelectedChat(indx);
                                        setSelectedChatType("group");
                                    }}
                                    className="flex items-center justify-between px-4 py-2 border-b-2 border-sky-50 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10 border border-gray-200">
                                            <AvatarImage src={group.groupIcon} alt={group.groupName} />
                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                                {group.groupName[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{group.groupName}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                {group.participants?.length} members
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                <p>No groups yet.</p>
                                <p className="text-xs mt-1">Create one to get started!</p>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div >
    );
};

export default GroupList;
