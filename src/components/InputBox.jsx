import '../css/InputBox.css';
import { useState } from "react";
import axios from "axios";

const API_URL = 'http://localhost:5000'; 


export const InputBox = ({inputBox, setInputBox, setChatList}) => {
    const [chatName, setChatName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (chatName.trim()) {
        try {
            const response = await axios.post(`${API_URL}/api/chat/createChat`, {
            chatName,
        });
        setChatName("");
        setInputBox(prev => !prev);
        setChatList(prev => [...prev, response.data]);
    } catch (error) {
        console.error("Error creating new chat:", error);
    }
    }
  };
  return (
    <div className={`inputBox ${inputBox ? 'visible': 'invisible'}`}>
        <form className="new-chat-form" onSubmit={handleSubmit}>
            <h1>New Chat</h1 >
            <input
                type="text"
                placeholder="Enter new chat name..."
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="new-chat-input"
            />
            <div className="margin">
            <button type="submit" className="new-chat-button margin create">
                Create
            </button>
            <button type="submit" className="new-chat-button margin cancel">
                Cancel
            </button>
            </div>
        </form>
    </div>
  )
}
