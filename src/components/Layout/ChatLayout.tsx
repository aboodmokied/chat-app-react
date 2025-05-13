
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import UserList from "../Chat/UserList";
import ChatArea from "../Chat/ChatArea";
// import socketService, { Room, User } from "../../services/socket";
import { Button } from "../../components/ui/button";
import { MenuIcon, PlusCircle, X } from "lucide-react";
import socketService, { Chat, GetChatsData, GetChatUsersData, Message, NewChatData, NewMessageData, User } from "@/services/socket";
import { useSocket } from "@/context/SocketContext";
import ChatList from "../Chat/ChatList";
import NewChatModal from "../Chat/NewChatModal";

const ChatLayout: React.FC = () => {
  const { user, logout,isAuthenticated, token } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string|null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newMessage, setNewMessage] = useState<Message|null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  // For mobile responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {socket,connectSocket,socketConnectionLoading,socketError,socketConnected}=useSocket();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // socket connection
  useEffect(()=>{
    if(isAuthenticated){
      connectSocket(token);
      // Initialize socket event listeners
      socketService.setupListeners();
    }
    return ()=>{
      socketService.disconnectSocket()
     socketService.removeListeners()
    };
  },[isAuthenticated])
  useEffect(() => {
    if (socket && socketConnected) {
    }
  }, [socket, socketConnected]);
  // Initialize chats
  useEffect(() => {
    if (!user || !socket || !socketConnected) return;
    // Get User Chats
    socketService.getChats(({chats}:GetChatsData) => {
      setChats(chats);
      // setActiveChat(chats[0]?._id||null);
    })
    // Listen for new chats
    socketService.onNewChat(({chat}:NewChatData)=>{
      setChats(prevChats => {
      const isAlreadyExist = prevChats.find(ch => ch._id === chat._id);
      if (!isAlreadyExist) {
        return [chat, ...prevChats];
      } else {
        const otherMessages = prevChats.filter(ch => ch._id !== chat._id);
        return [isAlreadyExist, ...otherMessages];
      }
      });
      setActiveChat(chat._id);
  })
    

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      socketService.offNewChat();
      socketService.offNewMessage();
      socketService.offGetChats();
    };
  }, [socket, user,socketConnected]);


  useEffect(()=>{
    // Listen for new messages
    socketService.onNewMessage(({message,chat}:NewMessageData)=>{
      if(activeChat===chat._id){
        // add this message to active chat messages ui
        setNewMessage(message)
      }else{
        // 
        // show notification or alert to the user
      }
      // get the message chat to the top of the chats list
      setChats(prevChats => {
        // Remove the chat with matching ID from the array
        const filteredChats = prevChats.filter(c => c._id !== chat._id);
        // Add the chat to the beginning of the array
        return [chat, ...filteredChats];
      });
      
    })
    return () => {
      socketService.offNewMessage();
    };
  },[activeChat])
  // Get users for the active room
  useEffect(() => {
    if (!user || !activeChat || !socket ) return;

    socketService.getChatUsers({chatId:activeChat},({users}:GetChatUsersData)=>{
      setUsers(users.users);
    })
    return ()=>{
      socketService.offGetChatUsers();
    }
  }, [activeChat]);

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  if (socketConnectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (socketError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Connection Error!</strong>
          <p className="block sm:inline"> {socketError.message || 'Could not connect to chat server.'}</p>
        </div>
        <button
          onClick={() => connectSocket(token)}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={logout}
          className="mt-2 px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

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
        {/* New Chat button */}
        <div className="p-3">
          <Button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-600/90 text-sidebar-primary-foreground"
            >
            <PlusCircle size={18} />
            New Chat
          </Button>
        </div>
        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          <ChatList
            chats={chats}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
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
                  src={/*user.avatar || */`https://ui-avatars.com/api/?name=${user.name}`}
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
            {activeChat && chats.find(chat => chat._id === activeChat)?.chatName}
          </h2>
        </div>

        {/* Chat header for desktop */}
        <div className="hidden lg:flex bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 items-center">
          <h2 className="font-medium text-lg">
            # {activeChat && chats.find(chat => chat._id === activeChat)?._id}
          </h2>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatArea currentUser={user} activeChat={activeChat} newMessage={newMessage} chatUsers={users}/>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      {/* New Chat Modal */}
      <NewChatModal 
        isOpen={showNewChatModal} 
        onOpenChange={setShowNewChatModal}
      />
    </div>
  );
};

export default ChatLayout;

