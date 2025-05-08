
import React from "react";
// import { Room } from "../../services/socket";
import { cn } from "../../lib/utils";
import { Chat } from "@/services/socket";

interface RoomListProps {
  chats: any[];
  activeChat?: string;
  onChatSelect: (roomId: string) => void;
}

const ChatList: React.FC<RoomListProps> = ({ chats, activeChat, onChatSelect }) => {
  return (
    <div className="space-y-1 py-2">
      <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Channels
      </p>
      {chats.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 italic">
            No channels available yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Start a conversation to create a new channel
          </p>
        </div>
      ) : (
        chats.map((chat:Chat) => (
          <button
            key={chat._id}
            onClick={() => onChatSelect(chat._id)}
            className={cn(
              "w-full text-left px-4 py-2 rounded-lg font-medium flex items-center",
              activeChat === chat._id
                ? "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <span className="mr-2">#</span>
            {chat._id}
          </button>
        ))
      )}
    </div>
  );
};

export default ChatList;
