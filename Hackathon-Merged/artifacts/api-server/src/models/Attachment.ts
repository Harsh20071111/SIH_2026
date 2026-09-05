import mongoose, { Schema, type Document } from "mongoose";

export type AttachmentType = 
  | "FIR_Document"
  | "Investigation_Diary"
  | "Charge_Sheet"
  | "Forensic_Report"
  | "Evidence_Photo"
  | "Evidence_Video"
  | "Witness_Statement"
  | "Court_Order"
  | "Certified_Copy";

export interface IAttachment extends Document {
  attachmentId: string;
  firId: mongoose.Types.ObjectId;
  firNumber: string;
  
  type: AttachmentType;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;          // Firebase / S3 path
  
  // ── Security ──
  sha256Hash: string;           // Integrity verification
  isEncrypted: boolean;
  encryptionKeyId: string;      // Reference to key vault
  isSensitive: boolean;         // Redaction flag
  
  // ── Access Control ──
  uploadedBy: mongoose.Types.ObjectId;
  uploadedByRole: string;
  accessibleToRoles: string[];  // Which roles can view
  
  // ── Forensic Token Binding ──
  forensicToken: string | null; // If uploaded by forensic expert
  
  // ── Watermark ──
  watermarkApplied: boolean;
  downloadCount: number;
  
  // ── Versioning ──
  version: number;
  previousVersionId: mongoose.Types.ObjectId | null;
  
  status: "Uploaded" | "Verified" | "Flagged" | "Redacted";
  
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>({
  attachmentId: { type: String, required: true, unique: true },
  firId: { type: Schema.Types.ObjectId, ref: "FIR", required: true },
  firNumber: { type: String, required: true, index: true },
  
  type: { 
    type: String, 
    required: true,
    enum: [
      "FIR_Document", "Investigation_Diary", "Charge_Sheet", "Forensic_Report",
      "Evidence_Photo", "Evidence_Video", "Witness_Statement", "Court_Order", "Certified_Copy"
    ]
  },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  storagePath: { type: String, required: true },
  
  sha256Hash: { type: String, required: true },
  isEncrypted: { type: Boolean, default: false },
  encryptionKeyId: { type: String, default: "" },
  isSensitive: { type: Boolean, default: false },
  
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadedByRole: { type: String, required: true },
  accessibleToRoles: [{ type: String }],
  
  forensicToken: { type: String, default: null },
  
  watermarkApplied: { type: Boolean, default: false },
  downloadCount: { type: Number, default: 0 },
  
  version: { type: Number, default: 1 },
  previousVersionId: { type: Schema.Types.ObjectId, ref: "Attachment", default: null },
  
  status: {
    type: String,
    enum: ["Uploaded", "Verified", "Flagged", "Redacted"],
    default: "Uploaded"
  },
}, { timestamps: true });

attachmentSchema.index({ firId: 1, type: 1 });
attachmentSchema.index({ uploadedBy: 1 });

export const Attachment = mongoose.model<IAttachment>("Attachment", attachmentSchema);
