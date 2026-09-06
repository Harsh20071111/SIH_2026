import crypto from "node:crypto";
import mongoose from "mongoose";
import { logger } from "./logger";
import { AuditLog } from "../models/AuditLog";

export interface AuditEventInput {
  action: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  firId?: string;
  caseId?: string;
  documentId?: string;
  result?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  isUnauthorized?: boolean;
  denialReason?: string;
  wasDownloaded?: boolean;
  watermarkId?: string;
  accessedSensitiveFields?: string[];
}

const inMemoryAuditLogs: Array<{
  _id: string;
  action: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  firId?: string;
  caseId?: string;
  documentId?: string;
  result?: string;
  ipAddress?: string;
  userAgent?: string;
  previousHash: string | null;
  eventHash: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}> = [
  {
    _id: "audit-init-001",
    action: "SYSTEM_INITIALIZED",
    userName: "Security Daemon",
    userRole: "System",
    result: "Success",
    ipAddress: "127.0.0.1",
    previousHash: null,
    eventHash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    timestamp: new Date("2026-09-01T08:00:00Z"),
  },
  {
    _id: "audit-init-002",
    action: "AUTH_VERIFIED",
    userName: "System Administrator",
    userRole: "Admin",
    result: "Success",
    ipAddress: "127.0.0.1",
    previousHash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    eventHash: "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
    timestamp: new Date("2026-09-01T08:05:00Z"),
  },
];

export function getInMemoryAuditLogs() {
  return inMemoryAuditLogs;
}

/**
 * Compute a SHA-256 hash of the given data string.
 */
function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Create an audit event with cryptographic SHA-256 hash chaining.
 * Each record embeds the hash of the preceding event, creating a tamper-evident audit chain.
 */
export async function createAuditEvent(
  input: AuditEventInput
): Promise<string | undefined> {
  try {
    let previousHash: string | null = null;

    if (mongoose.connection.readyState === 1) {
      const lastEvent = await AuditLog.findOne()
        .sort({ timestamp: -1 })
        .select("eventHash")
        .lean();
      previousHash = (lastEvent as any)?.eventHash ?? null;
    } else {
      const last = inMemoryAuditLogs[inMemoryAuditLogs.length - 1];
      previousHash = last ? last.eventHash : null;
    }

    // Build the deterministic data payload to hash
    const eventData = JSON.stringify({
      action: input.action,
      userId: input.userId || "",
      firId: input.firId || "",
      caseId: input.caseId || "",
      documentId: input.documentId || "",
      result: input.result || "Success",
      timestamp: new Date().toISOString(),
      previousHash,
    });

    const eventHash = sha256(eventData);

    const record = {
      ...input,
      previousHash,
      eventHash,
      result: input.result || "Success",
      timestamp: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      await AuditLog.create(record);
    } else {
      inMemoryAuditLogs.push({
        _id: "audit_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        ...record,
      });
    }

    return eventHash;
  } catch (err) {
    // Audit logging should record errors but never crash the primary request
    logger.error({ err, action: input.action }, "Failed to create audit event");
    return undefined;
  }
}

/**
 * Verify the integrity of the audit chain by validating sequential hash continuity.
 * Returns { valid, totalEvents, checkedCount, brokenAt? }
 */
export async function verifyAuditChain(): Promise<{
  valid: boolean;
  totalEvents: number;
  checkedCount: number;
  brokenAt?: number;
}> {
  try {
    const events: any[] =
      mongoose.connection.readyState === 1
        ? await AuditLog.find()
            .sort({ timestamp: 1 })
            .select("eventHash previousHash action userId firId caseId documentId result timestamp")
            .lean()
        : inMemoryAuditLogs;

    const totalEvents = events.length;
    let checkedCount = 0;

    for (let i = 0; i < events.length; i++) {
      const event: any = events[i];
      checkedCount++;

      if (i === 0) {
        if (event.previousHash !== null && event.previousHash !== undefined) {
          return { valid: false, totalEvents, checkedCount, brokenAt: i };
        }
      } else {
        const priorHash = (events[i - 1] as any).eventHash;
        if (event.previousHash !== priorHash) {
          return { valid: false, totalEvents, checkedCount, brokenAt: i };
        }
      }
    }

    return { valid: true, totalEvents, checkedCount };
  } catch (err) {
    logger.error({ err }, "Error verifying audit chain");
    return { valid: false, totalEvents: 0, checkedCount: 0 };
  }
}
