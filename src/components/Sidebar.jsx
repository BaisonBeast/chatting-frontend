import '../css/Sidebar.css';
import { HiMiniUserCircle } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";
import { CiSearch } from "react-icons/ci";

const Sidebar = () => {
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
            <div className='content-item'>
                <div className='content-user'>
                    <HiMiniUserCircle size={40} color='white' className='pointer'/>
                    <p>Name</p>
                </div>
                <p>2:12</p>
            </div>
        </div>
    </div>
  )
}

export default Sidebar