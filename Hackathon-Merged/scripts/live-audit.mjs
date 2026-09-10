// Live Audit Log Streamer using Node.js
// Works with MongoDB Atlas or local MongoDB
import path from "path";
import fs from "fs";
import dns from "dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(__dirname, "../artifacts/api-server/package.json"));
const mongoose = require("mongoose");

// Default cloud URI (Atlas)
const ATLAS_URI = process.env.MONGODB_URI || "mongodb+srv://Harsh__1111admin:Harsh2007@sih.9ut1ht1.mongodb.net/securedocs?retryWrites=true&w=majority&appName=SIH";

// Check if user requested cloud/atlas or provided custom URI
const isCloudArg = process.argv.includes("--cloud") || process.argv.includes("--atlas") || process.env.USE_ATLAS === "true";

let mongoUri = ATLAS_URI;

if (!isCloudArg) {
  const envPath = path.resolve(__dirname, "../artifacts/api-server/.env");
  if (process.env.MONGODB_URI) {
    mongoUri = process.env.MONGODB_URI;
  } else if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/^MONGODB_URI=(.+)$/m);
    if (match && match[1]) {
      const val = match[1].trim();
      if (val.startsWith("mongodb")) mongoUri = val;
    }
  }
}

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const GRAY = "\x1b[90m";

function formatLog(log) {
  const time = new Date(log.timestamp).toLocaleTimeString();
  let tag = `[${log.action || "EVENT"}]`;
  let color = CYAN;

  const act = String(log.action || "");
  if (act.includes("LOGIN_SUCCESS") || act.includes("SUCCESS")) {
    tag = `[LOGIN SUCCESS]`;
    color = GREEN;
  } else if (act.includes("FAILED") || act.includes("DENIED") || act.includes("ALERT") || act.includes("BRUTE_FORCE")) {
    tag = `[ALERT / FAIL] `;
    color = RED;
  } else if (act.includes("LOGOUT")) {
    tag = `[LOGOUT]       `;
    color = YELLOW;
  } else if (act.includes("VIEW") || act.includes("READ")) {
    tag = `[ACCESS VIEW]  `;
    color = BLUE;
  } else if (act.includes("UPLOAD") || act.includes("CREATE")) {
    tag = `[CREATE/UPLOAD]`;
    color = MAGENTA;
  }

  const user = log.userName || log.userId || "System";
  const role = log.userRole ? `(${log.userRole})` : "";
  const ip = log.ipAddress ? ` | IP: ${log.ipAddress}` : "";
  const extra = log.documentId ? ` | Doc: ${log.documentId}` : (log.caseId ? ` | Case: ${log.caseId}` : "");
  const res = log.result ? ` | Result: ${log.result}` : "";
  const hashInfo = log.eventHash ? `\n    ${GRAY}↳ Chain Hash: ${log.eventHash.slice(0, 8)}...${log.eventHash.slice(-8)} (Prev: ${log.previousHash ? log.previousHash.slice(0, 8) + "..." : "genesis"})${RESET}` : "";

  return `${GRAY}[${time}]${RESET} ${BOLD}${color}${tag}${RESET} ${BOLD}${user}${RESET} ${role}${extra}${ip}${res}${hashInfo}`;
}

console.log(`\n${BOLD}${CYAN}==============================================================${RESET}`);
console.log(`${BOLD} 🔴 LIVE AUDIT LOG STREAM - SECUREDOCS${RESET}`);
console.log(` Connected to: ${mongoUri.replace(/:[^:@]+@/, ":****@")}`);
console.log(` Streaming live events... ${GRAY}(Press Ctrl+C to stop)${RESET}`);
console.log(`${BOLD}${CYAN}==============================================================${RESET}\n`);

async function run() {
  await mongoose.connect(mongoUri);
  const auditCollection = mongoose.connection.db.collection("auditlogs");

  // Fetch last 5 records
  const initialLogs = await auditCollection.find().sort({ timestamp: -1 }).limit(5).toArray();
  let lastTime = new Date();

  if (initialLogs.length > 0) {
    console.log(`${GRAY}--- Recent Activity ---${RESET}`);
    initialLogs.reverse().forEach((l) => {
      console.log(formatLog(l));
      const t = new Date(l.timestamp);
      if (t > lastTime) lastTime = t;
    });
    console.log(`${GRAY}--- Watching for new live events... ---${RESET}\n`);
  }

  const securityCollection = mongoose.connection.db.collection("securityevents");
  let lastSecTime = new Date();

  setInterval(async () => {
    try {
      const newLogs = await auditCollection
        .find({ timestamp: { $gt: lastTime } })
        .sort({ timestamp: 1 })
        .toArray();

      for (const l of newLogs) {
        console.log(formatLog(l));
        const t = new Date(l.timestamp);
        if (t > lastTime) lastTime = t;
      }

      const newSec = await securityCollection
        .find({ timestamp: { $gt: lastSecTime } })
        .sort({ timestamp: 1 })
        .toArray();

      for (const s of newSec) {
        const time = new Date(s.timestamp).toLocaleTimeString();
        console.log(`\n${RED}${BOLD}🚨 [SECURITY EVENT TRIGGERED]${RESET} ${BOLD}${s.type}${RESET} (Risk: ${s.riskScore}/100 - ${s.riskLevel})`);
        console.log(`   Action: ${s.action} | User: ${s.userName || "Unknown"} | Rules: ${(s.triggeredRules || []).join(", ")}\n`);
        const t = new Date(s.timestamp);
        if (t > lastSecTime) lastSecTime = t;
      }
    } catch (e) {
      // ignore transient poll error
    }
  }, 1000);
}

run().catch((err) => {
  console.error("Failed to stream audit logs:", err.message);
  process.exit(1);
});
