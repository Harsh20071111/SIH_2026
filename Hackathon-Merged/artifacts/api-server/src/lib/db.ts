import mongoose from "mongoose";
import { loadEnv } from "./env";
import { logger } from "./logger";

loadEnv();

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  loadEnv();

  const uri = process.env["MONGODB_URI"] || "mongodb://localhost:27017/securedocs";

  try {
    await mongoose.connect(uri);
    isConnected = true;
    logger.info({ uri: uri.replace(/\/\/.*@/, "//<credentials>@") }, "MongoDB connected");
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
