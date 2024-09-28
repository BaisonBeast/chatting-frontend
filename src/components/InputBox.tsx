import "../css/InputBox.css";
import { useState } from "react";
import useChatStore from "../store/useStore";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const InputBox = () => {
    const [chatName, setChatName] = useState("");
    const { setInputBox, inputBox } = useChatStore();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (chatName.trim()) {
            try {
                const response = await axios.post(`${API_URL}/api/chat/createChat`, {
                    chatName,
                });
                setChatName("");
                setInputBox();
            } catch (error) {
                console.error("Error creating new chat:", error);
            }
        }
    };

    const handleCancel = () => {
        setInputBox();
    };
    return (
        <div className={`inputBox ${inputBox ? "visible" : "invisible"}`}>
            <form className="new-chat-form" onSubmit={(e) => handleSubmit(e)}>
                <h1>New Chat</h1>
                <input
                    type="text"
                    placeholder="Enter new chat name..."
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    className="new-chat-input"
                />
                <div className="margin">
                    <button
                        type="submit"
                        className="new-chat-button margin create"
                    >
                        Create
                    </button>
                    <button
                        className="new-chat-button margin cancel"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
