import "./App.css";
import Login from "./pages/Login";
import { Route, Routes, Navigate } from "react-router-dom";
import useChatStore from "./store/useStore";
import { Register } from "./pages/Register";
import Chatting from "./pages/Chatting";
import NotFound from "./pages/PageNotFound";
import { SocketProvider } from "./context/SocketContext";

function App() {
    const { user } = useChatStore();
    const userEmail = user?.email;

    return (
        <SocketProvider userEmail={userEmail as string}>
            <div>
                <Routes>
                    <Route
                        path="/"
                        element={
                            user && user.token ? (
                                <Chatting />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            !user || !user.token ? <Login /> : <Navigate to="/" />
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            !user || !user.token ? <Register /> : <Navigate to="/" />
                        }
                    />
                    <Route path="/*" element={<NotFound />} />
                </Routes>
            </div>
        </SocketProvider>
    );
}

export default App;
