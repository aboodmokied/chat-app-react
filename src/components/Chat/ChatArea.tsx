import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import socketService, {
  GetChatMessagesData,
  Message,
  User,
} from "@/services/socket";
import { useSocket } from "@/context/SocketContext";

interface ChatAreaProps {
  currentUser: User | null;
  activeChat: string | null;
  newMessage: Message;
  chatUsers: User[];
}

const ChatArea: React.FC<ChatAreaProps> = ({
  currentUser,
  activeChat,
  newMessage,
  chatUsers,
}) => {
  const [messageMap, setMessageMap] = useState<Map<string, Message>>(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);
  const {socket}=useSocket();
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle new message via props
  useEffect(() => {
    if (newMessage && newMessage._id) {
      setMessageMap(prev => {
        if (prev.has(newMessage._id)) return prev;
        const updated = new Map(prev);
        updated.set(newMessage._id, newMessage);
        return updated;
      });
    }
  }, [newMessage]);

  // Fetch messages on activeChat or page change (for the first open)
  useEffect(() => {
    if (!activeChat || !currentUser) return;
    setMessageMap(new Map());
    setPage(1);
    getChatMessages();
  }, [activeChat, currentUser]);
  
  // Fetch messages (Pagination)
  useEffect(() => {
    if (!activeChat || !currentUser || page==1) return;
    getChatMessages(page);
  }, [page]);

  // get chat messages
  const getChatMessages=async(page=1)=> {
    setLoading(true);
    socketService.getChatMessages(
      { chatId: activeChat, limit: 50, page },
      ({ messages }: GetChatMessagesData) => {
        if (messages.length < 50) setHasMore(false);

        setMessageMap(prevMap => {
          const updated = new Map(prevMap);
          messages.forEach(msg => {
            if (msg._id && !updated.has(msg._id)) {
              updated.set(msg._id, msg);
            }
          });
          return updated;
        });

        setLoading(false);
      }
    )
  } 

  // Sorted messages
  const sortedMessages = useMemo(() => {
    return Array.from(messageMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messageMap]);

  // Preserve scroll position on message prepend
  useLayoutEffect(() => {
    if (!containerRef.current || page === 1) return;
    const container = containerRef.current;
    const newHeight = container.scrollHeight;
    container.scrollTop = newHeight - prevHeightRef.current;
  }, [sortedMessages.length]);

  // Detect scroll near bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 100; // px
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;
      setIsNearBottom(isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll to bottom if near bottom
  useEffect(() => {
    if (isNearBottom) scrollToBottom();
  }, [messageMap]);

  // Observe scroll to top for pagination
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          prevHeightRef.current = containerRef.current?.scrollHeight || 0;
          setPage(prev => prev + 1);
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      }
    );

    const sentinel = topSentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => sentinel && observer.unobserve(sentinel);
  }, [hasMore, loading]);

  // Send message handler (currently mocked)
  const handleSendMessage = (text: string) => {
    if (!currentUser || !activeChat || !socket) return;
    // Optimistic UI update
    // const tempId = `temp_${Date.now()}`;
    // const optimisticMessage: Message = {
    //   id: tempId,
    //   content: text,
    //   sender: currentUser,
    //   reciever: currentUser, // replace as needed
    //   timestamp: new Date(),
    //   chatId: activeChat,
    //   opened:false

    // };

    // setMessageMap(prev => {
    //   const updated = new Map(prev);
    //   updated.set(tempId, optimisticMessage);
    //   return updated;
    // });
    // extract the reciever from chatUsers (the chat has only two users)
    const otherUsers=chatUsers.filter(u=>u._id!=currentUser._id);    
    socketService.sendMessage(activeChat, text, otherUsers[0]._id);
  };

  return (
    <div className="flex flex-col h-full">
      {!activeChat ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
            Select a chat to view messages
            </p>
          </div>
        ) : (
        <>
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 relative"
        >
            <div ref={topSentinelRef} />

            {loading && page === 1 ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
            ) : sortedMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No messages in this room yet. Send the first message!
                </p>
              </div>
            ) : (
              sortedMessages.map(msg => (
                <ChatMessage key={msg._id} message={msg} currentUser={currentUser} />
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {!isNearBottom && (
            <button
              className="absolute bottom-20 right-4 bg-purple-600 text-white px-4 py-2 rounded shadow"
              onClick={scrollToBottom}
            >
              New messages ↓
            </button>
          )}
        </>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        isDisabled={!currentUser || !activeChat}
      />
    </div>
  );
};

export default ChatArea;



// TODO: Fix Pagination
// TODO: Fix Timing
