"use client"

import { useUser } from "@auth0/nextjs-auth0"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/chat")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="main-content" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" style={{ width: "40px", height: "40px" }} />
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to chat
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🤖</div>
          <h1 className="login-title">Welcome to ChatGPT</h1>
          <p className="login-subtitle">Log in with your account to continue</p>
        </div>
        <a href="/auth/login" className="auth-btn">
          Continue with Auth0
        </a>
      </div>
    </div>
  )
}
