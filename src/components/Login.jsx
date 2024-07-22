import { useState } from 'react';
import { FaUserSecret } from 'react-icons/fa';
import "../css/Login.css";
import axios from 'axios';
import useChatStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useChatStore();
    const  navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/chatUser/login`, { username, password });
            localStorage.setItem('username', response.data.username);
            setUser( response.data.username );
            navigate('/');
        } catch (error) {
            console.error('Error logging in:', error);
        }
    }

    const handleGuestLogin = () => {
        localStorage.setItem('username', 'Guest');
        setUser('Guest');
        navigate('/');
    }

  return (
    <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login | Register</h2>
        <div className="form-group">
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='username'
                required
            />
        </div>
        <div className="form-group">
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='password'
            required
        />
        </div>
        <button type="submit" className="login-button">Login</button>
        <div className="guest-login" onClick={handleGuestLogin}>
            <FaUserSecret size={20} className="guest-icon" /> Login as Guest
        </div>
    </form>
    </div>
  );
};

export default App;
