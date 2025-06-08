"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface ChatInputProps {
  onSendMessage: (message: string, generateImage: boolean) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [generateImage, setGenerateImage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), generateImage)
      setMessage("")
      setGenerateImage(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [message])

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-options">
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="generateImage"
                className="checkbox"
                checked={generateImage}
                onChange={(e) => setGenerateImage(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="generateImage" className="checkbox-label">
                Generate image
              </label>
            </div>
          </div>
          <div className="input-area">
            <textarea
              ref={textareaRef}
              className="message-input"
              placeholder="Message ChatGPT..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <div className="input-actions">
              <button type="button" className="attach-btn" title="Attach file">
                📎
              </button>
              <button type="submit" className="send-btn" disabled={!message.trim() || isLoading}>
                {isLoading ? <div className="spinner" /> : "↑"}
              </button>
            </div>
          </div>
          <div className="input-helper">ChatGPT can make mistakes. Check important info.</div>
        </form>
      </div>
    </div>
  )
}
