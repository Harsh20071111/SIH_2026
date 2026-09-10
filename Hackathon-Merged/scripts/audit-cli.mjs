#!/usr/bin/env node
/**
 * SecureDocs Terminal CLI: Hash-Chained Audit Trail & Security Event Monitor
 * Usage:
 *   node scripts/audit-cli.mjs           # View chain integrity, audit logs, and security events
 *   node scripts/audit-cli.mjs --verify  # Run only chain verification
 *   node scripts/audit-cli.mjs --live    # Live watch mode
 */

import path from "path";
import fs from "fs";
import dns from "dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(__dirname, "../artifacts/api-server/package.json"));
const mongoose = require("mongoose");

// Colors & formatting
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const GRAY = "\x1b[90m";
const BG_RED = "\x1b[41m\x1b[37m";
const BG_GREEN = "\x1b[42m\x1b[30m";

// Resolve Mongo URI
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  const envPath = path.resolve(__dirname, "../artifacts/api-server/.env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/^MONGODB_URI=(.+)$/m);
    if (match && match[1]) {
      const val = match[1].trim();
      if (val.startsWith("mongodb")) mongoUri = val;
    }
  }
}
if (!mongoUri) {
  mongoUri = "mongodb+srv://Harsh__1111admin:Harsh2007@sih.9ut1ht1.mongodb.net/securedocs?retryWrites=true&w=majority&appName=SIH";
}

function truncateHash(hash) {
  if (!hash) return `${GRAY}(genesis block - null)${RESET}`;
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

function renderRiskBar(score) {
  const filled = Math.min(10, Math.max(0, Math.round(score / 10)));
  const empty = 10 - filled;
  let color = GREEN;
  if (score >= 75) color = RED;
  else if (score >= 40) color = YELLOW;

  return `${color}[${"█".repeat(filled)}${"░".repeat(empty)}] ${score}/100${RESET}`;
}

async function verifyChain(auditCollection) {
  const events = await auditCollection.find().sort({ timestamp: 1 }).toArray();
  const total = events.length;
  let brokenAt = null;

  for (let i = 0; i < total; i++) {
    const current = events[i];
    if (i === 0) {
      if (current.previousHash !== null && current.previousHash !== undefined && current.previousHash !== "") {
        brokenAt = 0;
        break;
      }
    } else {
      const prev = events[i - 1];
      if (current.previousHash !== prev.eventHash) {
        brokenAt = i;
        break;
      }
    }
  }

  return { valid: brokenAt === null, total, brokenAt };
}

async function showAuditStatus() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const auditCollection = db.collection("auditlogs");
  const securityCollection = db.collection("securityevents");

  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║     SECUREDOCS — TAMPER-EVIDENT HASH CHAIN & SECURITY MONITOR            ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${RESET}`);

  // 1. VERIFY CHAIN
  console.log(`\n${BOLD}1. 🛡️  AUDIT CHAIN VERIFICATION${RESET}`);
  console.log(`${GRAY}──────────────────────────────────────────────────────────────────────────${RESET}`);
  const verifyResult = await verifyChain(auditCollection);
  if (verifyResult.valid) {
    console.log(`  ${BG_GREEN}${BOLD} ✅ CHAIN VALID ${RESET} ${GREEN}All ${verifyResult.total} audit events are cryptographically intact.${RESET}`);
    console.log(`  ${DIM}Every event's previousHash matches the preceding event's eventHash.${RESET}`);
  } else {
    console.log(`  ${BG_RED}${BOLD} ⚠️ CHAIN VERIFICATION FAILED ${RESET} ${RED}Tampering detected at record index #${verifyResult.brokenAt}!${RESET}`);
    console.log(`  ${RED}The previousHash does not match the prior event's eventHash.${RESET}`);
  }

  // 2. RECENT HASH-CHAINED LOGS
  console.log(`\n${BOLD}2. 🔗 RECENT HASH-CHAINED AUDIT EVENTS (Latest 5)${RESET}`);
  console.log(`${GRAY}──────────────────────────────────────────────────────────────────────────${RESET}`);
  const recentLogs = await auditCollection.find().sort({ timestamp: -1 }).limit(5).toArray();

  if (recentLogs.length === 0) {
    console.log(`  ${GRAY}No audit logs recorded yet.${RESET}`);
  } else {
    // Show in chronological order for chain visualization
    const chronological = [...recentLogs].reverse();
    chronological.forEach((log, index) => {
      const time = new Date(log.timestamp).toLocaleString();
      const user = log.userName || log.userId || "System";
      const action = log.action || "UNKNOWN";
      const ip = log.ipAddress || "127.0.0.1";
      const result = log.result || "Success";

      let actionColor = CYAN;
      if (action.includes("FAILED") || action.includes("UNAUTHORIZED")) actionColor = RED;
      else if (action.includes("LOGIN_SUCCESS")) actionColor = GREEN;
      else if (action.includes("CREATE") || action.includes("UPLOAD")) actionColor = MAGENTA;

      console.log(`  ${BOLD}┌── [Event #${verifyResult.total - chronological.length + 1 + index}] ${time}${RESET}`);
      console.log(`  │   ${BOLD}Action:${RESET}     ${actionColor}${action}${RESET} (${result})`);
      console.log(`  │   ${BOLD}User:${RESET}       ${user} ${GRAY}${log.userRole ? `[${log.userRole}]` : ""}${RESET}`);
      console.log(`  │   ${BOLD}IP/Agent:${RESET}   ${ip} ${GRAY}(${(log.userAgent || "Unknown").slice(0, 40)})${RESET}`);
      console.log(`  │   ${BOLD}Prev Hash:${RESET}  ${YELLOW}${truncateHash(log.previousHash)}${RESET}`);
      console.log(`  │       ↓`);
      console.log(`  │   ${BOLD}Event Hash:${RESET} ${GREEN}${truncateHash(log.eventHash)}${RESET}`);
      console.log(`  └── ${GRAY}• Tamper-Evident SHA-256 Link${RESET}\n`);
    });
  }

  // 3. SECURITY EVENT MONITORING
  console.log(`${BOLD}3. 🚨 SECURITY EVENT MONITORING & RISK SCORING (Latest 5)${RESET}`);
  console.log(`${GRAY}──────────────────────────────────────────────────────────────────────────${RESET}`);
  const recentSec = await securityCollection.find().sort({ timestamp: -1 }).limit(5).toArray();

  if (recentSec.length === 0) {
    console.log(`  ${GREEN}No active security incidents or elevated risk events.${RESET}`);
  } else {
    recentSec.forEach((sec, idx) => {
      const time = new Date(sec.timestamp).toLocaleString();
      const levelColor = sec.riskLevel === "CRITICAL" || sec.riskLevel === "HIGH" ? RED : sec.riskLevel === "MEDIUM" ? YELLOW : GREEN;
      const rules = sec.triggeredRules && sec.triggeredRules.length > 0 ? sec.triggeredRules.join(", ") : "None";

      console.log(`  ${BOLD}[#${idx + 1}] ${sec.type}${RESET} ${GRAY}(${time})${RESET}`);
      console.log(`      ${BOLD}Action:${RESET}          ${sec.action}`);
      console.log(`      ${BOLD}User / Target:${RESET}   ${sec.userName || sec.userId || "Unknown"} | IP: ${sec.ipAddress || "N/A"}`);
      console.log(`      ${BOLD}Risk Level:${RESET}      ${levelColor}${sec.riskLevel}${RESET}  ${renderRiskBar(sec.riskScore || 0)}`);
      console.log(`      ${BOLD}Triggered Rules:${RESET} ${YELLOW}${rules}${RESET}`);
      console.log(`      ${BOLD}Status:${RESET}          ${sec.status || "Monitoring"}\n`);
    });
  }

  console.log(`${BOLD}${CYAN}──────────────────────────────────────────────────────────────────────────${RESET}`);
  console.log(`${GRAY}💡 To stream live in real-time:${RESET}  ${BOLD}npm run watch:audit:live${RESET}`);
  console.log(`${GRAY}💡 In Browser Dashboard:${RESET}        ${BOLD}http://localhost:3000/audit-chain-verify${RESET}\n`);

  await mongoose.disconnect();
}

