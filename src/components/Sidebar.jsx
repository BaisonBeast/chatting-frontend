import '../css/Sidebar.css';
import { HiMiniUserCircle } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const Sidebar = ({setInputBox}) => {

    const [chatList, setChatList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(()=> {
        fetchAllChatList();
    }, []);

    const fetchAllChatList = async () => {
        const data = await axios.get('http://localhost:8080/api/chat/getAllChats');
        setChatList(data.data);
    }

    const filteredChats = chatList.filter(chat =>
        chat.chatName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputBox = () => {
        setInputBox(prev => !prev);
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
                        <div className='content-item pointer'>
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

export default Sidebar