'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import styles from './page.module.css';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const { user, logout, loading: authLoading, token } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Only fetch data if user is authenticated
    if (user && token) {
      fetchConversations();
    }
  }, [user, authLoading, token, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (currentConversation?.messages && currentConversation.messages.length > 0) {
      scrollToBottom();
    }
  }, [currentConversation?.messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConversations(response.data);
      
      // Don't auto-select first conversation - let user start new chat or select manually
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      if (error.response?.status === 401) {
        logout();
        router.push('/login');
      }
    }
  };

  const createNewConversation = () => {
    // Just set currentConversation to null to start a new chat
    // Conversation will be created when first message is sent
    setCurrentConversation(null);
    setMessage(''); // Clear any existing message
  };

  const selectConversation = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/chat/conversations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentConversation(response.data);
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      if (error.response?.status === 401) {
        logout();
        router.push('/login');
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading || !token) return;

    const userMessage = message.trim();
    const isNewConversation = !currentConversation;
    
    // Store the previous conversation state for error recovery
    const previousConversation = currentConversation;
    
    setMessage('');
    setLoading(true);

    // If no current conversation, create a temporary one for UI
    if (isNewConversation) {
      // Create temporary conversation object for UI
      const tempConversation: Conversation = {
        id: `temp-${Date.now()}`,
        title: userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentConversation(tempConversation);
    }

    // Add user message to UI immediately (optimistic update)
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    // Update UI optimistically
    if (isNewConversation) {
      // For new conversation, set messages array with temp message
      setCurrentConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [tempUserMessage],
        };
      });
    } else {
      // For existing conversation, append temp message
      setCurrentConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), tempUserMessage],
        };
      });
    }

    try {
      // Determine if we need to send conversationId
      const conversationId = currentConversation && !currentConversation.id.startsWith('temp')
        ? currentConversation.id
        : undefined;

      const response = await axios.post(
        `${API_URL}/api/chat/messages`,
        {
          ...(conversationId ? { conversationId } : {}),
          content: userMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Response includes the conversation (new or existing)
      let updatedConversation = response.data.conversation;
      
      // Ensure messages array exists and is properly formatted
      if (!updatedConversation) {
        throw new Error('No conversation in response');
      }
      
      // Always fetch the full conversation to ensure we have all messages
      // The response might not include messages in some cases
      const conversationResponse = await axios.get(
        `${API_URL}/api/chat/conversations/${updatedConversation.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Use the fetched conversation which should have all messages
      const fullConversation = conversationResponse.data;
      console.log('Full conversation fetched:', fullConversation);
      console.log('Messages in conversation:', fullConversation.messages);
      console.log('Messages count:', fullConversation.messages?.length);
      
      // Set the conversation with all messages
      setCurrentConversation(fullConversation);
      
      // Refresh conversations list to include the new conversation
      // The new conversation will appear in the sidebar
      const conversationsResponse = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConversations(conversationsResponse.data);
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Revert to previous state on error
      setCurrentConversation(previousConversation);
      setMessage(userMessage); // Restore the message
      
      if (error.response?.status === 401) {
        logout();
        router.push('/login');
      } else {
        alert('Error sending message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    
    try {
      await axios.delete(`${API_URL}/api/chat/conversations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (currentConversation?.id === id) {
        await createNewConversation();
      }
      await fetchConversations();
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      if (error.response?.status === 401) {
        logout();
        router.push('/login');
      }
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading...</div>
      </div>
    );
  }

  // Don't render chat if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Chatbox</h2>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <button onClick={logout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
          <button onClick={createNewConversation} className={styles.newChatButton}>
            + New Chat
          </button>
        </div>
        <div className={styles.conversationsList}>
          {conversations.length === 0 ? (
            <div className={styles.emptyConversations}>
              <p>No conversations yet. Create a new one to start chatting!</p>
            </div>
          ) : (
            conversations.map((conv) => (
            <div
              key={conv.id}
              className={`${styles.conversationItem} ${
                currentConversation?.id === conv.id ? styles.active : ''
              }`}
              onClick={() => selectConversation(conv.id)}
            >
              <span className={styles.conversationTitle}>{conv.title}</span>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className={styles.deleteButton}
              >
                ×
              </button>
            </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {!currentConversation ? (
            <div className={styles.emptyState}>
              <h3>Start a new conversation</h3>
              <p>Type a message below to begin chatting with AI. Your first message will become the conversation title.</p>
            </div>
          ) : !currentConversation.messages || currentConversation.messages.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>Start a conversation</h3>
              <p>Send a message to begin chatting with AI</p>
            </div>
          ) : (
            currentConversation.messages
              .filter((msg) => msg && msg.content) // Filter out invalid messages
              .map((msg) => (
                <div
                  key={msg.id || `msg-${msg.createdAt}-${msg.role}`}
                  className={`${styles.message} ${
                    msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  <div className={styles.messageContent}>{msg.content}</div>
                </div>
              ))
          )}
          {loading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.messageContent}>
                <span className={styles.typingIndicator}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className={styles.inputForm}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={currentConversation ? "Type your message..." : "Start a new conversation..."}
            className={styles.input}
            disabled={loading}
          />
          <button type="submit" className={styles.sendButton} disabled={loading || !message.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

