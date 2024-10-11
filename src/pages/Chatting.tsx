import ChatArea from "@/components/ChatArea";
import Sidebar from "@/components/Sidebar";

const Chatting = () => {
    return (
        <div className="flex">
            <Sidebar />
            <ChatArea />
        </div>
    );
};

export default Chatting;
