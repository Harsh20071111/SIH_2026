import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI =
  process.env["MONGODB_URI"] ||
  "mongodb+srv://harshpanchal200011_db_user:xVN3cfRbKmNSIOWA@sih.9ut1ht1.mongodb.net/securedocs?retryWrites=true&w=majority";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    logger.info({ uri: MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@") }, "MongoDB connected");
  } catch (err) {
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
