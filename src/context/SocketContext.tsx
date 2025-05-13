import React, { createContext, useState, useContext, useEffect } from "react";
import socketService from "@/services/socket";
import { Socket } from "socket.io-client";

/**
 * Interface defining the shape of the Socket context
 */
interface SocketContextType {
  socket: Socket | null;                // Socket instance when connected
  connectSocket: (token: string) => void; // Function to establish socket connection
  socketError: any;                     // Error state for socket connections
  socketConnectionLoading: boolean; 
  socketConnected: boolean;
  socketValidationError:SocketValidationErrorType | null
}

type SocketValidationErrorType={
  event:string,
  message:string[]|string,
  status:number
}

// Create context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  connectSocket: (token: string) => {},
  socketError: null,
  socketConnectionLoading: true,
  socketConnected: false,
  socketValidationError:null
});

/**
 * Provider component that wraps application to provide socket functionality
 * @param children - Child components that will have access to socket context
 */
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for socket instance and connection status
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [socketConnectionLoading, setSocketConnectionLoading] = useState(true);
  const [socketError, setSocketError] = useState(null);
  const [socketValidationError, setSocketValidationError] = useState<SocketValidationErrorType|null>(null);

  /**
   * Establishes a connection to the socket server using the provided auth token
   * @param token - Authentication token for socket connection
   */
  const connectSocket = async (token: string) => {
    try {
      setSocketConnectionLoading(true);
      // Connect to socket server and set up error handler
      const socket = socketService.setErrorHandler((error) => {
        console.error('Socket Error', error);
        setSocketError(error);
      }).connect(token);
      setSocket(socket);
       socket.on("connect", () => {
        setSocketConnected(true);
      });
      socket.on("userConnected", (message) => {
        console.log(message);
      });
      
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        // setSocket(null);
      });
      socket.on("userDisconnected", (message) => {
        console.log(message);
      });
      
      socket.on("connect_error",(error)=>{
        console.error("Socket connection error:", error);
        setSocketError(error);
      });
      socket.on("error", (error) => {
        console.error("Socket error:", error);
        setSocketError(error);
      });
      socket.on("validation_error", (error) => {
        console.error("Validation error:", error);
        setSocketValidationError(error);
      });
    } catch (error) {
      console.error("Socket Connection Failed:", error);
      setSocketError(error.response?.data || error.message);
    } finally {
      setSocketConnectionLoading(false);
    }
  };

  // Provide socket context to child components
  return (
    <SocketContext.Provider
      value={{
        socket,
        connectSocket,
        socketError,
        socketConnectionLoading,
        socketConnected,
        socketValidationError
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Custom hook to use the socket context
 * @returns Socket context object with connection methods and state
 */
export const useSocket = () => useContext(SocketContext);