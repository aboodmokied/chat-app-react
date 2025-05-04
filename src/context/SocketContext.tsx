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
  socketConnectionLoading: boolean;     // Loading state during connection attempts
}

// Create context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  connectSocket: (token: string) => {},
  socketError: null,
  socketConnectionLoading: true,
});

/**
 * Provider component that wraps application to provide socket functionality
 * @param children - Child components that will have access to socket context
 */
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for socket instance and connection status
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnectionLoading, setSocketConnectionLoading] = useState(true);
  const [socketError, setSocketError] = useState(null);

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
      
      // Store socket instance if connection is successful
      if (socket.connected) {
        setSocket(socket);
      }
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
        socketConnectionLoading
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