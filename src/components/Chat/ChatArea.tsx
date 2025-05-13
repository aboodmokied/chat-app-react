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
  import ScrollToBottom, {
    useScrollToBottom,
  } from "react-scroll-to-bottom";

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
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const prevHeightRef = useRef<number>(0);
    const isPrependingRef = useRef(false);
    const { socket } = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useScrollToBottom();

    // Handle new message via props
    useEffect(() => {
      if (newMessage && newMessage._id) {
        setMessageMap(prev => {
          if (prev.has(newMessage._id)) return prev;
          const updated = new Map(prev);
          updated.set(newMessage._id, newMessage);
          return updated;
        });

        // If we're at the bottom, auto-scroll down
        if (isAtBottom) {
          scrollToBottom();
        } else {
          // Otherwise increment new message count
          setNewMessageCount(prev => prev + 1);
        }
      }
    }, [newMessage,activeChat]);

    // Fetch messages on chat/user change
    useEffect(() => {
      if (!activeChat || !currentUser) return;
      setMessageMap(new Map());
      setPage(1);
      setHasMore(true);
      setNewMessageCount(0);
      getChatMessages(1);
    }, [activeChat, currentUser]);

    // Fetch paginated messages
    useEffect(() => {
      if (!activeChat || !currentUser || page === 1) return;
      getChatMessages(page);
    }, [page,activeChat]);

    const getChatMessages = async (page = 1) => {
      setLoading(true);
      isPrependingRef.current = page > 1;

      socketService.getChatMessages(
        { chatId: activeChat, limit: 20, page },
        ({ messages }: GetChatMessagesData) => {
          if (messages.length < 20){
            setHasMore(false);
          } 
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
      );
    };

    // Sorted messages
    const sortedMessages = useMemo(() => {
      return Array.from(messageMap.values()).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }, [messageMap]);

    // Preserve scroll position on pagination
    useLayoutEffect(() => {
      if (!isPrependingRef.current) return;

      const container = document.querySelector('.scroll-view') as HTMLDivElement;
      if (container) {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - prevHeightRef.current;
      }

      isPrependingRef.current = false;
    }, [sortedMessages.length]);

    // Observe scroll to top
    useEffect(() => {
      const container = document.querySelector('.scroll-view') as HTMLDivElement;
      if (!container) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            prevHeightRef.current = container.scrollHeight;
            setPage(prev => prev + 1);
          }
        },
        {
          root: container,
          threshold: 0.1,
        }
      );

      const sentinel = topSentinelRef.current;
      if (sentinel) observer.observe(sentinel);
      return () => sentinel && observer.unobserve(sentinel);
    }, [hasMore, loading]);

    // Handle scroll events to detect position
    useEffect(() => {
      const container = document.querySelector('.scroll-view') as HTMLDivElement;
      if (!container) return;

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const threshold = 50; // pixels from bottom to consider "at bottom"
        const atBottom = scrollHeight - (scrollTop + clientHeight) < threshold;
        
        setIsAtBottom(atBottom);
        
        // If user scrolls to bottom, reset new message count
        if (atBottom) {
          setNewMessageCount(0);
        }
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }, [activeChat,currentUser]);

    // Send message
    const handleSendMessage = (text: string) => {
      if (!currentUser || !activeChat || !socket) return;
      const otherUsers = chatUsers.filter(u => u._id !== currentUser._id);
      socketService.sendMessage(activeChat, text, otherUsers[0]._id);
    };

    const handleScrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setNewMessageCount(0);
    };

    return (
      <div className="flex flex-col h-full relative">
        {!activeChat ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Select a chat to view messages
            </p>
          </div>
        ) : (
          <>
            <ScrollToBottom
              className="flex-1 overflow-y-auto p-4 relative"
              followButtonClassName="hidden"
              scrollViewClassName="scroll-view"
            >
              <div ref={topSentinelRef} />

              {loading && page === 1 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
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
            </ScrollToBottom>

            {!isAtBottom && (
              <button
                className="absolute bottom-20 right-4 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg transition hover:bg-purple-700 flex items-center justify-center"
                onClick={handleScrollToBottom}
                style={{ width: '3rem', height: '3rem' }}
              >
                {newMessageCount > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {newMessageCount}
                  </span>
                ) : null}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
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