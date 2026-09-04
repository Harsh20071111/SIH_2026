import mongoose, { Schema, type Document } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  userId: string;
  userName: string;
  userRole: string;
  caseId: string;
  documentId: string;
  result: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  previousHash: string | null;
  eventHash: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true, index: true },
  userId: { type: String, default: "" },
  userName: { type: String, default: "" },
  userRole: { type: String, default: "" },
  caseId: { type: String, default: "" },
  documentId: { type: String, default: "" },
  result: { type: String, default: "Success" },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  metadata: { type: Schema.Types.Mixed, default: {} },
  previousHash: { type: String, default: null },
  eventHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
