import '../css/Sidebar.css';
import { HiMiniUserCircle } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import useChatStore from '../store/useStore';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

let socket;

const Sidebar = () => {

    const { chatList, setChatList, setInputBox, addChat } = useChatStore();
    const [searchTerm, setSearchTerm] = useState('');
    const { currentChatId } = useParams();

    useEffect(()=> {
        fetchAllChatList();
        if(!socket)
            socket = io(API_URL);
        socket.on('cratedChat', (message) => {
        addChat(message);
        });
        return () => {
            socket.off('crateChat');
        };
    }, []);

    const fetchAllChatList = async () => {
        const data = await axios.get(`${API_URL}/api/chat/getAllChats`);
        setChatList(data.data);
    }

    const filteredChats = chatList.filter(chat =>
        chat.chatName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputBox = () => {
        setInputBox();
    }

  return (
    <div className='sidebar'>
        <nav className='navigation'>
            <HiMiniUserCircle size={40} color='white' className='pointer'/>
            <div className='sidebar-option'>
                <MdOutlineMessage size={20} className='mar pointer' onClick={handleInputBox}/>
                <BsThreeDotsVertical size={20} className='pointer'/>
            </div>
        </nav>

        <div className='search'>
            <CiSearch />
            <input 
                type='text' 
                placeholder='Search' 
                onChange={(e) => setSearchTerm(e.target.value)} 
                value={searchTerm}
            />
        </div>

        <div className='content'>
            {
                filteredChats.map((chat, id) => {
                    return (
                    <Link to={`${chat.chatId}`} key={id} style={{ textDecoration: 'none', color: 'black' }}>
                        <div className={`content-item pointer ${currentChatId === chat.chatId ? 'highLight': ''}`}>
                            <div className='content-user'>
                                <HiMiniUserCircle size={40} color='white' className='pointer'/>
                                <p>{chat.chatName}</p>
                            </div>
                        <p>{moment(chat.chatTime).format('LT')}</p>
                        </div>
                    </Link>
                    )
                })
            }
        </div>
    </div>
  )
}

export default Sidebar;