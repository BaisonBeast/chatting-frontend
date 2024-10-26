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
import { FaRegistered } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import useChatStore from "@/store/useStore";
import { HashLoader } from "react-spinners";

const baseURL = import.meta.env.VITE_API_URL;

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
            toast({ title: `Please provide the credencials...` });
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${baseURL}/api/chatUser/login`, {
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
        <div className="w-screen h-screen flex justify-center items-center p-4">
            <Card className="flex flex-col w-full max-w-xs md:max-w-4xl md:flex-row md:h-5/6 items-center justify-center shadow-lg">
                <div className="hidden md:flex md:w-1/2 md:h-full md:items-center md:justify-center p-4">
                    <img
                        className="rounded-lg shadow-lg object-cover w-full h-full max-h-72 md:max-h-full"
                        src={Logo}
                        alt="Main Logo"
                    />
                </div>

                <Card className="flex flex-col w-full p-6 sm:p-8 items-center justify-center md:w-1/2 lg:w-2/5">
                    <CardHeader className="flex flex-col items-center text-center mb-4">
                        <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                            Login
                        </CardTitle>
                        <CardDescription className="text-sm md:text-base">
                            This is the Login page...
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 w-full">
                        <Input
                            type="email"
                            placeholder="Email"
                            required
                            className="w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="relative w-full">
                            {passwordType ? (
                                <FaEye
                                    className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                    onClick={() =>
                                        setPasswordType((prev) => !prev)
                                    }
                                />
                            ) : (
                                <FaEyeSlash
                                    className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                    onClick={() =>
                                        setPasswordType((prev) => !prev)
                                    }
                                />
                            )}
                            <Input
                                type={passwordType ? "password" : "text"}
                                placeholder="Password"
                                required
                                className="w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 items-center mt-6 w-full">
                        {loading ? (
                            <HashLoader />
                        ) : (
                            <Button
                                type="submit"
                                className="w-full"
                                onClick={handleLogin}
                            >
                                Submit
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => navigate("/register")}
                        >
                            <FaRegistered className="mr-1" /> Register
                        </Button>
                    </CardFooter>
                </Card>
            </Card>
        </div>
    );
}
