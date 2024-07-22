import '../css/ChatArea.css';
import { HiMiniUserCircle } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosAttach } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiMicrophoneOn } from "react-icons/ci";
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { io } from 'socket.io-client';
import useChatStore from '../store/useStore.js';
import EmojiPicker from 'emoji-picker-react';
import { AiOutlineClose } from "react-icons/ai";

const API_URL = import.meta.env.VITE_API_URL;
let socket;

const ChatArea = () => {
  const { chatId } = useParams();
  const [showMenu, setShowMenu] = useState(false);
  const { messages, addMessage, setMessages, deleteChatList, user } = useChatStore();
  const [showCrossIcon, setShowCrossIcon] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    fetchMessages();
    if(!socket)
      socket = io(API_URL);

    socket.emit('joinChat', chatId);

    socket.on('receiveMessage', (message) => {
      addMessage(message)
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
          senderName: user,
          message: newMessage,
        };

        try {
          setNewMessage('');
          await axios.post(`${API_URL}/api/messages/newMessage`, messageData);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }
  };

  const handleDeleteChat = async () => {
    try {
        await axios.delete(`${API_URL}/api/chat/deleteChat/${chatId}`);
        deleteChatList(chatId);
    } catch (error) {
        console.error('Error deleting chat:', error);
    }
}
const onEmojiClick = (emojidata) => {
  setNewMessage(prevMessage => prevMessage + emojidata.emoji);
};

const calculateDaysAgo = (isoDate) => {
  const pastDate = new Date(isoDate);
  const currentDate = new Date();
  const differenceInMs = currentDate - pastDate;
  const differenceInDays = Math.floor(differenceInMs / (24 * 60 * 60 * 1000));
  return differenceInDays;
};

  return (
    <div className='chatArea'>
      <header className='header'>
        <div className='chatArea-user'>
          <HiMiniUserCircle size={40} color='white' className='mar pointer hov'/>
          <p>{messages.name}</p>
        </div>
        <div style={{position: 'relative'}}>
          <IoIosAttach size={25} className='mar pointer'/>
          <BsThreeDotsVertical size={25} className='pointer' onClick={() => setShowMenu(prev => !prev)}/>
          {showMenu && (
            <div className="menu">
              <Link to='/' style={{ textDecoration: 'none', color: 'black' }}>
                <button onClick={handleDeleteChat}>Delete Chat</button>
              </Link>
            </div>
            )}
        </div>
      </header>
      <div className='chats'>
        {
          messages?.messages?.map((message, id) => {
            const day = calculateDaysAgo(message.time);
            return (
              <div key={id} className={`chat ${message.senderName === user? 'right': 'left'}`}>
                <p>{message.message}</p>
                <h6>{`${day === 0 ? 'Today at' : day === 1 ? 'Yesterday at' : `${day} days ago at`} ${moment(message.time).format('LT')}`}</h6>
              </div>
            )
          })
        }
      </div>
      <footer className='footer'>
      <MdOutlineEmojiEmotions 
        className='pointer' 
        size={25} 
        color='#BACD92' 
        onClick={() => {setShowEmojiPicker(prev => !prev); setShowCrossIcon(prev => !prev)}}
      />
        <div className='emoji-container'>
          {
            showCrossIcon && 
              <AiOutlineClose 
                className='close-icon' 
                size={20} 
                onClick={() => {setShowEmojiPicker(false); setShowCrossIcon(prev => !prev) }}
              /> 
          }
          {
            showEmojiPicker && 
              <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              height={350} 
              width={300} 
              skinTonesDisabled
              />
          }
        </div>
        <input 
          type='text' 
          placeholder='Enter message' 
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