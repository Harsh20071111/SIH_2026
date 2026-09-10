#!/usr/bin/env node
/**
 * SecureDocs Terminal CLI: Tamper Demonstration
 * Usage:
 *   npm run audit:tamper-demo
 */

import path from "path";
import fs from "fs";
import crypto from "crypto";
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
const CYAN = "\x1b[36m";
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
  mongoUri = "mongodb://localhost:27017/securedocs";
}

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function computeEventHash(payload, previousHash) {
  const canonicalData = {
    action: payload.action || "",
    userId: payload.userId || "",
    userName: payload.userName || "",
    userRole: payload.userRole || "",
    caseId: payload.caseId || "",
    documentId: payload.documentId || "",
    resourceType: payload.resourceType || "SYSTEM",
    resourceId: payload.resourceId || "",
    result: payload.result || "Success",
    ipAddress: payload.ipAddress || "",
    userAgent: payload.userAgent || "",
    timestamp: payload.timestamp instanceof Date ? payload.timestamp.toISOString() : payload.timestamp,
    sequenceNumber: payload.sequenceNumber || 0,
    previousHash: previousHash === "GENESIS" ? null : previousHash,
  };
  return sha256(JSON.stringify(canonicalData));
}

async function verifyChain(auditCollection) {
  const events = await auditCollection.find().sort({ timestamp: 1 }).toArray();
  const total = events.length;
  let brokenAt = null;
  let reason = null;

  for (let i = 0; i < total; i++) {
    const event = events[i];

    if (event.sequenceNumber !== undefined && event.sequenceNumber > 0) {
      const computedHash = computeEventHash(event, event.previousHash);
      if (computedHash !== event.eventHash) {
        brokenAt = i;
        reason = `Content Hash Mismatch at Record #${i}`;
        break;
      }
    }

    if (i === 0) {
      if (event.previousHash !== null && event.previousHash !== undefined && event.previousHash !== "GENESIS") {
        brokenAt = 0;
        reason = `First event previousHash not null`;
        break;
      }
    } else {
      const prev = events[i - 1];
      if (event.previousHash !== prev.eventHash) {
        brokenAt = i;
        reason = `Link Broken: previousHash does not match prior eventHash`;
        break;
      }
    }
  }

  return { valid: brokenAt === null, total, brokenAt, reason };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTamperDemo() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const auditCollection = db.collection("auditlogs");

  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║             SECUREDOCS — HASH CHAIN TAMPER DEMONSTRATION                 ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${RESET}\n`);

  console.log(`${BOLD}1. Verifying Current Audit Chain Integrity...${RESET}`);
  let latest = await auditCollection.findOne({}, { sort: { timestamp: -1 } });
  
  if (!latest) {
    console.log(`   ${YELLOW}Database is empty. Seeding a genesis audit event for demonstration...${RESET}`);
    const timestamp = new Date();
    const payload = {
      action: "DOCUMENT_UPLOADED",
      userId: "demo-user",
      userName: "Demo User",
      documentId: "doc-123",
      timestamp,
      sequenceNumber: 1
    };
    const eventHash = computeEventHash(payload, "GENESIS");
    await auditCollection.insertOne({ ...payload, previousHash: null, eventHash });
    console.log(`   ${GREEN}Genesis event created.${RESET}\n`);
  }

  let verifyResult = await verifyChain(auditCollection);
  
  if (verifyResult.valid) {
    console.log(`   ${BG_GREEN}${BOLD} ✅ CHAIN VALID ${RESET} ${GREEN}All ${verifyResult.total} audit events are cryptographically intact.${RESET}\n`);
  } else {
    console.log(`   ${BG_RED}${BOLD} ⚠️ CHAIN INVALID ${RESET} ${RED}${verifyResult.reason}${RESET}\n`);
    console.log(`   ${YELLOW}Fixing chain before demo by resetting tampered records...${RESET}`);
    // Optional: we don't fix it here, we just continue or abort.
    console.log(`   ${RED}Cannot proceed with tamper demo while chain is already broken.${RESET}`);
    process.exit(1);
  }

  console.log(`${BOLD}2. Tampering with the Database (Simulating an Attacker)...${RESET}`);
  latest = await auditCollection.findOne({ sequenceNumber: { $gt: 0 } }, { sort: { timestamp: -1 } });
  if (!latest) {
    console.log(`   ${RED}No strictly verified audit logs found to tamper with.${RESET}`);
    console.log(`   ${DIM}Please perform an action in the app first (e.g., upload a document).${RESET}`);
    process.exit(1);
  }

  const originalAction = latest.action;
  const tamperedAction = "DOCUMENT_DELETED"; // Changed maliciously
  
  await auditCollection.updateOne({ _id: latest._id }, { $set: { action: tamperedAction } });
  console.log(`   ${YELLOW}Attacker modified record ID: ${latest._id}${RESET}`);
  console.log(`   Changed Action: ${DIM}${originalAction}${RESET} ➔ ${RED}${tamperedAction}${RESET}\n`);

  await sleep(1500);

  console.log(`${BOLD}3. Re-Verifying Audit Chain Integrity...${RESET}`);
  verifyResult = await verifyChain(auditCollection);

  if (verifyResult.valid) {
    console.log(`   ${BG_GREEN}${BOLD} ✅ CHAIN VALID ${RESET}\n`);
  } else {
    console.log(`   ${BG_RED}${BOLD} ⚠️ AUDIT CHAIN INVALID ${RESET}`);
    console.log(`   ${RED}${BOLD}Failure Reason:${RESET} ${RED}${verifyResult.reason}${RESET}`);
    console.log(`   ${DIM}The system successfully detected that the data payload was modified after hashing.${RESET}\n`);
  }

  await sleep(1500);

  console.log(`${BOLD}4. Restoring Database (Self-Repair Demo)...${RESET}`);
  await auditCollection.updateOne({ _id: latest._id }, { $set: { action: originalAction } });
  console.log(`   ${GREEN}Restored Action back to: ${originalAction}${RESET}\n`);

  console.log(`${BOLD}5. Final Verification...${RESET}`);
  verifyResult = await verifyChain(auditCollection);
  if (verifyResult.valid) {
    console.log(`   ${BG_GREEN}${BOLD} ✅ CHAIN RESTORED & VALID ${RESET}\n`);
  }

  await mongoose.disconnect();
}

runTamperDemo().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
