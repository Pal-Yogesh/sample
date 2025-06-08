"use client"
import Image from "next/image"

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  
  return (
    <div className="message-container">
      <div className="message-wrapper">
        <div className={`message-avatar ${isUser ? "user-avatar-msg" : "assistant-avatar-msg"}`}>
          {isUser ? "👤" : "🤖"}
        </div>
        <div className="message-content">
          <p>{message.content}</p>
          {message.imageUrl && (
            <Image
              src={`${message.imageUrl}`}
              alt="Generated image"
              width={400}
              height={300}
              className="message-image"
            />
          )}
        </div>
      </div>
    </div>
  )
}