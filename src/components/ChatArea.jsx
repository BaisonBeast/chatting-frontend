import '../css/ChatArea.css';
import { HiMiniUserCircle } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosAttach } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiMicrophoneOn } from "react-icons/ci";
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';


const API_URL = 'http://localhost:3000';
const socket = io(API_URL);

const ChatArea = () => {
  const { personId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
  
    fetchMessages();

    socket.emit('joinChat', personId);

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [personId]);

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await axios.get(`${API_URL}/messages/${personId}`);
      setMessages(fetchedMessages.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        chatId: personId,
        senderId: 'currentUserId', // Static sender ID
        content: newMessage,
      };

      try {
        const sentMessage = await axios.post(`${API_URL}/messages`, messageData);
        socket.emit('sendMessage', sentMessage.data);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className='chatArea'>
      <header className='header'>
        <div className='chatArea-user'>
          <HiMiniUserCircle size={40} color='white' className='mar pointer hov'/>
          <p>Name</p>
        </div>
        <div>
          <IoIosAttach size={25} className='mar pointer'/>
          <BsThreeDotsVertical size={25} className='pointer'/>
        </div>
      </header>
      <div className='chats'>
        {
          messages.map((message, id) => {
            return (
              <div key={id}>{message.text}</div>
            )
          })
        }
      </div>
      <footer className='footer'>
        <MdOutlineEmojiEmotions className='pointer' size={25} color='#BACD92'/>
        <input 
          type='text' placeholder='Enter message' 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {if (e.key === "Enter"){handleSendMessage}}}
        />
        <CiMicrophoneOn className='pointer' size={25} color='#BACD92'/>
      </footer>
    </div>
  )
}

export default ChatArea