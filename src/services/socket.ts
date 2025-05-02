
import { io, Socket } from "socket.io-client";

// Define types for our socket events
export interface Message {
  id: string;
  content: string;
  chatId: string;
  sender: User;
  reciever: User;
  timestamp: Date;
  opened:boolean;
}


export interface NewChatData{
  chat:Chat
}
export interface GetChatsData{
  chats:Chat[]
}
export interface GetChatMessagesData{
  messages:Message[]
}
export interface MessageOpenedData{
  chatId:string,
  messageId:string
}
export interface NewMessageData{
  message:Message,
  chatId:string,
  recieverId:string
}

export enum Roles{
  Super_Admin='super-admin',
  Admin='admin',
  User='user'
}

export interface User {
  id: string;
  name: string;
  roles:Roles[]
  // avatar?: string;
  // isOnline?: boolean;
}

export interface Chat {
  id: string;
  room: string;
  users: User[];
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
      this.socket.on("userConnected", (message) => {
        console.log(message);
      });
      
      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
      this.socket.on("userDisconnected", (message) => {
        console.log(message);
      });
      
      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
      this.socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    }
    
    return this.socket;
  }
  
  setupListeners(){  // priveteMessage, newChat
    if(this.socket){
      this.socket.on("newChat", ({chat}:NewChatData) => {
        console.log('new chat:',chat);
      });
      this.socket.on("newMessage", ({message,chatId,recieverId}:NewMessageData) => {
        console.log("newMessage",{message,chatId,recieverId});
      });
      this.socket.on("messageOpened", (data:MessageOpenedData) => {
        console.log("messageOpened:",data);
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send a message to a specific room
  sendMessage(chatId:string,message:string,recieverId:string): void {
    if (this.socket) {
      this.socket.emit("privateMessage", { 
        chatId,
        message,
        recieverId
       });
    } 
  }

  // Join a specific chat room
  joinChat(senderId: string,recieverId:string): void {
    if (this.socket) {
      this.socket.emit("joinChat", {
        senderId,
        recieverId,
      });
    }
  }

  // // Leave a specific chat room
  // leaveRoom(roomId: string): void {
  //   if (this.socket) {
  //     this.socket.emit("leave_room", { roomId });
  //   }
  // }

  // Get the list of available rooms
  getChats(callback: (data:GetChatsData)=>void ): void {
    if (this.socket) {
      this.socket.emit("myChats");
      this.socket.on("myChats", callback);
    }
  }
  getChatMessages(payload:{chatId:string,page?:number,limit?:number},callback: (data:GetChatMessagesData) => void): void {
    if (this.socket) {
      this.socket.emit("chatMessages",payload);
      this.socket.on("chatMessages", callback);
    }
  }

  // Get the list of users in a room
  // getUsers(roomId: string, callback: (users: User[]) => void): void {
  //   if (this.socket) {
  //     // this.socket.emit("get_users", { roomId });
  //     this.socket.on("users", callback);
  //   }
  // }
}

export const socketService = new SocketService();
export default socketService;
