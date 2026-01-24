import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Logo from "../assets/chatting.jpg";
import { useNavigate } from "react-router-dom";
import { FaRegistered, FaEyeSlash, FaEye, FaComments } from "react-icons/fa";
import { useState } from "react";
import axios from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import useChatStore from "@/store/useStore";
import { HashLoader } from "react-spinners";

import { API_ROUTES } from "@/utils/ApiRoutes";

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [passwordType, setPasswordType] = useState<boolean>(true);
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    const { setUser } = useChatStore();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            toast({ title: `Please provide the credentials...` });
            return;
        }
        try {
            setLoading(true);
            setLoading(true);
            const res = await axios.post(API_ROUTES.AUTH.LOGIN, {
                email,
                password,
            });
            if (res.data.status === "SUCCESS") {
                setUser(res.data.data);
                toast({
                    title: `${res.data.message}`,
                    description: `Welcome ${res.data.data.username}`,
                });
                setEmail("");
                setPassword("");
                navigate("/");
            } else {
                toast({
                    title: "Please try again..",
                    description: `${res.data.message}`,
                });
            }
        } catch (err: any) {
            if (err.response && err.response.data) {
                const { message } = err.response.data;
                toast({
                    title: "Invalid credentials",
                    description: `${message}`,
                });
            } else {
                toast({
                    title: "Something went wrong",
                    description: "Please try again after some time...",
                });
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <Card className="flex flex-col w-full max-w-xs md:max-w-4xl md:flex-row md:h-5/6 items-center justify-center shadow-lg border-0 overflow-hidden">
                <div className="hidden md:flex md:w-1/2 md:h-full md:items-center md:justify-center p-0 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <img
                        className="object-cover w-full h-full"
                        src={Logo}
                        alt="Chizzel Logo"
                    />
                </div>

                <Card className="flex flex-col w-full p-6 sm:p-8 items-center justify-center md:w-1/2 lg:w-2/5 border-0 bg-white">
                    <CardHeader className="flex flex-col items-center text-center mb-4 w-full">
                        <div className="md:hidden flex items-center justify-center mb-6">
                            <FaComments className="text-3xl mr-2 text-blue-500" />
                            <h1 className="text-3xl font-bold text-blue-500">Chizzel</h1>
                        </div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-gray-500 mt-2">
                            Sign in to your Chizzel account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4 w-full">
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">
                                Password
                            </label>
                            <div className="relative w-full">
                                {passwordType ? (
                                    <FaEye
                                        className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                        onClick={() => setPasswordType((prev) => !prev)}
                                    />
                                ) : (
                                    <FaEyeSlash
                                        className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                        onClick={() => setPasswordType((prev) => !prev)}
                                    />
                                )}
                                <Input
                                    id="password"
                                    type={passwordType ? "password" : "text"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end mt-1">
                                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                    Forgot password?
                                </button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 items-center mt-4 w-full">
                        {loading ? (
                            <div className="flex justify-center w-full py-2">
                                <HashLoader color="#3b82f6" size={36} />
                            </div>
                        ) : (
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                                onClick={handleLogin}
                            >
                                Sign In
                            </Button>
                        )}
                        <div className="flex items-center justify-center w-full mt-2">
                            <span className="text-gray-500 text-sm">Don't have an account?</span>
                            <Button
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm ml-1 p-0"
                                onClick={() => navigate("/register")}
                            >
                                Sign Up
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </Card>
        </div>
    );
}