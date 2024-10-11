import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import useChatStore from "@/store/useStore";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RxCross2 } from "react-icons/rx";

const images = [1, 2, 3, 4];

const UpdateUser = () => {
    const { setUser, user } = useChatStore();
    const [username, setUsername] = useState<string>("");
    const [selectedBackground, setSelectedBackground] = useState<number>(
        user?.background as number
    );
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");

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

    function getInitials(name?: string) {
        if (!name) {
            return "";
        }
        const words = name.trim().split(/\s+/);
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
        <SheetContent className="w-[400px] sm:w-[540px]" side={"left"}>
            <SheetHeader>
                <SheetTitle>Edit profile</SheetTitle>
                <SheetDescription>
                    Make changes to your profile here. Click save when you're
                    done.
                </SheetDescription>
            </SheetHeader>
            <div className="flex mt-10 mb-10 gap-10 items-center justify-center">
                <Avatar className="w-28 h-28">
                    <AvatarImage
                        src={`${imageUrl === "" ? user?.profilePic : imageUrl}`}
                    />
                    <AvatarFallback>
                        {getInitials(user?.username as string)}
                    </AvatarFallback>
                </Avatar>
                <div className="text-lg">
                    {username === "" ? user?.username : username}
                </div>
            </div>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                        Username
                    </Label>
                    <Input
                        id="username"
                        value={username}
                        className="col-span-3"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <Label>Background</Label>
                    <div className="h-20 w-20 flex gap-1">
                        {images.map((image, indx) => {
                            return (
                                <img
                                    className={`${
                                        selectedBackground === indx + 1
                                            ? "border-4 border-green-950"
                                            : ""
                                    }contain cursor-pointer p-1`}
                                    src={`/${image}.png`}
                                    onClick={() =>
                                        setSelectedBackground(indx + 1)
                                    }
                                />
                            );
                        })}
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4 relative">
                    <Label htmlFor="profilePic" className="text-right">
                        Profile picture
                    </Label>
                    <Input
                        id="profilePic"
                        type="file"
                        accept="image/*"
                        className="col-span-3"
                        onChange={(e) => handleFileChange(e)}
                    />
                    {imageUrl != "" ? (
                        <RxCross2
                            className="absolute right-0 top-2 cursor-pointer"
                            onClick={() => {
                                setImageUrl("");
                                setProfilePic(null);
                            }}
                        />
                    ) : null}
                </div>
            </div>
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                </SheetClose>
            </SheetFooter>
        </SheetContent>
    );
};

export default UpdateUser;
