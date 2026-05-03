"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../dashboard.module.css";
import toast from "react-hot-toast";
import { initAdminSocket, disconnectAdminSocket, getAdminSocket } from "@/lib/socket";
import { auth } from "@/lib/api";

const BASE_URL = "http://localhost:4000/api";

export default function MessagesPage() {
  const [chats, setChats] = useState<{ [userId: string]: any[] }>({});
  const [userInfos, setUserInfos] = useState<{ [userId: string]: any }>({});
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [adminUser, setAdminUser] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeUserRef = useRef<string | null>(null);

  // Keep the ref in sync with state for socket listeners
  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // 1. Get Admin Profile
        const profile = await auth.getProfile();
        setAdminUser(profile);
        const adminId = profile.id;

        // 2. Fetch history from DB
        const response = await fetch(`${BASE_URL}/chat/conversations`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('userToken')}` 
          },
          // @ts-ignore
          credentials: "include" 
        });
        const result = await response.json();
        
        if (result.success) {
          const chatMap: { [userId: string]: any[] } = {};
          const infoMap: { [userId: string]: any } = {};

          result.data.forEach((conv: any) => {
            // Find the other participant (the student/user)
            const user = conv.participants.find((p: any) => p._id !== adminId);
            if (user) {
              infoMap[user._id] = user;
              chatMap[user._id] = conv.messages.map((m: any) => ({
                ...m,
                isMe: m.senderId === adminId,
                senderName: m.senderId === adminId ? "Campus Admin" : user.username,
              }));
            }
          });
          setChats(chatMap);
          setUserInfos(infoMap);
        }

        // 3. Init Socket
        const socket = initAdminSocket(adminId);

        // Remove any existing listeners to avoid duplicates
        socket.off("receive_message");

        socket.on("receive_message", (data: any) => {
          setChats((prev) => {
            const userId = data.senderId;
            const userChats = prev[userId] || [];
            
            const isDuplicate = userChats.some(m => m.timestamp === data.timestamp && m.message === data.message);
            if (isDuplicate) return prev;

            return {
              ...prev,
              [userId]: [...userChats, { ...data, isMe: false }],
            };
          });
          
          if (activeUserRef.current !== data.senderId) {
            toast(`New message from ${data.senderName}`, { icon: "💬" });
          }
        });

      } catch (err) {
        console.error("Failed to initialize chat", err);
        toast.error("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      disconnectAdminSocket();
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, activeUser]);

  const sendMessage = () => {
    const socket = getAdminSocket();
    if (message.trim() && activeUser && socket && adminUser) {
      const msgData = {
        senderId: adminUser.id,
        senderName: "Campus Admin",
        receiverId: activeUser,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      socket.emit("send_message", msgData);
      
      setChats((prev) => ({
        ...prev,
        [activeUser]: [...(prev[activeUser] || []), { ...msgData, isMe: true }],
      }));
      
      setMessage("");
    }
  };

  const users = Object.keys(chats);

  if (loading && !adminUser) {
    return (
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 100px)", gap: "20px", padding: "20px" }}>
      {/* Sidebar: User List */}
      <div style={{ width: "300px", background: "#18181b", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #27272a" }}>
          <h2 style={{ fontSize: "1.2rem", color: "#fff", margin: 0 }}>Conversations</h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {users.length === 0 ? (
            <p style={{ color: "#71717a", textAlign: "center", marginTop: "20px" }}>No active chats</p>
          ) : (
            users.map((userId) => {
              const lastMsg = chats[userId][chats[userId].length - 1];
              const userName = userInfos[userId]?.username || "Unknown User";

              return (
                <div
                  key={userId}
                  onClick={() => setActiveUser(userId)}
                  style={{
                    padding: "15px 20px",
                    cursor: "pointer",
                    background: activeUser === userId ? "#27272a" : "transparent",
                    borderBottom: "1px solid #27272a",
                    transition: "0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" }}>
                      {userName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontWeight: "500" }}>{userName}</div>
                      <div style={{ color: "#71717a", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lastMsg?.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div style={{ flex: 1, background: "#18181b", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column" }}>
        {activeUser ? (
          <>
            <div style={{ padding: "20px", borderBottom: "1px solid #27272a", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "0.9rem" }}>
                {(userInfos[activeUser]?.username || "U").charAt(0)}
              </div>
              <h2 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
                {userInfos[activeUser]?.username || "Unknown User"}
              </h2>
            </div>
            
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
              {chats[activeUser].map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.isMe ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: msg.isMe ? "#6366f1" : "#27272a",
                    color: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ fontSize: "0.95rem" }}>{msg.message}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "4px", textAlign: "right" }}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: "20px", borderTop: "1px solid #27272a", display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Type your response..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                style={{
                  flex: 1,
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#fff",
                  outline: "none",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                style={{
                  background: message.trim() ? "#6366f1" : "#3f3f46",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0 25px",
                  fontWeight: "600",
                  cursor: message.trim() ? "pointer" : "default",
                  transition: "background 0.2s",
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a", flexDirection: "column" }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px", opacity: 0.5 }}>💬</div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>Your Messages</h3>
            <p>Select a user from the sidebar to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
