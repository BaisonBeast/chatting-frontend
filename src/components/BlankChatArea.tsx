import blank_image from "../assets/blank_image.jpg";

const BlankChatArea = () => {
    return (
        <div className="flex justify-center items-center h-full gap-5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-1">
            <img className="w-60 h-60 shadow-md rounded-md border-2 border-pink-200" src={blank_image} />
            <div>
                <h2 className="text-5xl font-black">Make <span className="text-red-400">friends</span> and,</h2>
                <h2 className="text-3xl">{"Connect with friends"}</h2>
            </div>
        </div>
    );
};

export default BlankChatArea;
