import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  getPendingChatRequests,
  acceptChatRequest,
  rejectChatRequest,
} from "@/lib/chatRequestService";
import {
  getUserConversations,
  getConversationBetweenUsers,
  updateConversationLastMessage,
} from "@/lib/conversationService";
import { getMessages, sendMessage, markMessagesAsRead } from "@/lib/messageService";
import { MessageCircle, Send, X, Check } from "lucide-react";
import { toast } from "sonner";

interface PendingRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  experience_id: string;
  created_at: string;
  requester?: any;
  experience?: any;
}

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    name?: string;
    email?: string;
  };
}

const PrepTalk = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");

  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimestampRef = useRef<string>("");
  const optimisticMessagesRef = useRef<Message[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch pending requests
  useEffect(() => {
    if (!user?.id) return;

    const fetchRequests = async (isInitial = false) => {
      try {
        if (isInitial) setLoadingRequests(true);
        
        const requests = await getPendingChatRequests(user.id);
        
        // Only update state if requests have changed
        setPendingRequests((prevRequests) => {
          const hasChanged =
            requests.length !== prevRequests.length ||
            JSON.stringify(requests) !== JSON.stringify(prevRequests);

          if (hasChanged) {
            return requests as PendingRequest[];
          }
          return prevRequests;
        });
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        if (isInitial) setLoadingRequests(false);
      }
    };

    // Initial fetch immediately with loading state
    fetchRequests(true);

    // Then check every 5 seconds for new requests (without loading state)
    const interval = setInterval(() => fetchRequests(false), 5000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fetch conversations
  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async (isInitial = false) => {
      try {
        if (isInitial) setLoadingConversations(true);
        const convs = await getUserConversations(user.id);
        setConversations(convs);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        if (isInitial) setLoadingConversations(false);
      }
    };

    // Initial fetch immediately with loading state
    fetchConversations(true);
    
    // Then check every 2 seconds for new conversations (without loading state)
    const interval = setInterval(() => fetchConversations(false), 2000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation?.id) {
      if (messageRefreshInterval.current) {
        clearInterval(messageRefreshInterval.current);
      }
      return;
    }

    // Initial fetch - full history
    const initialFetch = async () => {
      try {
        setLoadingMessages(true);
        const msgs = await getMessages(selectedConversation.id);
        setMessages(msgs as Message[]);

        // Mark messages as read
        await markMessagesAsRead(selectedConversation.id, user!.id);

        // Set last message timestamp for incremental updates
        if (msgs && msgs.length > 0) {
          lastMessageTimestampRef.current = msgs[msgs.length - 1].created_at;
        }

        setLoadingMessages(false);
        scrollToBottom();
      } catch (err) {
        console.error("Error fetching messages:", err);
        setLoadingMessages(false);
      }
    };

    initialFetch();

    // Polling for new messages only
    const fetchNewMessages = async () => {
      try {
        const msgs = await getMessages(selectedConversation.id);
        
        // Only update if there are new messages
        if (msgs && msgs.length > 0) {
          const lastTimestamp = lastMessageTimestampRef.current;
          const newMessages = msgs.filter(
            (msg) => !lastTimestamp || new Date(msg.created_at) > new Date(lastTimestamp)
          );

          if (newMessages.length > 0) {
            setMessages(msgs as Message[]);
            lastMessageTimestampRef.current = msgs[msgs.length - 1].created_at;

            // Mark new messages as read
            await markMessagesAsRead(selectedConversation.id, user!.id);

            scrollToBottom();
          }
        }
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    };

    // Fast polling every 1 second for new messages
    messageRefreshInterval.current = setInterval(fetchNewMessages, 1000);

    return () => {
      if (messageRefreshInterval.current) {
        clearInterval(messageRefreshInterval.current);
      }
    };
  }, [selectedConversation?.id, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      const conversationId = await acceptChatRequest(requestId, user!.id);

      // Refresh requests
      const requests = await getPendingChatRequests(user!.id);
      setPendingRequests(requests as PendingRequest[]);

      // Refresh conversations
      const convs = await getUserConversations(user!.id);
      setConversations(convs);

      // Select the new conversation
      if (conversationId) {
        const conv = convs.find((c) => c.id === conversationId);
        if (conv) {
          setSelectedConversation(conv);
        }
      }

      toast.success("Chat request accepted!");
    } catch (err) {
      console.error("Error accepting request:", err);
      toast.error("Failed to accept request");
    } finally {
      setProcessingRequest("");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      await rejectChatRequest(requestId, user!.id);

      // Refresh requests
      const requests = await getPendingChatRequests(user!.id);
      setPendingRequests(requests as PendingRequest[]);

      toast.success("Request rejected");
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error("Failed to reject request");
    } finally {
      setProcessingRequest("");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim() || !selectedConversation?.id) return;

    const messageText = messageContent.trim();
    setMessageContent("");

    // Optimistic UI update - show message immediately (no temp ID, looks real)
    const optimisticMessage: Message = {
      id: `msg-${Date.now()}`, // Real-looking ID
      conversation_id: selectedConversation.id,
      sender_id: user!.id,
      content: messageText,
      created_at: new Date().toISOString(),
      sender: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
      },
    };

    // Add to messages immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    // Send to server in background (don't wait, don't block UI)
    // Fire and forget - polling will fetch the real message
    sendMessage(selectedConversation.id, user!.id, messageText)
      .then(async () => {
        await updateConversationLastMessage(selectedConversation.id);
        lastMessageTimestampRef.current = new Date().toISOString();
        // Don't need to do anything else - polling will pick it up
      })
      .catch((err) => {
        console.error("Error sending message:", err);
        
        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );

        toast.error("Failed to send message");
        setMessageContent(messageText); // Restore user's text
      });
  };

  if (!user?.id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            PrepTalk
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect and chat with other placement seekers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
          {/* Left Sidebar - Requests and Conversations */}
          <div className="lg:col-span-1 space-y-4">
            {/* Pending Requests */}
            {loadingRequests ? (
              <div className="glass-card p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary mx-auto"></div>
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider px-2">
                  Connect Requests
                </h2>
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="glass-card p-4 space-y-3 border-l-4 border-accent/60 hover:border-accent/80 hover:bg-accent/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 flex items-center justify-center border border-accent/20 mt-0.5">
                        <span className="text-xs font-bold text-accent">
                          {(req.requester?.name || req.requester?.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">
                          {req.requester?.name || req.requester?.email || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          wants to chat about
                        </p>
                        <p className="text-xs font-medium text-accent mt-1">
                          {req.experience?.company || "Experience"} • {req.experience?.role || "Role"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        disabled={processingRequest === req.id}
                        className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-success/40 to-success/20 text-success hover:from-success/60 hover:to-success/40 transition-all duration-200 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed border border-success/20"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={processingRequest === req.id}
                        className="flex-1 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-200 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed border border-destructive/20"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loadingRequests && (
                <div className="glass-card p-4 text-center text-muted-foreground text-sm">
                  No pending requests
                </div>
              )
            )}

            {/* Conversations List */}
            {loadingConversations ? (
              <div className="glass-card p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary mx-auto"></div>
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider px-2">
                  Messages
                </h2>
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-3 rounded-lg transition-all text-left flex items-center gap-3 group ${
                      selectedConversation?.id === conv.id
                        ? "glass-card border-l-2 border-primary bg-primary/10"
                        : "glass-card hover:bg-secondary/30 hover:border-l-2 hover:border-primary/30"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center border border-primary/20">
                      <span className="text-xs font-bold text-primary">
                        {(conv.other_user_name || conv.other_user?.name || conv.other_user?.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {conv.other_user_name || conv.other_user?.name || conv.other_user?.email || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.last_message || "No messages yet"}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="flex-shrink-0 inline-block text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground px-2.5 py-0.5 rounded-full font-semibold shadow-lg shadow-primary/20">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              !loadingConversations && (
                <div className="glass-card p-4 text-center text-muted-foreground text-sm">
                  No conversations yet. Accept a request or send a connect request!
                </div>
              )
            )}
          </div>

          {/* Right Side - Chat Interface */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="glass-card h-full flex flex-col overflow-hidden">
                {/* Chat Header - Modern Design */}
                <div className="p-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center gap-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center border border-primary/20">
                      <span className="text-sm font-bold text-primary">
                        {(selectedConversation.other_user_name || selectedConversation.other_user?.name || selectedConversation.other_user?.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-lg text-foreground">
                        {selectedConversation.other_user_name || selectedConversation.other_user?.name || selectedConversation.other_user?.email || "User"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.other_user?.email || "No email available"}
                      </p>
                    </div>
                    {/* Online Indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-success/60 border border-success/40"></div>
                    </div>
                  </div>
                </div>

                {/* Messages Area - Modern Design */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-96 bg-gradient-to-b from-foreground/[0.01] to-background">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-base">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 animate-fade-in ${
                          msg.sender_id === user.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {msg.sender_id !== user.id && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                            {(msg.sender?.name || msg.sender?.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`max-w-xs lg:max-w-md group ${
                            msg.sender_id === user.id
                              ? "flex flex-col items-end"
                              : "flex flex-col items-start"
                          }`}
                        >
                          {msg.sender_id !== user.id && (
                            <p className="text-xs font-semibold text-muted-foreground mb-1 px-3">
                              {msg.sender?.name || msg.sender?.email || "User"}
                            </p>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl backdrop-blur-md transition-all duration-200 ${
                              msg.sender_id === user.id
                                ? "bg-gradient-to-br from-primary/60 to-primary/40 text-primary-foreground shadow-lg shadow-primary/20 border border-primary/30"
                                : "bg-gradient-to-br from-secondary/60 to-secondary/40 text-foreground shadow-md shadow-secondary/10 border border-secondary/30"
                            }`}
                          >
                            <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                          </div>
                          <p
                            className={`text-xs mt-1.5 px-3 transition-opacity ${
                              msg.sender_id === user.id
                                ? "text-primary/60 opacity-0 group-hover:opacity-100"
                                : "text-muted-foreground/60 opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {msg.sender_id === user.id && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center text-xs font-semibold text-primary">
                            You
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input - Modern Design */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-5 border-t border-border/30 bg-gradient-to-r from-primary/3 to-accent/3 backdrop-blur-sm"
                >
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 rounded-xl bg-secondary/40 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-secondary/30 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!messageContent.trim()}
                      className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-primary/30"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass-card h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-base font-medium">No conversation selected</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Select a conversation or accept a request to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrepTalk;
