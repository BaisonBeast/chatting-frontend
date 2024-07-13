import '../css/Sidebar.css';
import { HiMiniUserCircle } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { Link } from 'react-router-dom';

const Sidebar = () => {

    const people = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
    ];

  return (
    <div className='sidebar'>
        <nav className='navigation'>
            <HiMiniUserCircle size={40} color='white' className='pointer'/>
            <div className='sidebar-option'>
                <MdOutlineMessage size={20} className='mar pointer'/>
                <BsThreeDotsVertical size={20} className='pointer'/>
            </div>
        </nav>

        <div className='search'>
            <CiSearch />
            <input type='text' placeholder='Search' />
        </div>

        <div className='content'>
            {
                people.map(person => {
                    return (
                    <Link to={`/chat/${person.id}`} key={person.id} style={{ textDecoration: 'none', color: 'black' }}>
                        <div className='content-item pointer'>
                            <div className='content-user'>
                                <HiMiniUserCircle size={40} color='white' className='pointer'/>
                                <p>{person.name}</p>
                            </div>
                        <p>2:12</p>
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