import type { NextRequest } from "next/server";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { chatID, userID } = await request.json();
    console.log(chatID, userID)
    
    if (!userID) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    let query: string;
    let params: any[];

    if (chatID) {
      // If both userID and chatID are provided, fetch specific chat
      query = `SELECT id,chat_history, user_id, chat_id, created_at, updated_at 
               FROM chat_history 
               WHERE user_id = $1 AND chat_id = $2 
               ORDER BY updated_at DESC`;
      params = [userID, chatID];
    } else {
      // If only userID is provided, fetch all chats for the user
      query = `SELECT id, user_id, chat_id, created_at, updated_at 
               FROM chat_history 
               WHERE user_id = $1 
               ORDER BY updated_at DESC`;
      params = [userID];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      const message = chatID 
        ? "No chat found for this user and chat ID" 
        : "No chats found for this user";
      
      return Response.json({ 
        conversations: [],
        message 
      });
    }

    // console.log(JSON.stringify(result.rows))

    return Response.json({
      conversations: JSON.stringify(result.rows),
      count: result.rows.length
    });

  } catch (error) {
    console.error("Error fetching chats:", error);
    
    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes('connection')) {
        return Response.json({ error: "Database connection error" }, { status: 503 });
      }
    }

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}