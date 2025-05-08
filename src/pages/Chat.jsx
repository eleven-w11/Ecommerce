import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000", {
    withCredentials: true,
    transports: ["websocket"]
});

const ChatSocket = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [userData, setUserData] = useState(null);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Debug effect to log chat state changes
    useEffect(() => {
        console.log("Current chat state:", chat);
    }, [chat]);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/profile`, {
                    withCredentials: true,
                });
                if (response.data.success !== false) {
                    console.log("User data fetched:", response.data);
                    setUserData(response.data);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUser();
    }, []);

    // Socket.IO setup
    // Socket.IO setup with proper dependency array
    useEffect(() => {
        console.log("Initializing socket listeners");

        const handleHistory = (history) => {
            console.log("Received history:", history);
            setChat(history);
        };

        const handleNewMessage = (newMsg) => {
            console.log("Received new message:", newMsg);
            setChat(prev => [...prev, newMsg]);
        };

        socket.on("message_history", handleHistory);
        socket.on("receive_message", handleNewMessage);

        // Request history on connect
        socket.on("connect", () => {
            console.log("Socket connected, requesting history");
            socket.emit("request_history");
        });

        return () => {
            console.log("Cleaning up socket listeners");
            socket.off("message_history", handleHistory);
            socket.off("receive_message", handleNewMessage);
            socket.off("connect");
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const sendMessage = () => {
        if (!userData) {
            navigate("/SignIn");
            return;
        }

        if (message.trim() === "") return;

        console.log("Sending message:", message);
        socket.emit("send_message", {
            senderId: userData._id,
            text: message
        });
        setMessage("");
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h3>Chat</h3>
            <div style={{
                border: "1px solid #ddd",
                height: "400px",
                overflowY: "auto",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: "#f9f9f9"
            }}>
                {chat.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#999" }}>No messages yet</p>
                ) : (
                    chat.map((msg) => (
                        <div key={msg.id} style={{
                            marginBottom: "10px",
                            padding: "10px",
                            backgroundColor: msg.senderId === userData?._id ? "#DCF8C6" : "#FFFFFF",
                            borderRadius: "8px",
                            maxWidth: "80%",
                            marginLeft: msg.senderId === userData?._id ? "auto" : "0",
                            border: "1px solid #eee",
                            boxShadow: "0 1px 1px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{ fontWeight: "bold" }}>{msg.sender}</div>
                            <div style={{ margin: "5px 0" }}>{msg.text}</div>
                            <div style={{ fontSize: "0.8em", color: "#666", textAlign: "right" }}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                    placeholder="Type a message..."
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatSocket;