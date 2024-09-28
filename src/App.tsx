import './App.css';
import ChatArea from './components/ChatArea';
import BlankChat from './components/BlankChat';
import Login from './components/Login';
import Sidebar from './components/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom';
import { InputBox } from './components/InputBox';
import useChatStore from './store/useStore';

function App() {
  const { user } = useChatStore();

  return (
      <div className={`app`}>
        {user && <InputBox />}
        {user && <Sidebar />}
        <Routes>
          <Route path="/" element={user !== null ? <BlankChat /> : <Navigate to="/login" />} />
          <Route path="/:chatId" element={user !== null ? <ChatArea /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
  )
}

export default App
