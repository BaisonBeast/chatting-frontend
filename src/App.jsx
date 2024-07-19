import './App.css';
import ChatArea from './components/ChatArea';
import BlankChat from './components/BlankChat';
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom';
import { InputBox } from './components/InputBox';
import { useState } from 'react';

function App() {

    const [chatList, setChatList] = useState([]);
    const [inputBox, setInputBox] = useState(false);

  return (
    
      <div className={`app`}>
        <InputBox inputBox={inputBox} setInputBox={setInputBox} setChatList={setChatList}/>
        <Sidebar setInputBox={setInputBox}  chatList={chatList} setChatList={setChatList}/>
        <Routes>
          <Route path='/' element={<BlankChat />} />
          <Route path='/:chatId' element={<ChatArea />} />
        </Routes>
      </div>
  )
}

export default App
