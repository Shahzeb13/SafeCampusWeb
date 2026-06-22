import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

let socket: Socket | null = null;

export const initAdminSocket = (adminId: string) => {
  if (!socket) {
    const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      withCredentials: true,
    });
  }

  const joinRooms = () => {
    console.log("Admin joining room:", adminId);
    socket?.emit("join", adminId);
  };

  if (socket.connected) {
    joinRooms();
  } else {
    socket.on("connect", () => {
      console.log("Admin connected to socket");
      joinRooms();
    });
  }

  return socket;
};

export const getAdminSocket = () => {
  return socket;
};

export const disconnectAdminSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
