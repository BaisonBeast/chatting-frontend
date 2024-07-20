import './App.css';
import ChatArea from './components/ChatArea';
import BlankChat from './components/BlankChat';
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom';
import { InputBox } from './components/InputBox';

function App() {

  return (
      <div className={`app`}>
        <InputBox />
        <Sidebar />
        <Routes>
          <Route path='/' element={<BlankChat />} />
          <Route path='/:chatId' element={<ChatArea />} />
        </Routes>
      </div>
  )
}

export default App
