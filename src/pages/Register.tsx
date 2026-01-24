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
import { FaEyeSlash, FaEye, FaComments, FaUser, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import useChatStore from "@/store/useStore";
import { HashLoader } from "react-spinners";



export function Register() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [passwordType, setPasswordType] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { toast } = useToast();
    const { setUser } = useChatStore();
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setProfilePic(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
            });
            return;
        }

        if (!username.trim()) {
            toast({
                title: "Username Required",
                description: "Please enter a username.",
            });
            return;
        }

        if (!password.trim() || password.length < 6) {
            toast({
                title: "Invalid Password",
                description: "Password must be at least 6 characters long.",
            });
            return;
        }

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("username", username);
        if (profilePic !== null) formData.append("profilePic", profilePic);

        try {
            setLoading(true);
            const res = await axios.post(
                `/api/chatUser/register`,
                formData
            );
            if (res.data.status === "SUCCESS") {
                setUser(res.data.data);
                toast({
                    title: `${res.data.message}`,
                    description: `Welcome ${res.data.data.username}`,
                });
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
                    title: "Registration failed",
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

                <Card className="flex flex-col w-full p-6 sm:p-8 items-center justify-center md:w-1/2 lg:w-3/5 border-0 bg-white">
                    <CardHeader className="flex flex-col items-center text-center mb-2 w-full">
                        <div className="md:hidden flex items-center justify-center mb-4">
                            <FaComments className="text-3xl mr-2 text-blue-500" />
                            <h1 className="text-3xl font-bold text-blue-500">Chizzel</h1>
                        </div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-gray-500 mt-2">
                            Join Chizzel and start connecting
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4 w-full">
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="w-full pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="text-sm font-medium text-gray-700 block mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-3 text-gray-400" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Choose a username"
                                    required
                                    className="w-full pl-10"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
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
                            <p className="text-xs text-gray-500 mt-1">
                                Must be at least 6 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="picture" className="text-sm font-medium text-gray-700 block mb-1">
                                Profile Picture
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    {previewImage ? (
                                        <div className="w-16 h-16 rounded-full overflow-hidden">
                                            <img
                                                src={previewImage}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FaUser className="text-gray-400 text-2xl" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <Input
                                        id="picture"
                                        type="file"
                                        required
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e)}
                                        className="text-sm"
                                    />
                                </div>
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
                                onClick={(e) => handleSubmit(e)}
                            >
                                Create Account
                            </Button>
                        )}
                        <div className="flex items-center justify-center w-full mt-2">
                            <span className="text-gray-500 text-sm">Already have an account?</span>
                            <Button
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm ml-1 p-0"
                                onClick={() => navigate("/login")}
                            >
                                <CiLogin className="mr-1" /> Sign In
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </Card>
        </div>
    );
}