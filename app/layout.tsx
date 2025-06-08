import type React from "react"
// import { UserProvider } from "@auth0/nextjs-auth0"
import "./globals.css"

export const metadata = {
  title: "ChatGPT Clone - Mobile",
  description: "A mobile-first ChatGPT clone built with Next.js",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
