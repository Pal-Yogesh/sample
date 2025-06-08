"use client"

import type { Conversation } from "@/lib/supabase"
import { useState } from "react"

interface ConversationListProps {
  conversations: Conversation[]
  currentConversationId?: string
  onSelectConversation: (id: string) => void
 
  onNewConversation: () => void
}

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [showList, setShowList] = useState(false)

  return (
    <>
      <div className="d-flex gap-2">
        <button className="btn btn-outline-primary btn-sm" onClick={() => setShowList(!showList)}>
          📋 Chats
        </button>
        <button className="btn btn-primary btn-sm" onClick={onNewConversation}>
          ➕ New
        </button>
      </div>

      {showList && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-white" style={{ zIndex: 1050 }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h5 className="mb-0">Conversations</h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowList(false)}>
              ✕
            </button>
          </div>
          <div className="p-3">
            {conversations.length === 0 ? (
              <p className="text-muted text-center">No conversations yet</p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`card mb-2 ${currentConversationId === conversation.id ? "border-primary" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div
                        className="flex-grow-1"
                        onClick={() => {
                          onSelectConversation(conversation.id)
                          setShowList(false)
                        }}
                      >
                        <h6 className="card-title mb-1" style={{ fontSize: "14px" }}>
                          {conversation.title}
                        </h6>
                        <small className="text-muted">{new Date(conversation.created_at).toLocaleDateString()}</small>
                      </div>
                    
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
