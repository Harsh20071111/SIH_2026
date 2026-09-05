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

export interface AuditEventInput {
  action: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  firId?: string;
  caseId?: string; // Keep for backward compatibility if needed
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

/**
 * Compute a SHA-256 hash of the given data string.
 */
function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function createAuditEvent(
  input: AuditEventInput
): Promise<string | undefined> {
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
      firId: input.firId,
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
      result: input.result || "Success",
      timestamp: new Date(),
    });
    
    return eventHash;
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
    .select("eventHash previousHash action userId firId caseId documentId result timestamp")
    .lean();

  const totalEvents = events.length;
  let checkedEvents = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    checkedEvents++;

    if (i === 0) {
      if (event.previousHash !== null && event.previousHash !== undefined) {
        return { valid: false, totalEvents, checkedEvents, brokenAt: i };
      }
    } else {
      const priorHash = events[i - 1].eventHash;
      if (event.previousHash !== priorHash) {
        return { valid: false, totalEvents, checkedEvents, brokenAt: i };
      }
    }
  }

  return { valid: true, totalEvents, checkedEvents };
}
