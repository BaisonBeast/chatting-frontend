import '../css/ChatArea.css';
import { HiMiniUserCircle } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosAttach } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiMicrophoneOn } from "react-icons/ci";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000';
const socket = io(API_URL);

const ChatArea = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
  
    fetchMessages();

    // socket.emit('joinChat', chatId);

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.emit('leaveChat', chatId);
    };
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await axios.get(`${API_URL}/api/messages/${chatId}`);
      setMessages(fetchedMessages.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newMessage.trim()) {
        const messageData = {
          chatId,
          senderName: messages.name,
          message: newMessage,
        };

        try {
          const sentMessage = await axios.post(`${API_URL}/api/messages/newMessage`, messageData);
          setMessages(sentMessage.data);
          console.log(sentMessage.data)
          socket.emit('sendMessage', sentMessage.data);
          setNewMessage('');
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }
  };

  return (
    <div className='chatArea'>
      <header className='header'>
        <div className='chatArea-user'>
          <HiMiniUserCircle size={40} color='white' className='mar pointer hov'/>
          <p>{messages.name}</p>
        </div>
        <div>
          <IoIosAttach size={25} className='mar pointer'/>
          <BsThreeDotsVertical size={25} className='pointer'/>
        </div>
      </header>
      <div className='chats'>
        {
          messages?.messages?.map((message, id) => {
            return (
              <div key={id} className={`chat ${message.senderName === messages.name? 'right': 'left'}`}>
                <p>{message.message}</p>
                <h6>{moment(message.time).format('LT')}</h6>
              </div>
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
          onKeyPress={handleSendMessage}
        />
        <CiMicrophoneOn className='pointer' size={25} color='#BACD92'/>
      </footer>
    </div>
  )
}

export default ChatArea