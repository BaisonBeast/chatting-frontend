import '../css/Sidebar.css';
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import useChatStore from '../store/useStore';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

let socket;

const Sidebar = () => {

    const { chatList, setChatList, setInputBox, addChat, setUser, user } = useChatStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showMenu, setShowMenu] = useState(false);

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

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('username');
    }

    function getInitials(name) {
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        if (words.length > 2) {
            return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
        }
        return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
    }

  return (
    <div className='sidebar'>
        <nav className='navigation'>
            <div className='sidebar_userProfile'>
                <h2>{getInitials(user)}</h2>
            </div>
            <div className='sidebar-option'>
                <MdOutlineMessage size={25} className='mar pointer' onClick={handleInputBox}/>
                <BsThreeDotsVertical size={25} className='pointer' onClick={() => setShowMenu(prev => !prev)}/>
                {showMenu && (
                    <div className="menu abs">
                    <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
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
                        <div className={`content-item pointer`}>
                            <div className='content-user'>
                            <div className='sidebar_userProfile'>
                                <h2>{getInitials(chat.chatName)}</h2>
                            </div>
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