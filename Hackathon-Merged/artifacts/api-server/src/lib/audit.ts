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
  | "TOKEN_INVALID"
  | "CASE_CREATED"
  | "CASE_VIEWED"
  | "CASE_UPDATED"
  | "CASE_DELETED"
  | "CASE_ARCHIVED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_VIEWED"
  | "DOCUMENT_DOWNLOADED"
  | "DOCUMENT_UPDATED"
  | "DOCUMENT_DELETED"
  | "DOCUMENT_SHARED"
  | "DOCUMENT_APPROVED"
  | "DOCUMENT_REJECTED"
  | "DOCUMENT_FLAGGED"
  | "DOCUMENT_VERSION_CREATED"
  | "DOCUMENT_INTEGRITY_FAILED"
  | "INTEGRITY_VERIFIED"
  | "INTEGRITY_ISSUE_DETECTED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DEACTIVATED"
  | "USER_PASSWORD_RESET"
  | "PASSWORD_RESET"
  | "REVIEW_CREATED"
  | "REVIEW_SUBMITTED"
  | "REVIEW_APPROVED"
  | "REVIEW_REJECTED"
  | "REVIEW_FLAGGED"
  | "ROLE_CHANGED"
  | "SECURITY_ALERT"
  | "RISK_SCORE_CHANGED"
  | "UNAUTHORIZED_ACCESS";

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
  resourceType?: string;
  resourceId?: string;
}

/**
 * Compute a SHA-256 hash of the given data string.
 */
function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Compute a deterministic hash of the event content to ensure tamper-evidence.
 */
export function computeEventHash(payload: any, previousHash: string | null): string {
  // We strictly order keys to ensure consistent serialization
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
      .select("eventHash sequenceNumber")
      .lean();

    const previousHash: string | null = lastEvent?.eventHash ?? null;
    const sequenceNumber = (lastEvent?.sequenceNumber ?? 0) + 1;
    const timestamp = new Date();

    const payload = {
      ...input,
      timestamp,
      sequenceNumber,
    };

    const eventHash = computeEventHash(payload, previousHash);

    await AuditLogDoc.create({
      ...payload,
      previousHash,
      eventHash,
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
  reason?: string;
  details?: any;
}> {
  const AuditLogDoc = await getAuditLogModel();

  const events = await AuditLogDoc.find()
    .sort({ timestamp: 1 })
    .lean();

  const totalEvents = events.length;
  let checkedEvents = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    checkedEvents++;

    // Only strictly verify canonical hash for new events that have sequenceNumber
    // Old events used a non-deterministic timestamp generation for hashes.
    if (event.sequenceNumber !== undefined && event.sequenceNumber > 0) {
      const computedHash = computeEventHash(event, event.previousHash);
      if (computedHash !== event.eventHash) {
        return {
          valid: false,
          totalEvents,
          checkedEvents,
          brokenAt: i,
          reason: "HASH_MISMATCH",
          details: { recordId: event._id, computed: computedHash, stored: event.eventHash }
        };
      }
    }

    if (i === 0) {
      // First event should have no previousHash or "GENESIS"
      if (event.previousHash !== null && event.previousHash !== "GENESIS" && event.previousHash !== undefined) {
        return { valid: false, totalEvents, checkedEvents, brokenAt: i, reason: "LINK_BROKEN", details: { message: "First event previousHash not null" } };
      }
    } else {
      // Each subsequent event's previousHash should match the prior event's eventHash
      const priorHash = events[i - 1].eventHash;
      if (event.previousHash !== priorHash) {
        return { valid: false, totalEvents, checkedEvents, brokenAt: i, reason: "LINK_BROKEN", details: { expected: priorHash, actual: event.previousHash } };
      }
    }
  }

  return { valid: true, totalEvents, checkedEvents };
}
