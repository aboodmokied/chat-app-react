
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import RoomList from "../Chat/RoomList";
import UserList from "../Chat/UserList";
import ChatArea from "../Chat/ChatArea";
// import socketService, { Room, User } from "../../services/socket";
import { Button } from "../../components/ui/button";
import { MenuIcon, X } from "lucide-react";

const ChatLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // For mobile responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize rooms
  useEffect(() => {
    if (!user) return;

    // Mock rooms data
    const mockRooms: any[] = [
      { id: "general", name: "General" },
      { id: "random", name: "Random" },
      { id: "support", name: "Support" },
      { id: "announcements", name: "Announcements" },
    ];
    
    setRooms(mockRooms);
    setActiveRoom("general");
    
    // In a real app, we would get rooms from the server
    // socketService.getRooms((serverRooms) => {
    //   setRooms(serverRooms);
    //   if (serverRooms.length > 0 && !activeRoom) {
    //     setActiveRoom(serverRooms[0].id);
    //   }
    // });
  }, [user]);

  // Get users for the active room
  useEffect(() => {
    if (!user || !activeRoom) return;

    // Mock users data
    const mockUsers: any[] = [
      { id: user.id, name: user.name, avatar: user.avatar, isOnline: true },
      { id: "user1", name: "John Doe", avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random", isOnline: true },
      { id: "user2", name: "Jane Smith", avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=random", isOnline: true },
      { id: "user3", name: "Mike Johnson", avatar: "https://ui-avatars.com/api/?name=Mike+Johnson&background=random", isOnline: false },
      { id: "user4", name: "Sarah Williams", avatar: "https://ui-avatars.com/api/?name=Sarah+Williams&background=random", isOnline: false },
    ];
    
    setUsers(mockUsers);

    // In a real app, we would get users from the server
    // socketService.getUsers(activeRoom, (roomUsers) => {
    //   setUsers(roomUsers);
    // });
  }, [user, activeRoom]);

  const handleRoomSelect = (roomId: string) => {
    console.log('New Room')
    setActiveRoom(roomId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div 
        className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isMobile ? "fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out" : "relative w-64 flex-shrink-0"}
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              C
            </div>
            <h1 className="font-bold text-xl">Chat App</h1>
          </div>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
              <span className="sr-only">Close sidebar</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <RoomList 
            rooms={rooms} 
            activeRoom={activeRoom} 
            onRoomSelect={handleRoomSelect} 
          />
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto">
          <UserList users={users} />
        </div>

        {/* User profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {user && (
            <>
              <div className="flex items-center space-x-2">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{user.name}</span>
              </div>
              <Button 
                onClick={logout} 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Mobile header */}
        <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center lg:hidden">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-3"
          >
            <MenuIcon size={20} />
            <span className="sr-only">Open sidebar</span>
          </button>
          <h2 className="font-medium">
            {activeRoom && rooms.find(room => room.id === activeRoom)?.name}
          </h2>
        </div>
        
        {/* Room header for desktop */}
        <div className="hidden lg:flex bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 items-center">
          <h2 className="font-medium text-lg">
            # {activeRoom && rooms.find(room => room.id === activeRoom)?.name}
          </h2>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatArea currentUser={user} activeRoom={activeRoom} />
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ChatLayout;
