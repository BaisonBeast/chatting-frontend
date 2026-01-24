import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const GroupList = () => {
    const [groupIsOpen, setGroupIsOpen] = useState(false);
    const [groupList, setGroupList] = useState([]);

    return (
        <div className="w-full max-w-md mx-auto">
            <Collapsible open={groupIsOpen} onOpenChange={setGroupIsOpen}>
                <CollapsibleTrigger asChild>
                    <div className="p-5 bg-slate-50 cursor-pointer text-xl flex justify-between font-semibold">
                        Group's
                        <div className="flex gap-2 items-center">
                            {groupList.length > 0 && (
                                <p className="bg-red-300 rounded-full pl-2 pr-2">
                                    {groupList.length}
                                </p>
                            )}
                            {groupIsOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div>
                        {groupList.length > 0 ? (
                            groupList.map((chat, indx) => (
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
    );
};

export default GroupList;
