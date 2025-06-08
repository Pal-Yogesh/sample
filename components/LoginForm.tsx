"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth"

export default function LoginForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && email.trim()) {
      login(name.trim(), email.trim())
    }
  }

  const handleDemoLogin = () => {
    login("Demo User", "demo@example.com")
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🤖</div>
          <h1 className="login-title">Welcome to ChatGPT</h1>
          <p className="login-subtitle">Log in with your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-input"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-input"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Continue
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-text">Don't want to sign up?</p>
          <button onClick={handleDemoLogin} className="demo-btn">
            Try the demo
          </button>
        </div>
      </div>
    </div>
  )
}
