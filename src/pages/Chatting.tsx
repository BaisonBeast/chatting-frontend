import ChatArea from "@/components/ChatArea";
import Sidebar from "@/components/Sidebar";
import useChatStore from "zustand";

const Chatting = () => {
    return (
        <div className="flex">
            <Sidebar />
            <ChatArea />
        </div>
    );
};

export default Chatting;
