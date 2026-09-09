import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/db";
import { initFirebase } from "./lib/firebase";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const rawPort = process.env["PORT"] || "5001";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Connect to MongoDB and initialize Firebase before starting the server
async function start() {
  try {
    await connectDB();
    initFirebase();

    const server = app.listen(port, () => {
      logger.info({ port }, "Server listening");
    });

    server.on("error", (err) => {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

start();

