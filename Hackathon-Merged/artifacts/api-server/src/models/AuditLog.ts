import mongoose, { Schema, type Document } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  userId: string;
  userName: string;
  userRole: string;
  firId: string;
  caseId: string;
  documentId: string;
  result: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  previousHash: string | null;
  eventHash: string;
  timestamp: Date;

  // Unauthorized Access Tracking
  isUnauthorized: boolean;
  denialReason: string;

  // Download Tracking
  wasDownloaded: boolean;
  watermarkId: string;

  // Sensitive Data Access
  accessedSensitiveFields: string[];
}

const auditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true, index: true },
  userId: { type: String, default: "" },
  userName: { type: String, default: "" },
  userRole: { type: String, default: "" },
  firId: { type: String, default: "" },
  caseId: { type: String, default: "" },
  documentId: { type: String, default: "" },
  result: { type: String, default: "Success" },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  metadata: { type: Schema.Types.Mixed, default: {} },
  previousHash: { type: String, default: null },
  eventHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },

  isUnauthorized: { type: Boolean, default: false },
  denialReason: { type: String, default: "" },

  wasDownloaded: { type: Boolean, default: false },
  watermarkId: { type: String, default: "" },

  accessedSensitiveFields: [{ type: String }],
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ firId: 1 });
auditLogSchema.index({ caseId: 1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
