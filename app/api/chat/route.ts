import type { NextRequest } from "next/server"
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";
import db from "@/lib/db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, generateImage, chatID, userID, messages } = await request.json()

    // Validate required inputs
    if (!message || typeof message !== 'string') {
      return Response.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    if (!userID) {
      return Response.json({ error: "User ID is required" }, { status: 400 })
    }

    let responseText: string = ""
    let imageUrl: string | undefined

    if (generateImage) {
      const contents = message;

      // Set responseModalities to include "Image" so the model can generate an image
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      // Add null checks for response.candidates
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No candidates returned from Gemini")
      }

      const candidate = response.candidates[0];
      if (!candidate || !candidate.content || !candidate.content.parts) {
        throw new Error("Invalid response structure from Gemini")
      }

      for (const part of candidate.content.parts) {
        // Based on the part type, either show the text or save the image
        if (part.text) {
          console.log(part.text);
          responseText = part.text;
        } else if (part.inlineData?.data) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          
          // Generate unique filename with timestamp
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const filename = `gemini-image-${timestamp}-${randomId}.png`;
          const filepath = `public/images/${filename}`;
          
          // Ensure the public/images directory exists
          const dir = 'public/images';
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(filepath, buffer);
          console.log(`Image saved as ${filepath}`);
          // Set imageUrl to the accessible public path
          imageUrl = `/images/${filename}`;
        }
      }
    } else {
      // Use Gemini for text generation
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: message,
      });
      
      const generatedText = result.text;
      
      if (!generatedText) {
        throw new Error("No response generated from Gemini")
      }
      
      responseText = generatedText;
    }

    // Create the assistant message
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: responseText,
      imageUrl,
    };

    // Update chat history with the new assistant message
    const updatedMessages = [...(messages || []), assistantMessage];
    
    // Generate chat_id if not provided
    const finalChatId = chatID

    try {
      // Check if chat_id already exists for this user
      const existingChat = await db.query(
        'SELECT id FROM chat_history WHERE chat_id = $1 AND user_id = $2',
        [finalChatId, userID]
      );

      if (existingChat.rows.length > 0) {
        // Update existing chat history
        await db.query(
          `UPDATE chat_history 
           SET chat_history = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE chat_id = $2 AND user_id = $3`,
          [JSON.stringify(updatedMessages), finalChatId, userID]
        );
        console.log(`Updated chat history for chat_id: ${finalChatId}`);
      } else {
        // Insert new chat history
        await db.query(
          `INSERT INTO chat_history (chat_history, user_id, chat_id, created_at, updated_at) 
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [JSON.stringify(updatedMessages), userID, finalChatId]
        );
        console.log(`Created new chat history for chat_id: ${finalChatId}`);
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Don't fail the API call if database save fails, but log the error
      console.warn("Failed to save chat history to database, but continuing with response");
    }

    return Response.json({
      responseText,
      imageUrl,
      chatId: finalChatId, // Return the chat_id so frontend can use it
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return Response.json({ error: "Invalid API key configuration" }, { status: 401 })
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return Response.json({ error: "API quota exceeded" }, { status: 429 })
      }
    }

    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}



// import { GoogleGenerativeAI } from "@google/generative-ai"
// import type { NextRequest } from "next/server"

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// export async function POST(request: NextRequest) {
//   try {
//     const { message, generateImage } = await request.json()

//     // Validate required inputs
//     if (!message || typeof message !== 'string') {
//       return Response.json({ error: "Message is required and must be a string" }, { status: 400 })
//     }

//     let response: string
//     let imageUrl: string | undefined

//     if (generateImage) {
//       // Use Gemini for image description
//       const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
//       const imagePrompt = Create a detailed description for an image based on: ${message}. Make it vivid and artistic.
      
//       const result = await model.generateContent(imagePrompt)
//       const responseText = result.response.text()
      
//       if (!responseText) {
//         throw new Error("No response generated from Gemini")
//       }
      
//       response = responseText

//       // Generate a more descriptive placeholder image URL
//       const imageQuery = encodeURIComponent(message.substring(0, 50).replace(/\s+/g, '+'))
//       imageUrl = https://via.placeholder.com/512x512/19c37d/ffffff?text=${imageQuery}
//     } else {
//       // Use Gemini for text generation
//       const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
//       const result = await model.generateContent(message)
//       const responseText = result.response.text()
      
//       if (!responseText) {
//         throw new Error("No response generated from Gemini")
//       }
      
//       response = responseText
//     }

//     return Response.json({
//       response,
//       imageUrl,
//     })
//   } catch (error) {
//     console.error("Chat API error:", error)
    
//     // More specific error handling
//     if (error instanceof Error) {
//       if (error.message.includes('API key')) {
//         return Response.json({ error: "Invalid API key configuration" }, { status: 401 })
//       }
//       if (error.message.includes('quota') || error.message.includes('limit')) {
//         return Response.json({ error: "API quota exceeded" }, { status: 429 })
//       }
//     }
    
//     return Response.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
