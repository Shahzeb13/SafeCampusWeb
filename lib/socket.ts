import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

const LEGACY_ADMIN_ID = "67c59508544c9b003328e469";
let socket: Socket | null = null;

export const initAdminSocket = (adminId: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
  }

  const joinRooms = () => {
    console.log("Admin joining rooms:", adminId, LEGACY_ADMIN_ID);
    socket?.emit("join", adminId);
    socket?.emit("join", LEGACY_ADMIN_ID); // Join legacy room to receive messages from mobile app
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
