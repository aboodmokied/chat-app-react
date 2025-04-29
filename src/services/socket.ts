
import { io, Socket } from "socket.io-client";

// Define types for our socket events
export interface Message {
  id: string;
  text: string;
  sender: User;
  timestamp: Date;
  room?: string;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Room {
  id: string;
  name: string;
  users?: User[];
}

// Create a singleton socket instance
class SocketService {
  private socket: Socket | null = null;
  private apiUrl = "http://localhost:3000"; // Change this to your API URL

  connect(token?: string): Socket {
    if (!this.socket) {
      this.socket = io(this.apiUrl, {
        auth: token ? { token } : undefined,
      });
      
      this.socket.on("connect", () => {
        console.log("Socket connected successfully");
      });
      
      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
      
      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    }
    
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send a message to a specific room
  sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'sender'>, room: string): void {
    if (this.socket) {
      this.socket.emit("message", { ...message, room });
    }
  }

  // Join a specific chat room
  joinRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit("join_room", { roomId });
    }
  }

  // Leave a specific chat room
  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit("leave_room", { roomId });
    }
  }

  // Get the list of available rooms
  getRooms(callback: (rooms: Room[]) => void): void {
    if (this.socket) {
      this.socket.emit("get_rooms");
      this.socket.on("rooms", callback);
    }
  }

  // Get the list of users in a room
  getUsers(roomId: string, callback: (users: User[]) => void): void {
    if (this.socket) {
      this.socket.emit("get_users", { roomId });
      this.socket.on("users", callback);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
