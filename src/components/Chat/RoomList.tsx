
import React from "react";
// import { Room } from "../../services/socket";
import { cn } from "../../lib/utils";

interface RoomListProps {
  rooms: any[];
  activeRoom?: string;
  onRoomSelect: (roomId: string) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, activeRoom, onRoomSelect }) => {
  return (
    <div className="space-y-1 py-2">
      <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Channels
      </p>
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onRoomSelect(room.id)}
          className={cn(
            "w-full text-left px-4 py-2 rounded-lg font-medium flex items-center",
            activeRoom === room.id
              ? "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <span className="mr-2">#</span>
          {room.name}
        </button>
      ))}
    </div>
  );
};

export default RoomList;
