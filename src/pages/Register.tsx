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
import { Label } from "@/components/ui/label";
import Logo from "../assets/chatting.jpg";
import { CiLogin } from "react-icons/ci";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import useChatStore from "@/store/useStore";
import { Atom } from "react-loading-indicators";

const baseURL = import.meta.env.VITE_API_URL;

export function Register() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [passwordType, setPasswordType] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    const { toast } = useToast();
    const { setUser } = useChatStore();
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) setProfilePic(selectedFile);
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("username", username);
        if (profilePic !== null) formData.append("profilePic", profilePic);

        try {
            setLoading(true);
            const res = await axios.post(
                `${baseURL}/api/chatUser/register`,
                formData
            );
            if (res.data.status === "SUCCESS") {
                setUser(res.data.data);
                toast({
                    title: `${res.data.message}`,
                    description: `Welcome ${res.data.data.username}`,
                });
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
            <Card className="flex h-4/6 md:w-4/6 md:h-3/6 xl:w-4/6 xl:h-5/6 items-center justify-center">
                <div className="hidden md:flex md:w-1/2 md:h-1/2 md:items-center md:justify-center">
                    <img
                        className="rounded-lg shadow-lg object-fill shadow-slate-400"
                        src={Logo}
                        alt="Main Logo"
                    />
                </div>
                <Card className="flex flex-col w-11/12 md:w-2/5 md:h-4/6 items-center justify-center">
                    <CardHeader className="flex flex-col w-full items-center">
                        <CardTitle className="text-2xl">Register</CardTitle>
                        <CardDescription>
                            This is Registration page...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1">
                        <Input
                            type="email"
                            placeholder="Email"
                            required={true}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="relative">
                            {passwordType ? (
                                <FaEye
                                    className="absolute right-5 top-2 pointer"
                                    onClick={() =>
                                        setPasswordType((prev) => !prev)
                                    }
                                />
                            ) : (
                                <FaEyeSlash
                                    className="absolute right-5 top-2 pointer"
                                    onClick={() =>
                                        setPasswordType((prev) => !prev)
                                    }
                                />
                            )}
                            <Input
                                type={passwordType ? "password" : "text"}
                                placeholder="Password"
                                required={true}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Input
                            type="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Label htmlFor="picture">Picture</Label>
                        <Input
                            id="picture"
                            type="file"
                            required={true}
                            accept="image/*"
                            onChange={(e) => handleFileChange(e)}
                        />
                    </CardContent>
                    <CardFooter>
                        {loading ? (
                            <Atom
                                color="#030703"
                                size="medium"
                                text=""
                                textColor=""
                            />
                        ) : (
                            <Button
                                type="submit"
                                onClick={(e) => handleSubmit(e)}
                            >
                                Submit
                            </Button>
                        )}
                        <Button
                            className="ml-2"
                            variant="ghost"
                            onClick={() => navigate("/login")}
                        >
                            <CiLogin />
                            Login
                        </Button>
                    </CardFooter>
                </Card>
            </Card>
        </div>
    );
}
