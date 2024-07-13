import './App.css';
import ChatArea from './components/ChatArea';
import BlankChat from './components/BlankChat';
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom';

function App() {

  return (
    
      <div className='app'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<BlankChat />} />
          <Route path='/chat/:personId' element={<ChatArea />} />
        </Routes>
      </div>
  )
}

export default App
