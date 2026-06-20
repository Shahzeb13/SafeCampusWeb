"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../../dashboard.module.css";
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
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#71717a" }}>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 100px)", gap: "20px", padding: "20px" }}>
      {/* Sidebar: User List */}
      <div style={{ 
        width: "300px", 
        background: "#fff", 
        borderRadius: "12px", 
        border: "1px solid #e4e4e7", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        display: "flex", 
        flexDirection: "column" 
      }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e4e4e7" }}>
          <h2 style={{ fontSize: "1rem", color: "#09090b", margin: 0, fontWeight: 700 }}>Conversations</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#71717a' }}>{users.length} active chat{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {users.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', color: '#71717a', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
              <p style={{ margin: 0, fontSize: '13px' }}>No active chats yet</p>
            </div>
          ) : (
            users.map((userId) => {
              const lastMsg = chats[userId][chats[userId].length - 1];
              const userName = userInfos[userId]?.username || "Unknown User";
              const isActive = activeUser === userId;

              return (
                <div
                  key={userId}
                  onClick={() => setActiveUser(userId)}
                  style={{
                    padding: "14px 18px",
                    cursor: "pointer",
                    background: isActive ? "#eff6ff" : "transparent",
                    borderBottom: "1px solid #f4f4f5",
                    borderLeft: isActive ? "3px solid #0052cc" : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ 
                      width: "38px", height: "38px", borderRadius: "50%", 
                      background: isActive ? "#0052cc" : "#e0e7ff", 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      color: isActive ? "#fff" : "#0052cc", 
                      fontWeight: 700, fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#09090b", fontWeight: 600, fontSize: '14px' }}>{userName}</div>
                      <div style={{ color: "#71717a", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lastMsg?.message || 'No messages yet'}
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
      <div style={{ 
        flex: 1, 
        background: "#fff", 
        borderRadius: "12px", 
        border: "1px solid #e4e4e7",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        display: "flex", 
        flexDirection: "column" 
      }}>
        {activeUser ? (
          <>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #e4e4e7", display: "flex", alignItems: "center", gap: "12px", background: '#fafafa', borderRadius: '12px 12px 0 0' }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0052cc", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
                {(userInfos[activeUser]?.username || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: "0.95rem", color: "#09090b", margin: 0, fontWeight: 700 }}>
                  {userInfos[activeUser]?.username || "Unknown User"}
                </h2>
                <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 500 }}>● Online</div>
              </div>
            </div>
            
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: '#fafafa' }}>
              {chats[activeUser].map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.isMe ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                  }}
                >
                  <div style={{
                    padding: "11px 16px",
                    borderRadius: msg.isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.isMe ? "#0052cc" : "#fff",
                    color: msg.isMe ? "#fff" : "#09090b",
                    border: msg.isMe ? 'none' : '1px solid #e4e4e7',
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {msg.message}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#71717a", marginTop: "4px", textAlign: msg.isMe ? "right" : "left", paddingLeft: msg.isMe ? 0 : '4px', paddingRight: msg.isMe ? '4px' : 0 }}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid #e4e4e7", display: "flex", gap: "10px", background: '#fff', borderRadius: '0 0 12px 12px' }}>
              <input
                type="text"
                placeholder="Type your response..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                style={{
                  flex: 1,
                  background: "#fafafa",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  padding: "11px 14px",
                  color: "#09090b",
                  outline: "none",
                  fontSize: '14px'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                style={{
                  background: message.trim() ? "#0052cc" : "#f4f4f5",
                  color: message.trim() ? "#fff" : "#a1a1aa",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0 22px",
                  fontWeight: 600,
                  cursor: message.trim() ? "pointer" : "default",
                  transition: "background 0.2s",
                  fontSize: '14px'
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a", flexDirection: "column", gap: '12px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: "2rem" }}>💬</div>
            <h3 style={{ color: "#09090b", marginBottom: "4px", fontWeight: 700 }}>Your Messages</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Select a user from the sidebar to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
