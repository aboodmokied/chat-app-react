
import React from "react";
// import { Message, User } from "../../services/socket";
import { format } from "date-fns";

interface ChatMessageProps {
  message: any;
  currentUser: any | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUser }) => {
  const isOwnMessage = message.sender.id === currentUser?.id;
  
  return (
    <div
      className={`flex mb-4 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-2">
          <img
            src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.username}`}
            alt={message.sender.name}
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
      
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isOwnMessage
            ? "bg-purple-600 text-white rounded-tr-none"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-tl-none"
        }`}
      >
        {!isOwnMessage && (
          <p className="text-xs font-semibold mb-1">{message.sender.username}</p>
        )}
        <p className="break-words">{message.text}</p>
        <p className={`text-xs mt-1 ${isOwnMessage ? "text-purple-100" : "text-gray-500 dark:text-gray-400"}`}>
          {format(new Date(message.timestamp), 'h:mm a')}
        </p>
      </div>

      {isOwnMessage && (
        <div className="flex-shrink-0 ml-2">
          <img
            src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.username}`}
            alt={currentUser?.username}
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
