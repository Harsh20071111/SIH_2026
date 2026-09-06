import express from "express";
import cors from "cors";
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import casesRouter from "./routes/cases.js";
import documentsRouter from "./routes/documents.js";

// Load .env from multiple candidate paths
const candidateEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "Hackathon-Merged", "artifacts", "api-server", ".env"),
  path.resolve(process.cwd(), "artifacts", "api-server", ".env"),
  path.resolve(process.cwd(), "..", ".env"),
];
for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

// Configure DNS servers for Atlas SRV lookup to prevent querySrv ECONNREFUSED on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if custom DNS servers cannot be set
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Mount Case and Document routes
app.use("/api/cases", casesRouter);
app.use("/api/documents", documentsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

export async function startServer() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      const maskedUri = uri.replace(/\/\/.*@/, "//<credentials>@");
      console.log(`Connecting to MongoDB Atlas... (${maskedUri})`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected to MongoDB Atlas");
    } catch (err) {
      console.warn("MongoDB connection warning:", err.message);
    }
  } else {
    console.warn("MONGODB_URI environment variable not set.");
  }

  return app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

// Start if executed directly
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, "/")) {
  startServer();
}

export default app;
