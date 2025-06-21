
import { io, Socket } from "socket.io-client";

// Define types for our socket events
export interface Message {
  _id: string;
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
export interface GetChatUsersData{
  users:{users:User[]}
}
export interface MessageOpenedData{
  chatId:string,
  messageId:string
}
export interface NewMessageData{
  message:Message,
  chat:Chat,
  recieverId:string
}

export enum Roles{
  Super_Admin='super-admin',
  Admin='admin',
  User='user'
}

export interface User {
  _id: string;
  name: string;
  roles:Roles[]
  // avatar?: string;
  // isOnline?: boolean;
}

export interface Chat {
  _id: string;
  room: string;
  users: User[];
  chatName:string
}

export type ErrorHandler=(error:any)=>void;

// Create a singleton socket instance
class SocketService {
  private socket: Socket | null = null;
  private apiUrl=import.meta.env.VITE_API_URL || "http://localhost:3000";
  private errorHandler:ErrorHandler=(error)=>{console.log(error)};

  setErrorHandler(handler:ErrorHandler){
    this.errorHandler=handler;
    return this;
  }
  connect(token: string): Socket {
    if (!this.socket) {
      this.socket = io(this.apiUrl, {
        auth: token ? { token } : undefined,
      });
      
      // this.socket.on("connect", () => {
      //   console.log("Socket connected successfully");
      // });
      // this.socket.on("userConnected", (message) => {
      //   console.log(message);
      // });
      
      // this.socket.on("disconnect", () => {
      //   console.log("Socket disconnected");
      // });
      // this.socket.on("userDisconnected", (message) => {
      //   console.log(message);
      // });
      
      // this.socket.on("connect_error",this.errorHandler);
      // this.socket.on("error", (error) => {
      //   console.error("Socket error:", error);
      // });
    }
    
    return this.socket;
  }
  
  setupListeners(){  // priveteMessage, newChat
    if(this.socket){
      // this.socket.on("newChat", ({chat}:NewChatData) => {
      //   console.log('new chat:',chat);
      // });
      // this.socket.on("newMessage", ({message,chatId,recieverId}:NewMessageData) => {
      //   console.log("newMessage",{message,chatId,recieverId});
      // });
      this.socket.on("messageOpened", (data:MessageOpenedData) => {
        console.log("messageOpened:",data);
      });
    }
  }
  removeListeners(){
    if(this.socket){
      this.socket.off("messageOpened");
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
  joinChat(senderId: string,recieverEmail:string): void {
    if (this.socket) {
      this.socket.emit("joinChat", {
        event:"joinChat",
        senderId,
        recieverEmail,
      });
    }
  }

  onNewChat(callback: (data:NewChatData) => void){
    if (this.socket) {
      this.socket.on("newChat", callback);
    }
  }
  onNewMessage(callback: (data:NewMessageData) => void){
    if (this.socket) {
      this.socket.on("newMessage", callback);
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

  getChatUsers(payload:{chatId:string},callback: (data:GetChatUsersData) => void): void {
    if (this.socket) {
      this.socket.emit("chatUsers",payload);
      this.socket.on("chatUsers", callback);
    }
  }

  offNewChat(){
    if(this.socket){
      this.socket.off("newChat");
    }
  }
  offNewMessage(){
    if(this.socket){
      this.socket.off("newMessage");
    }
  }

  offGetChats(){
    if(this.socket){
      this.socket.off("myChats");
    }
  }

  offGetChatMessages(){
    if(this.socket){
      this.socket.off("chatMessages");
    }
  }

  offGetChatUsers(){
    if(this.socket){
      this.socket.off("chatUsers");
    }
  }
  disconnectSocket(){
    if(this.socket){
      this.socket.disconnect();
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
