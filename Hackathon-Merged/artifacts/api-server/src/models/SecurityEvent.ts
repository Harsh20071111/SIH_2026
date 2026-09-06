import mongoose, { Schema, type Document } from "mongoose";

export interface ISecurityEvent extends Document {
  type: string;
  userId: string;
  userName: string;
  action: string;
  caseId: string;
  documentId: string;
  ipAddress: string;
  userAgent: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  triggeredRules: string[];
  status: "Open" | "Monitoring" | "Resolved";
  metadata: Record<string, unknown>;
  timestamp: Date;
}

const securityEventSchema = new Schema<ISecurityEvent>({
  type: { type: String, required: true, index: true },
  userId: { type: String, default: "" },
  userName: { type: String, default: "" },
  action: { type: String, required: true },
  caseId: { type: String, default: "" },
  documentId: { type: String, default: "" },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  riskScore: { type: Number, default: 0 },
  riskLevel: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "LOW",
  },
  triggeredRules: [{ type: String }],
  status: {
    type: String,
    enum: ["Open", "Monitoring", "Resolved"],
    default: "Monitoring",
  },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
});

securityEventSchema.index({ riskLevel: 1, status: 1 });
securityEventSchema.index({ timestamp: -1 });

export const SecurityEvent = mongoose.model<ISecurityEvent>(
  "SecurityEvent",
  securityEventSchema
);
