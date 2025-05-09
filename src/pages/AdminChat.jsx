import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import './styles/AdminChat.css';

const socket = io("http://localhost:5000", {
    withCredentials: true,
    transports: ["websocket"]
});

const AdminChat = () => {
    const [adminData, setAdminData] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    // Fetch admin profile
    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/profile`, {
                    withCredentials: true
                });

                console.log("Full API response:", res.data);

                // Check both possible role fields
                const userRole = res.data.role || res.data.userRole;

                // TEMP: assume admin if email matches
                if (res.data.email === "admin.w11@gmail.com") {
                    setAdminData(res.data);
                } else {
                    alert("Access denied");
                    window.location.href = "/";
                }

            } catch (err) {
                console.error("Auth error:", err.response?.data);
                window.location.href = "/login";
            }
        };
        fetchAdmin();
    }, []);

    // Fetch users who have chatted
    useEffect(() => {
        const fetchChatUsers = async (user) => {
            if (!adminData) return;
            setSelectedUser(user);
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/chat/${user._id}`, {
                    withCredentials: true
                });
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch users list", err);
            }
        };
        fetchChatUsers();
    }, [adminData]); // Add adminData as dependency

    // Socket event listeners
    useEffect(() => {
        if (!adminData) return;

        const handleHistory = (history) => {
            setChat(history);
        };

        const handleNewMessage = (newMsg) => {
            if (selectedUser &&
                (newMsg.senderId === selectedUser._id || newMsg.receiverId === selectedUser._id)) {
                setChat(prev => [...prev, newMsg]);
            }
        };

        socket.on("message_history", handleHistory);
        socket.on("receive_message", handleNewMessage);

        return () => {
            socket.off("message_history", handleHistory);
            socket.off("receive_message", handleNewMessage);
        };
    }, [adminData, selectedUser]);

    const loadChat = (user) => {
        setSelectedUser(user);
        socket.emit("request_chat_history", {
            userId1: adminData._id,
            userId2: user._id
        });
    };

    const sendMessage = () => {
        if (!selectedUser || !message.trim()) return;

        socket.emit("send_private_message", {
            senderId: adminData._id,
            receiverId: selectedUser._id,
            text: message
        });

        // Optimistically update UI
        setChat(prev => [...prev, {
            senderId: adminData._id,
            receiverId: selectedUser._id,
            text: message,
            timestamp: new Date().toISOString()
        }]);

        setMessage("");
    };

    // Check if selectedUser exists before accessing its _id
    const filteredChat = (chat && selectedUser && selectedUser._id)
        ? chat.filter(
            msg =>
                (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)
        ) : [];




    return (
        <div className="chat-container">
            <div className="user-list">
                <h4>Chat Users</h4>
                {users.length === 0 ? (
                    <p>No chat history yet</p>
                ) : (
                    users.map(user => (
                        <div
                            key={user._id}
                            className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                            onClick={() => loadChat(user)}
                        >
                            <img
                                src={user.image || '/default-user.png'}
                                alt={user.name}
                                className="user-avatar"
                            />
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <img
                                src={selectedUser.image || '/default-user.png'}
                                alt={selectedUser.name}
                                className="chat-user-avatar"
                            />
                            <h4>Chat with {selectedUser.name}</h4>
                            <p>{selectedUser._id}</p>

                        </div>

                        <div className="messages-container">
                            {filteredChat.length > 0 ? (
                                filteredChat.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message ${msg.senderId === adminData._id ? 'sent' : 'received'}`}
                                    >
                                        <p>{msg.senderId}</p>
                                        <div className="message-content">{msg.text}</div>
                                        <div className="message-time">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-messages">Start your conversation with {selectedUser?.name}</p>
                            )}
                        </div>


                        <div className="message-input">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                            />
                            <button onClick={sendMessage}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="select-user-prompt">
                        <i className="fas fa-comments"></i>
                        <p>Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;