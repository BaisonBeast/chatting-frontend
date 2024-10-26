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
import { HashLoader } from "react-spinners";

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
        <div className="w-screen h-screen flex justify-center items-center p-4">
            <Card className="flex  w-full max-w-xs md:max-w-4xl items-center justify-center shadow-lg">
                <div className="hidden md:flex md:w-1/2 md:h-full md:items-center md:justify-center p-4">
                    <img
                        className="rounded-lg shadow-lg object-cover w-full h-full max-h-72 md:max-h-full shadow-slate-400"
                        src={Logo}
                        alt="Main Logo"
                    />
                </div>

                <Card className="flex flex-col w-full max-w-xs md:w-2/5 sm:p-8 items-center justify-center md:mt-2 md:mb-2">
                    <CardHeader className="flex flex-col w-full items-center">
                        <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                            Register
                        </CardTitle>
                        <CardDescription className="text-sm md:text-base">
                            This is the Registration page...
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 w-full">
                        <Input
                            type="email"
                            placeholder="Email"
                            required
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <Label htmlFor="picture">Picture</Label>
                        <Input
                            id="picture"
                            type="file"
                            required
                            accept="image/*"
                            onChange={(e) => handleFileChange(e)}
                        />
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 items-center mt-6 w-full">
                        {loading ? (
                            <HashLoader />
                        ) : (
                            <Button
                                type="submit"
                                className="w-full"
                                onClick={(e) => handleSubmit(e)}
                            >
                                Submit
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full flex items-center justify-center"
                            onClick={() => navigate("/login")}
                        >
                            <CiLogin className="mr-1" /> Login
                        </Button>
                    </CardFooter>
                </Card>
            </Card>
        </div>
    );
}
