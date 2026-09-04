import crypto from "crypto";
import { logger } from "./logger";

// We import the model lazily to avoid circular dependencies
let AuditLogModel: any = null;

async function getAuditLogModel() {
  if (!AuditLogModel) {
    AuditLogModel = (await import("../models/AuditLog")).AuditLog;
  }
  return AuditLogModel;
}

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CASE_CREATED"
  | "CASE_VIEWED"
  | "CASE_UPDATED"
  | "CASE_ARCHIVED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_VIEWED"
  | "DOCUMENT_DOWNLOADED"
  | "DOCUMENT_UPDATED"
  | "DOCUMENT_SHARED"
  | "DOCUMENT_APPROVED"
  | "DOCUMENT_REJECTED"
  | "DOCUMENT_FLAGGED"
  | "INTEGRITY_VERIFIED"
  | "INTEGRITY_ISSUE_DETECTED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DEACTIVATED"
  | "REVIEW_SUBMITTED"
  | "REVIEW_APPROVED"
  | "REVIEW_REJECTED"
  | "REVIEW_FLAGGED";

export interface AuditEventInput {
  action: AuditAction;
  userId?: string;
  userName?: string;
  userRole?: string;
  caseId?: string;
  documentId?: string;
  result?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Compute a SHA-256 hash of the given data string.
 */
function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Create a tamper-evident audit log entry.
 *
 * Each event stores:
 * - eventHash: SHA-256 of the event data + previousHash
 * - previousHash: eventHash of the most recent prior event (null for first)
 *
 * This creates a hash chain where modifying any past event would
 * break the chain from that point forward, making unauthorized
 * changes detectable (though not mathematically impossible).
 */
export async function createAuditEvent(
  input: AuditEventInput
): Promise<void> {
  try {
    const AuditLogDoc = await getAuditLogModel();

    // Get the most recent audit event's hash to chain from
    const lastEvent = await AuditLogDoc.findOne()
      .sort({ timestamp: -1 })
      .select("eventHash")
      .lean();

    const previousHash: string | null = lastEvent?.eventHash ?? null;

    // Build the data payload to hash
    const eventData = JSON.stringify({
      action: input.action,
      userId: input.userId,
      caseId: input.caseId,
      documentId: input.documentId,
      result: input.result,
      timestamp: new Date().toISOString(),
      previousHash,
    });

    const eventHash = sha256(eventData);

    await AuditLogDoc.create({
      ...input,
      previousHash,
      eventHash,
      timestamp: new Date(),
    });
  } catch (err) {
    // Audit logging should never crash the main operation
    logger.error({ err, action: input.action }, "Failed to create audit event");
  }
}

/**
 * Verify the integrity of the audit chain.
 * Returns { valid, totalEvents, checkedEvents, brokenAt? }
 */
export async function verifyAuditChain(): Promise<{
  valid: boolean;
  totalEvents: number;
  checkedEvents: number;
  brokenAt?: number;
}> {
  const AuditLogDoc = await getAuditLogModel();

  const events = await AuditLogDoc.find()
    .sort({ timestamp: 1 })
    .select("eventHash previousHash action userId caseId documentId result timestamp")
    .lean();

  const totalEvents = events.length;
  let checkedEvents = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    checkedEvents++;

    if (i === 0) {
      // First event should have no previousHash
      if (event.previousHash !== null && event.previousHash !== undefined) {
        return { valid: false, totalEvents, checkedEvents, brokenAt: i };
      }
    } else {
      // Each subsequent event's previousHash should match the prior event's eventHash
      const priorHash = events[i - 1].eventHash;
      if (event.previousHash !== priorHash) {
        return { valid: false, totalEvents, checkedEvents, brokenAt: i };
      }
    }
  }

  return { valid: true, totalEvents, checkedEvents };
}
