
import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import { Message, User } from "../../services/socket";
import socketService from "../../services/socket";

interface ChatAreaProps {
  currentUser: User | null;
  activeRoom: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({ currentUser, activeRoom }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!activeRoom || !currentUser) return;
    
    setLoading(true);
    
    // Connect to socket if not already connected
    const socket = socketService.connect();
    
    // Join the active room
    socketService.joinRoom(activeRoom);
    
    // Mock initial messages
    const mockMessages: Message[] = Array.from({ length: 10 }, (_, i) => ({
      id: `msg_${i}`,
      text: `This is message #${i + 1} in room ${activeRoom}`,
      sender: {
        id: i % 3 === 0 ? currentUser.id : `user_${i}`,
        username: i % 3 === 0 ? currentUser.username : `User ${i}`,
        avatar: i % 3 === 0 ? currentUser.avatar : `https://ui-avatars.com/api/?name=User${i}&background=random`,
      },
      timestamp: new Date(Date.now() - (10 - i) * 60000),
      room: activeRoom,
    }));
    
    // Simulate loading delay
    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
    
    // Listen for incoming messages
    socket.on("message", (newMessage: Message) => {
      if (newMessage.room === activeRoom) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    
    return () => {
      // Leave the room when unmounting or changing rooms
      socketService.leaveRoom(activeRoom);
      socket.off("message");
    };
  }, [activeRoom, currentUser]);
  
  // Send a new message
  const handleSendMessage = (text: string) => {
    if (!currentUser || !activeRoom) return;
    
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic update
    const newMessage: Message = {
      id: tempId,
      text,
      sender: currentUser,
      timestamp: new Date(),
      room: activeRoom,
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    // Send the message via socket.io
    socketService.sendMessage({ text }, activeRoom);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              No messages in this room yet. Send the first message!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUser={currentUser}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <MessageInput
        onSendMessage={handleSendMessage}
        isDisabled={!currentUser || !activeRoom}
      />
    </div>
  );
};

export default ChatArea;
