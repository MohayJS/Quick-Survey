import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv"; // Only needed for Node.js, not Next.js

dotenv.config(); // Load environment variables (Only needed for Node.js)

const remoteUri = process.env.MONGODB_URI || "";
const localUri = process.env.MONGODB_LOCALURI || "";
let client = new MongoClient(remoteUri);
let db: Db;

export async function connectToDatabase() {
  if (!db) {
    try {
      console.log("Attempting to connect to remote MongoDB...");
      await client.connect();
      db = client.db(); // Use the database specified in the URI
      console.log("Connected to remote MongoDB ✅");
    } catch (error) {
      console.error("Failed to connect to remote MongoDB ❌", error);
      console.log("Attempting to connect to local MongoDB...");

      try {
        client = new MongoClient(localUri);
        await client.connect();
        db = client.db(); // Use the database specified in the URI
        console.log("Connected to local MongoDB ✅");
      } catch (localError) {
        console.error("Failed to connect to local MongoDB ❌", localError);
        throw new Error("No available MongoDB connection");
      }
    }
  }
  return db;
}
