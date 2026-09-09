import fs from "node:fs";
import path from "node:path";

let envLoaded = false;

export function loadEnv(): void {
  if (envLoaded) return;
  envLoaded = true;

  // If already set in environment, do not overwrite unless needed
  const candidatePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "artifacts/api-server/.env"),
    path.resolve(process.cwd(), "Hackathon-Merged/artifacts/api-server/.env"),
  ];

  if (typeof __dirname !== "undefined") {
    candidatePaths.push(path.resolve(__dirname, "../.env"));
    candidatePaths.push(path.resolve(__dirname, "../../.env"));
    candidatePaths.push(path.resolve(__dirname, ".env"));
  }

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      try {
        if (typeof process.loadEnvFile === "function") {
          process.loadEnvFile(envPath);
        }
        break;
      } catch {
        // Continue to next candidate if any error reading
      }
    }
  }
}

// Auto-run on import
loadEnv();
