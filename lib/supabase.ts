export type Message = {
  id: string
  conversation_id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  image_url?: string
  created_at: string
}

export type Conversation = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}
