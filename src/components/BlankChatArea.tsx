
const BlankChatArea = () => {
    return (
        <div className="flex justify-center items-center h-full gap-5">
            <img className="w-60 h-60" src='user.png' />
            <div>
                <h2 className="text-5xl font-black">Make <span className="text-red-400">friends</span> and,</h2>
                <h2 className="text-3xl">{"Connect with friends"}</h2>
            </div>
        </div>
    );
};

export default BlankChatArea;
