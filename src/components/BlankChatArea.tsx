import React from "react";
import { MessageCircle, Users, Network } from "lucide-react";

const BlankChatArea = () => {
    return (
        <div className="flex flex-col md:flex-row justify-center items-center h-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
                <div className="relative w-64 h-64 md:w-80 md:h-80 transform transition-all duration-500 hover:scale-105">
                    <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <img
                        src="/user.png"
                        alt="Connect with friends"
                        className="relative z-10 w-full h-full object-contain rounded-full shadow-2xl hover:rotate-6 transition-transform"
                    />
                    <div className="absolute bottom-[-20px] right-[-20px] bg-green-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                        <Users size={24} />
                    </div>
                    <div className="absolute top-[-20px] left-[-20px] bg-purple-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                        <MessageCircle size={24} />
                    </div>
                </div>
                <div className="text-center md:text-left space-y-4">
                    <div className="overflow-hidden">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 transform transition-transform hover:translate-x-2">
                            Make{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600">
                                friends
                            </span>{" "}
                            and,
                        </h2>
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-700 flex items-center justify-center md:justify-start">
                            <Network className="mr-3 text-blue-500" size={36} />
                            Connect with friends
                        </h2>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-6 flex justify-center md:justify-start space-x-4">
                        <button
                            className="
              px-6 py-3 
              bg-gradient-to-r from-blue-500 to-purple-600 
              text-white 
              rounded-full 
              shadow-lg 
              hover:shadow-xl 
              transform hover:scale-105 
              transition-all 
              flex items-center
              group
            "
                        >
                            Start Chatting
                            <MessageCircle
                                className="ml-2 group-hover:animate-bounce"
                                size={20}
                            />
                        </button>
                        <button
                            className="
              px-6 py-3 
              border-2 border-blue-500 
              text-blue-500 
              rounded-full 
              hover:bg-blue-50 
              transition-colors
              flex items-center
              group
            "
                        >
                            Add Friends
                            <Users
                                className="ml-2 group-hover:scale-110"
                                size={20}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlankChatArea;
