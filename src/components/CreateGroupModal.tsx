import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useChatStore from "@/store/useStore";
import axios from "@/services/api";
import { API_ROUTES } from "@/utils/ApiRoutes";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2 } from "lucide-react";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
    const { chatList } = useChatStore();
    const { toast } = useToast();

    // Using chatList participants as potential friends to add (Assuming chatList contains friends)
    // In a real app, you might have a separate "FriendsList" API. For now, we filter unique participants from chatList.
    const uniqueFriends = Array.from(new Map(chatList.map(item => [item.participant.email, item.participant])).values());

    const [groupName, setGroupName] = useState("");
    const [groupIcon, setGroupIcon] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleToggleMember = (email: string) => {
        if (selectedMembers.includes(email)) {
            setSelectedMembers(prev => prev.filter(e => e !== email));
        } else {
            setSelectedMembers(prev => [...prev, email]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName?.trim()) {
            toast({ title: "Group name is required", variant: "destructive" });
            return;
        }
        if (selectedMembers.length === 0) {
            toast({ title: "Select at least one member", variant: "destructive" });
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.post(API_ROUTES.GROUP.CREATE, {
                groupName,
                groupIcon,
                participants: selectedMembers
            });

            toast({ title: "Group created successfully!" });
            onClose();
            // Store cleanup/refresh might be needed if socket doesn't auto-update
            setGroupName("");
            setGroupIcon("");
            setSelectedMembers([]);

        } catch (error: any) {
            toast({
                title: "Failed to create group",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="My Awesome Group"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">
                            Icon URL
                        </Label>
                        <Input
                            id="icon"
                            value={groupIcon}
                            onChange={(e) => setGroupIcon(e.target.value)}
                            placeholder="https://example.com/icon.png"
                            className="col-span-3"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Select Members</Label>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            {uniqueFriends.length > 0 ? (
                                uniqueFriends.map((friend) => (
                                    <div key={friend.email} className="flex items-center space-x-3 mb-3 last:mb-0">
                                        <Checkbox
                                            id={friend.email}
                                            checked={selectedMembers.includes(friend.email)}
                                            onCheckedChange={() => handleToggleMember(friend.email)}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={friend.profilePic} />
                                                <AvatarFallback>{friend.username[0]}</AvatarFallback>
                                            </Avatar>
                                            <label
                                                htmlFor={friend.email}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {friend.username}
                                            </label>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No friends available to add.</p>
                            )}
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateGroup} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                        Create Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateGroupModal;
