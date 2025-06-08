"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useEffect, useState, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import TypingIndicator from "@/components/TypingIndicator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string; // Keep consistent naming
}

export default function ChatPage() {
  const { user, isLoading: userLoading } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const response = await fetch(
        `/api/conversations?userID=${encodeURIComponent(user.sub)}`
      );
      const data = await response.json();
      const allconversations = JSON.parse(data.conversations);
      // console.log("data", allconversations);
      setConversations(allconversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;
    try {
      // const response = await fetch(`/api/messages/${conversationId}`);
      // const data = await response.json();

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatID: conversationId,
          userID: user.sub,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const Convmessage = JSON.parse(data.conversations);
      console.log(Convmessage[0].chat_history);
      setMessages(Convmessage[0].chat_history || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async (message: string, generateImage: boolean) => {
    console.log(message, generateImage);

    try {
      // Add user message immediately with generated ID
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const chatID = localStorage.getItem("currentConversationId");
      const userID = user?.sub;

      // Get current messages including the new user message
      const currentMessages = [...messages, userMessage];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          generateImage,
          chatID,
          userID,
          messages: currentMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle the response
      const { responseText: aiResponse, imageUrl, chatId } = data;

      console.log("AI Response:", aiResponse);
      if (imageUrl) {
        console.log("Generated Image URL:", imageUrl);
      }

      // Add assistant response with generated ID
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponse,
        imageUrl,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update current conversation ID if we got a new one from the server
      if (chatId) {
        localStorage.setItem("currentConversationId", chatId);
        if (!currentConversationId) {
          setCurrentConversationId(chatId);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);

      // Add error message to chat
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);

      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred");
      }

      throw error;
    }
  };
  const handleSelectConversation = (conversationId: string) => {
    console.log("chat id to be load", conversationId);
    setCurrentConversationId(conversationId);
    loadMessages(conversationId);
  };

 const handleDeleteConversation = async (chat_id: string) => {
   console.log("Delete request for chatId:", chat_id);
  if (!user) return;
  try {
    const response = await fetch(`/api/conversations?chatId=${encodeURIComponent(chat_id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorJson = await response.json();
      alert(`Failed to delete chat: ${errorJson.error || await response.text()}`);
      return;
    }

    // Success — update UI accordingly
    alert("Chat deleted successfully");
    // Optionally refresh conversation list and clear messages if needed
    setConversations((prev) => prev.filter(c => c.chat_id !== chat_id));
    if (currentConversationId === chat_id) {
      setCurrentConversationId(undefined);
      setMessages([]);
    }
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    alert("An error occurred while deleting the chat.");
  }
};


  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
    setMessages([]);
  };

  if (userLoading) {
    return (
      <div className="app-container">
        <div
          className="main-content"
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <div className="spinner" style={{ width: "40px", height: "40px" }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🤖</div>
            <h1 className="login-title">Welcome to ChatGPT</h1>
            <p className="login-subtitle">
              Log in with your account to continue
            </p>
          </div>
          <a href="/auth/login" className="auth-btn">
            Continue with Auth0
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <div className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="chatgpt-logo">
            <div className="logo-icon">🤖</div>
            ChatGPT
          </div>
          <div style={{ width: "32px" }} />
        </div>

        <div className="chat-messages">
          {messages.length === 0 && !isLoading && (
            <div className="welcome-screen">
              <h1 className="welcome-title">How can I help you today?</h1>
              <p className="welcome-subtitle">
                I'm ChatGPT, an AI assistant created by OpenAI. I can help you
                with a wide variety of tasks.
              </p>
              <div className="welcome-features">
                <div className="feature-card">
                  <div className="feature-icon">💬</div>
                  <div className="feature-title">Natural conversations</div>
                  <div className="feature-description">
                    Ask me anything and I'll provide helpful, detailed responses
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎨</div>
                  <div className="feature-title">Image generation</div>
                  <div className="feature-description">
                    Create stunning images from your text descriptions
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📱</div>
                  <div className="feature-title">Mobile optimized</div>
                  <div className="feature-description">
                    Perfect experience on any device, anywhere
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
