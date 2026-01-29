import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    Sheet
} from "@/components/ui/sheet";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import useChatStore from "@/store/useStore";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { API_ROUTES } from "@/utils/ApiRoutes";
import { compressImage } from "@/utils/imageCompression";

export const backgroundColors = ["bg-blue-100", "bg-green-100", "bg-purple-100", "bg-orange-100"];


interface UpdateUserProps {
    updateProfileOpen: boolean;
    setUpdateProfileOpen: (open: boolean) => void;
}

const UpdateUser = ({
    updateProfileOpen,
    setUpdateProfileOpen,
}: UpdateUserProps) => {
    const { setUser, user } = useChatStore();
    const [username, setUsername] = useState<string>("");
    const [selectedBackground, setSelectedBackground] = useState<number>(
        user?.background as number
    );
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setImageUrl("");
            setProfilePic(null);

            setProfilePic(file);
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
        }
    };

    const handleUpdate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (
            !user ||
            (username === "" &&
                selectedBackground === (user?.background as number) &&
                profilePic === null)
        )
            return;
        const formData = new FormData();
        formData.append("email", user.email);
        formData.append("background", selectedBackground.toString());
        formData.append("username", username);
        if (profilePic !== null) {
            try {
                const compressedFile = await compressImage(profilePic);
                formData.append("profilePic", compressedFile);
            } catch (error) {
                console.error("Image compression failed:", error);
                formData.append("profilePic", profilePic);
            }
        }
        try {
            setLoading(true);
            const resp = await axios.post(
                API_ROUTES.AUTH.UPDATE,
                formData
            );
            setUser(resp.data.data);
            toast({ title: resp.data.message });
            setUsername("");
            setProfilePic(null);
            setImageUrl("");
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

    function getInitials(name?: string) {
        if (!name) {
            return "";
        }
        const words = name?.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        if (words.length > 2) {
            return (
                words[0].charAt(0).toUpperCase() +
                words[1].charAt(0).toUpperCase()
            );
        }
        return (
            words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase()
        );
    }

    return (
        <Sheet open={updateProfileOpen} onOpenChange={(open) => setUpdateProfileOpen(open)}>
            <SheetContent
                className="w-[400px] sm:w-[540px] bg-white shadow-2xl rounded-l-2xl overflow-hidden"
                side="right"
            >
                <div className="relative h-full">
                    <div
                        className={`absolute top-0 left-0 w-full h-32 ${backgroundColors[selectedBackground]} opacity-20`}
                    />

                    <div className="relative z-10 p-6">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-3xl font-bold text-gray-800">
                                Edit Profile
                            </SheetTitle>
                            <SheetDescription className="text-gray-600">
                                Personalize your profile with a few simple
                                changes
                            </SheetDescription>
                        </SheetHeader>

                        {/* User Email Display */}
                        <div className="bg-gray-50 p-3 rounded-lg mb-6 shadow-sm">
                            <p className="text-sm text-gray-600">
                                Email:{" "}
                                <span className="font-semibold text-gray-800">
                                    {user?.email}
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col items-center mb-8 space-y-4">
                            <div className="relative">
                                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                                    <AvatarImage
                                        src={imageUrl || user?.profilePic}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gray-200 text-gray-700 font-bold">
                                        {getInitials(user?.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="profilePic"
                                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
                                >
                                    <Camera size={18} />
                                    <input
                                        type="file"
                                        id="profilePic"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {username || user?.username}
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <Label
                                    htmlFor="username"
                                    className="block mb-2 text-sm font-medium text-gray-700"
                                >
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Choose a new username"
                                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <Label className="block mb-2 text-sm font-medium text-gray-700">
                                    Profile Background
                                </Label>
                                <div className="flex space-x-3">
                                    {backgroundColors.map(
                                        (colorClass, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    setSelectedBackground(index)
                                                }
                                                className={`w-12 h-12 rounded-full ${colorClass} 
                        transform transition-all duration-300  border-2
                        ${selectedBackground === index
                                                        ? "scale-110 border-4 border-white shadow-lg"
                                                        : "hover:scale-105 opacity-70 hover:opacity-100"
                                                    }`}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        <SheetFooter className="mt-8">
                            <Button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </SheetFooter>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default UpdateUser;
