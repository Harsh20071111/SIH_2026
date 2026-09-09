import dns from "node:dns";
import mongoose from "mongoose";
import { loadEnv } from "./env";
import { logger } from "./logger";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if custom DNS servers cannot be set
}

loadEnv();

let isConnected = false;

const FALLBACK_ATLAS_URI =
  "mongodb+srv://Harsh__1111admin:Harsh2007@sih.9ut1ht1.mongodb.net/securedocs?retryWrites=true&w=majority&appName=SIH";

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  loadEnv();

  let uri = process.env["MONGODB_URI"] || FALLBACK_ATLAS_URI;

  // If the environment variable contains known defunct credentials, swap to verified credentials
  if (uri.includes("harshpanchal200011_db_user")) {
    logger.warn("Detected deprecated Atlas user in MONGODB_URI, falling back to verified credentials");
    uri = FALLBACK_ATLAS_URI;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    logger.info({ uri: uri.replace(/\/\/.*@/, "//<credentials>@") }, "MongoDB connected");
  } catch (err: any) {
    // If auth failed on custom URI, attempt fallback before crashing
    const isAuthError = err?.message?.includes("bad auth") || err?.code === 8000;
    if (isAuthError && uri !== FALLBACK_ATLAS_URI) {
      logger.warn({ err: err.message }, "Authentication failed with provided MONGODB_URI. Retrying with verified Atlas credentials...");
      try {
        await mongoose.connect(FALLBACK_ATLAS_URI);
        isConnected = true;
        logger.info("MongoDB connected successfully using verified Atlas credentials");
        return;
      } catch (fallbackErr) {
        logger.error({ err: fallbackErr }, "Fallback MongoDB connection also failed");
      }
    }

    logger.error({ err }, "MongoDB connection failed");
    throw err;
  }
}

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "MongoDB connection error");
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  logger.warn("MongoDB disconnected");
});

export { mongoose };
