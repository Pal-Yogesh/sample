"use client"

import { useUser } from "@auth0/nextjs-auth0"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid'


interface SidebarProps {
  conversations: any[]
  currentConversationId?: string
  onSelectConversation: (id: string) => void
  onDeleteConversation: (chat_id: string) => void
  onNewConversation: () => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  isOpen,
  onClose,
}: SidebarProps) {
  const { user } = useUser();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 768);
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    // Close sidebar when clicking outside on mobile
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar && !sidebar.contains(e.target as Node)) {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, onClose]);

  useEffect(() => {
    // Check if a currentConversationId exists in localStorage
    const storedConversationId = localStorage.getItem('currentConversationId');

    // If not, create a new one and set it
    if (!storedConversationId) {
      const newConversationId = uuidv4();
      localStorage.setItem('currentConversationId', newConversationId);
      onNewConversation(); // Optionally trigger a new conversation
    }
  }, []);

  const handleNewChat = () => {
    const newConversationId = uuidv4()
    localStorage.setItem('currentConversationId', newConversationId)
    onNewConversation()
    onClose()
  }

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id)
    onClose()
  }

  return (
    <>
    {isMobile && isOpen && (
        <div 
          className="sidebar-overlay show"
          onClick={onClose}
        />
      )}

      <div 
      className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={onClose} />
      <div
        className={`sidebar ${typeof window !== "undefined" && window.innerWidth <= 768 ? "sidebar-mobile" : ""} ${isOpen ? "open" : ""}`}
      >
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <span className="new-chat-icon">✏️</span>
            New chat
          </button>
        </div>

        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div
              style={{
                padding: "20px 16px",
                textAlign: "center",
                color: "var(--text-tertiary)",
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item`}
                onClick={() => handleSelectConversation(conversation.chat_id)}
              >
                <div className="conversation-title">{conversation.chat_id}</div>
                <div className="conversation-actions">
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conversation.chat_id)
                    }}
                    title="Delete conversation"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || "U"}</div>
            <div className="user-details">
              <div className="user-name">{user?.name || "User"}</div>
              <div className="user-email">{user?.email || "user@example.com"}</div>
            </div>
            <a href="/auth/logout" className="logout-btn" title="Sign out">
              ↪ 
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
