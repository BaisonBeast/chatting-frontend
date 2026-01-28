import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useChatStore from "@/store/useStore";

interface VideoCallProps {
    chatIds: {
        currentUserId: string;
        chatPartnerId: string;
    };
    onEndCall: () => void;
    incomingCall?: {
        signal: any;
        from: string;
        name: string;
    };
    isIncomingCall?: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({ chatIds, onEndCall, incomingCall, isIncomingCall }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Remote stream refs
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<RTCPeerConnection | null>(null);
    const myVideo = useRef<HTMLVideoElement>(null);

    const { socket } = useSocket();
    const { chatList, selectedChat, user } = useChatStore();

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }

                // If it's an incoming call and we accepted it (or auto-initializing for answer)
                // logic handled below
            })
            .catch(err => console.error("Error accessing media devices:", err));

        return () => {
            // Cleanup stream handling
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Setup Socket Listeners for Signaling
    useEffect(() => {
        if (!socket) return;

        socket.on("callAccepted", async (signal) => {
            setCallAccepted(true);
            if (connectionRef.current) {
                await connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
            }
        });

        socket.on("ice-candidate", (candidate) => {
            connectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        });

        return () => {
            socket.off("callAccepted");
            socket.off("ice-candidate");
        }
    }, [socket]);




    const callUser = (id: string) => {
        if (!stream || !socket) return;

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        // Add tracks
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to: id,
                    candidate: event.candidate
                });
            }
        };

        peer.ontrack = (event) => {
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        peer.createOffer().then(offer => {
            peer.setLocalDescription(offer);
            socket.emit("callUser", {
                userToCall: id,
                signalData: offer,
                from: chatIds.currentUserId,
                name: user?.username || "User"
            });
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        if (!stream || !socket || !incomingCall) return;

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to: incomingCall.from,
                    candidate: event.candidate
                });
            }
        };

        peer.ontrack = (event) => {
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        peer.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));

        peer.createAnswer().then(answer => {
            peer.setLocalDescription(answer);
            socket.emit("answerCall", {
                signal: answer,
                to: incomingCall.from
            });
        });

        connectionRef.current = peer;
    };

    // Native ICE candidate handling from remote
    useEffect(() => {
        if (!socket) return;

        const handleNewIceCandidateMsg = async (candidate: RTCIceCandidateInit) => {
            try {
                if (connectionRef.current) {
                    await connectionRef.current.addIceCandidate(candidate);
                }
            } catch (e) {
                console.error("Error adding received ice candidate", e);
            }
        };

        const handleCallEnded = () => {
            leaveCall(true); // pass true to indicate remote end
        };

        socket.on("ice-candidate", handleNewIceCandidateMsg);

        // Handle answer if we are the caller
        socket.on("callAccepted", async (signal) => {
            setCallAccepted(true);
            if (connectionRef.current) {
                await connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
            }
        });

        socket.on("callEnded", handleCallEnded);

        return () => {
            socket.off("ice-candidate", handleNewIceCandidateMsg);
            socket.off("callAccepted");
            socket.off("callEnded", handleCallEnded);
        }
    }, [socket]);


    // Helper to start call automatically if not incoming
    useEffect(() => {
        if (!isIncomingCall && stream) {
            callUser(chatIds.chatPartnerId);
        }
    }, [stream, isIncomingCall]);


    const leaveCall = (remoteEnded = false) => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.close();
        }
        // stop local stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        if (!remoteEnded && socket) {
            // Determine who to send the endCall event to
            const targetId = isIncomingCall && incomingCall ? incomingCall.from : chatIds.chatPartnerId;
            socket.emit("endCall", { to: targetId });
        }
        onEndCall();
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMuted(!stream.getAudioTracks()[0].enabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsVideoOff(!stream.getVideoTracks()[0].enabled);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl aspect-video">

                {/* Main Remote Video */}
                {callAccepted && !callEnded ? (
                    <video
                        playsInline
                        ref={userVideo}
                        autoPlay
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                        {isIncomingCall && !callAccepted ? (
                            <div className="text-center">
                                <h3 className="text-2xl mb-4 text-emerald-400 font-bold animate-pulse">Incoming Call...</h3>
                                <div className="flex space-x-4 justify-center">
                                    <button
                                        onClick={answerCall}
                                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg hover:shadow-green-500/50"
                                    >
                                        Answer
                                    </button>
                                    <button
                                        onClick={() => leaveCall(false)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg hover:shadow-red-500/50"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                <span className="text-xl">Calling...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Local Video Overlay */}
                {stream && (
                    <div className="absolute right-4 bottom-4 w-48 aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-gray-700">
                        <video
                            playsInline
                            muted
                            ref={myVideo}
                            autoPlay
                            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                        />
                        {isVideoOff && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                <VideoOff size={20} />
                            </div>
                        )}
                    </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-gray-800/80 px-6 py-3 rounded-full backdrop-blur-md">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                    >
                        {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
                    </button>

                    <button
                        onClick={() => leaveCall(false)}
                        className="bg-red-600 hover:bg-red-700 p-4 rounded-full transition-colors shadow-lg shadow-red-600/30"
                    >
                        <PhoneOff className="text-white fill-current" />
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                    >
                        {isVideoOff ? <VideoOff className="text-white" /> : <Video className="text-white" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
