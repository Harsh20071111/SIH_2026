import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "./logger";

// Configure DNS servers for Atlas SRV lookup to prevent querySrv ECONNREFUSED on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if custom DNS servers cannot be set
}

// Ensure .env is loaded regardless of process cwd or monorepo nesting
export function loadEnv(): void {
  const candidatePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "artifacts", "api-server", ".env"),
    path.resolve(process.cwd(), "..", ".env"),
    path.resolve(import.meta.dirname, "..", ".env"),
    path.resolve(import.meta.dirname, "..", "..", ".env"),
    path.resolve(import.meta.dirname, "..", "..", "..", ".env"),
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  }
}

// Load env immediately on module evaluation
loadEnv();

export function getMongoUri(): string | undefined {
  loadEnv();
  return process.env["MONGODB_URI"];
}

// Fallback helper for Windows when querySrv fails on MongoDB Atlas cluster
function buildStandardAtlasUri(srvUri: string): string | null {
  const match = srvUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@sih\.9ut1ht1\.mongodb\.net\/([^?]+)(\?.+)?/);
  if (!match) return null;
  const [, user, pass, db] = match;
  return `mongodb://${user}:${pass}@ac-rko8xez-shard-00-00.9ut1ht1.mongodb.net:27017,ac-rko8xez-shard-00-01.9ut1ht1.mongodb.net:27017,ac-rko8xez-shard-00-02.9ut1ht1.mongodb.net:27017/${db}?ssl=true&replicaSet=atlas-cdum6e-shard-0&authSource=admin&retryWrites=true&w=majority`;
}

let isConnecting = false;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) return;

  const uri = getMongoUri();
  if (!uri) {
    logger.warn("MONGODB_URI is not defined in environment variables. Database operations will fail.");
    return;
  }

  isConnecting = true;
  const maskedUri = uri.replace(/\/\/.*@/, "//<credentials>@");
  logger.info({ uri: maskedUri }, "Connecting to MongoDB Atlas...");

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    logger.info({ uri: maskedUri }, "MongoDB Atlas connected successfully");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Fallback if Windows DNS c-ares querySrv failed
    const standardUri = buildStandardAtlasUri(uri);
    if (standardUri && errorMsg.includes("querySrv")) {
      logger.warn("SRV lookup failed on Windows (querySrv); retrying with standard replica set seed list...");
      try {
        await mongoose.connect(standardUri, { serverSelectionTimeoutMS: 5000 });
        logger.info({ uri: maskedUri }, "MongoDB Atlas connected successfully via replica set seed list");
        isConnecting = false;
        return;
      } catch (retryErr: unknown) {
        const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        logger.error({ err: retryMsg }, "MongoDB Atlas connection failed with replica set seed list");
      }
    } else {
      logger.error({ err: errorMsg }, "MongoDB Atlas connection failed");
    }
  } finally {
    isConnecting = false;
  }
}

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  logger.error({ err: err.message }, "MongoDB connection error");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

export { mongoose };
