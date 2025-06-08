// lib/db.ts
import { Pool } from "pg";

const db = new Pool({
  connectionString: process.env.DATBASE_URL,
  ssl: {
    rejectUnauthorized: false, // For Supabase or other managed DBs
  },
});

// Optional: Immediately test connection
(async () => {
  try {
    const client = await db.connect();
    console.log("✅ Connected to PostgreSQL database");
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err);
  }
})();

export default db;
