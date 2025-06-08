"use client"

export default function TypingIndicator() {
  return (
    <div className="message-container typing-container">
      <div className="message-wrapper">
        <div className="message-avatar assistant-avatar">🤖</div>
        <div className="message-content">
          <div className="typing-indicator">
            <span>ChatGPT is typing</span>
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
