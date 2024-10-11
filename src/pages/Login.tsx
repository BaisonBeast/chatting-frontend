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
import { Atom } from "react-loading-indicators";

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
        <div className="w-screen h-screen flex justify-center items-center">
            <Card className="flex h-3/6 w-5/6 md:w-4/6 md:h-3/6 xl:w-4/6 xl:h-5/6  items-center justify-center">
                <div className="hidden md:flex md:w-1/2 md:h-3/4 md:items-center md:justify-center">
                    <img
                        className="rounded-lg shadow-lg object-fill shadow-slate-400"
                        src={Logo}
                        alt="Main Logo"
                    />
                </div>
                <Card className="flex flex-col w-11/12 md:w-2/5 md:h-4/6 items-center justify-center">
                    <CardHeader className="flex flex-col w-full items-center">
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>This is Login page...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 w-full">
                        <Input
                            type="email"
                            placeholder="Email"
                            required={true}
                            className="w-11/12"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="relative">
                            {passwordType ? (
                                <FaEye
                                    className="absolute right-10 top-2 pointer"
                                    onClick={() =>
                                        setPasswordType((prev) => !prev)
                                    }
                                />
                            ) : (
                                <FaEyeSlash
                                    className="absolute right-10 top-2 pointer"
                                    onClick={() =>
                                        setPasswordType((prev) => !prev)
                                    }
                                />
                            )}
                            <Input
                                type={passwordType ? "password" : "text"}
                                placeholder="Password"
                                required={true}
                                className="w-11/12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        {loading ? (
                            <Atom
                                color="#030703"
                                size="medium"
                                text=""
                                textColor=""
                            />
                        ) : (
                            <Button type="submit" onClick={handleLogin}>
                                Submit
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/register")}
                        >
                            <FaRegistered className="mr-1" />
                            Register
                        </Button>
                    </CardFooter>
                </Card>
            </Card>
        </div>
    );
}
