// app/api/chats/route.ts
import type { NextRequest } from "next/server";
import db from "@/lib/db";

interface ChatHistory {
  id: number;
  chat_history: any[];
  user_id: string;
  chat_id: string;
  created_at: string;
  updated_at: string;
}

interface ChatSummary {
  chat_id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get("userID");

    if (!userID) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch all chats for the user, ordered by most recent first
    const result = await db.query(
      `SELECT id, user_id, chat_id, created_at, updated_at 
       FROM chat_history 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [userID]
    );

    if (result.rows.length === 0) {
      return Response.json({
        chats: [],
        message: "No chats found for this user",
      });
    }

    return Response.json({
      conversations: JSON.stringify(result.rows),
    });
  } catch (error) {
    console.error("Error fetching chats:", error);

    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes("connection")) {
        return Response.json(
          { error: "Database connection error" },
          { status: 503 }
        );
      }
    }

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Optional: GET specific chat by chat_id
export async function POST(request: NextRequest) {
  try {
    const { userID, chatID } = await request.json();

    if (!userID || !chatID) {
      return Response.json(
        { error: "User ID and Chat ID are required" },
        { status: 400 }
      );
    }

    // Fetch specific chat
    const result = await db.query(
      `SELECT id, chat_history, user_id, chat_id, created_at, updated_at 
       FROM chat_history 
       WHERE user_id = $1 AND chat_id = $2`,
      [userID, chatID]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    const chat = result.rows[0];

    return Response.json({
      chat: {
        chat_id: chat.chat_id,
        messages: chat.chat_history || [],
        created_at: chat.created_at,
        updated_at: chat.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching specific chat:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");
    console.log("Delete request for chatId:", chatId);

    if (!chatId) {
      return Response.json({ error: "Chat ID is required" }, { status: 400 });
    }

    const result = await db.query(
      "DELETE FROM chat_history WHERE chat_id = $1 RETURNING *",
      [chatId]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { error: "No chat found with the provided ID" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "Chat deleted successfully",
        deletedChat: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting chat:", error);

    if (error instanceof Error && error.message.includes("connection")) {
      return Response.json(
        { error: "Database connection error" },
        { status: 503 }
      );
    }

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
