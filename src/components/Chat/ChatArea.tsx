import React, { useEffect, useMemo, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import socketService, { GetChatMessagesData, Message, User } from "@/services/socket";
// import { Message, User } from "../../services/socket";
// import socketService from "../../services/socket";

interface ChatAreaProps {
  currentUser: User | null;
  activeChat: string;
  newMessage: Message;
}

const ChatArea: React.FC<ChatAreaProps> = ({ currentUser, activeChat, newMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageMap, setMessageMap] = useState<Map<string, Message>>(new Map());
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
    if (!activeChat || !currentUser) return;
    
    setLoading(true);
    
    socketService.getChatMessages({
      chatId: activeChat,
      limit: 50,
      page: 1
    },({messages}:GetChatMessagesData)=>{
      setMessageMap(prevMap => {
        const updated = new Map(prevMap);
        messages.forEach(msg => {
          if (msg.id && !updated.has(msg.id)) {
            updated.set(msg.id, msg);
          }
        });
        return updated;
      });
      setMessages(messages);
      setLoading(false);
    });

    return () => {
      // Leave the room when unmounting or changing rooms
      // socketService.leaveRoom(activeRoom);
      // socket.off("message");
    };
  }, [activeChat, currentUser]);
  
  // Add new message from parent prop to messages
  // useEffect(() => {
  //   if (newMessage && newMessage.id) {
  //     setMessages((prevMessages) => {
  //       // Check if message already exists in the array
  //       const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
  //       if (!messageExists) {
  //         return [...prevMessages, newMessage];
  //       }
  //       return prevMessages;
  //     });
  //   }
  // }, [newMessage]);
  useEffect(() => {
    if (newMessage && newMessage.id) {
      setMessageMap(prevMap => {
        if (prevMap.has(newMessage.id)) return prevMap;
        const updated = new Map(prevMap);
        updated.set(newMessage.id, newMessage);
        return updated;
      });
    }
  }, [newMessage]);

 // Memoize the sorted messages to prevent unnecessary re-sorting
 const sortedMessages = useMemo(() => {
  return Array.from(messageMap.values()).sort((a: Message, b: Message) => a.timestamp.getTime() - b.timestamp.getDate());
}, [messageMap]); // Only re-sort if messageMap changes

  // Send a new message
  const handleSendMessage = (text: string) => {
    if (!currentUser || !activeChat) return;
    
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic update
    const newMessage: any = {
      id: tempId,
      content: text,
      sender: currentUser,
      reciever: currentUser,
      timestamp: new Date(),
      room: activeChat,
      chatId: activeChat,
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    // Send the message via socket.io
    // socketService.sendMessage({ text }, activeRoom);
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
          {sortedMessages.map(msg => (
            <ChatMessage key={msg.id} message={msg} currentUser={currentUser}/>
          ))}
            {/* {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUser={currentUser}
              />
            ))} */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <MessageInput
        onSendMessage={handleSendMessage}
        isDisabled={!currentUser || !activeChat}
      />
    </div>
  );
};

export default ChatArea;