async function runLiveWatch() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const auditCollection = db.collection("auditlogs");
  const securityCollection = db.collection("securityevents");

  console.log(`\n${BOLD}${CYAN}🔴 SECUREDOCS — LIVE TERMINAL AUDIT & SECURITY STREAMER${RESET}`);
  console.log(`Connected to Database. Listening for real-time events...`);
  console.log(`${GRAY}Press Ctrl+C to stop.${RESET}\n`);

  let lastAuditTime = new Date();
  let lastSecTime = new Date();

  setInterval(async () => {
    try {
      const newAudits = await auditCollection.find({ timestamp: { $gt: lastAuditTime } }).sort({ timestamp: 1 }).toArray();
      for (const log of newAudits) {
        const time = new Date(log.timestamp).toLocaleTimeString();
        console.log(`${GRAY}[${time}]${RESET} ${GREEN}[AUDIT CHAIN]${RESET} ${BOLD}${log.action}${RESET} by ${log.userName || "Unknown"} | Hash: ${truncateHash(log.eventHash)}`);
        const t = new Date(log.timestamp);
        if (t > lastAuditTime) lastAuditTime = t;
      }

      const newSec = await securityCollection.find({ timestamp: { $gt: lastSecTime } }).sort({ timestamp: 1 }).toArray();
      for (const sec of newSec) {
        const time = new Date(sec.timestamp).toLocaleTimeString();
        console.log(`${GRAY}[${time}]${RESET} ${RED}[SECURITY ALERT]${RESET} ${BOLD}${sec.type}${RESET} (${sec.riskLevel}, Score: ${sec.riskScore}) | ${sec.action}`);
        const t = new Date(sec.timestamp);
        if (t > lastSecTime) lastSecTime = t;
      }
    } catch (e) {
      // transient error ignore
    }
  }, 1000);
}

const args = process.argv.slice(2);
if (args.includes("--live") || args.includes("-w")) {
  runLiveWatch().catch(err => {
    console.error("Live watch error:", err.message);
    process.exit(1);
  });
} else {
  showAuditStatus().catch(err => {
    console.error("Failed to read audit status:", err.message);
    process.exit(1);
  });
}
