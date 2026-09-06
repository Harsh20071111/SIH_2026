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
  firId?: string;
  firNumber?: string;
  caseId?: string;

  type: AttachmentType;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  appwriteFileId?: string | null;

  // Security & Integrity
  sha256Hash: string;
  isEncrypted: boolean;
  encryptionKeyId?: string;
  isSensitive: boolean;

  // Access Control
  uploadedBy: string;
  uploadedByRole: string;
  accessibleToRoles: string[];

  forensicToken?: string | null;

  // Watermark (Honest flag - true only if watermarked)
  watermarkApplied: boolean;
  downloadCount: number;

  version: number;
  status: "Uploaded" | "Verified" | "Flagged" | "Redacted";

  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    attachmentId: { type: String, required: true, unique: true },
    firId: { type: String, default: null },
    firNumber: { type: String, default: null, index: true },
    caseId: { type: String, default: null, index: true },

    type: {
      type: String,
      required: true,
      enum: [
        "FIR_Document",
        "Investigation_Diary",
        "Charge_Sheet",
        "Forensic_Report",
        "Evidence_Photo",
        "Evidence_Video",
        "Witness_Statement",
        "Court_Order",
        "Certified_Copy",
      ],
    },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true },
    appwriteFileId: { type: String, default: null },

    sha256Hash: { type: String, required: true },
    isEncrypted: { type: Boolean, default: false },
    encryptionKeyId: { type: String, default: "" },
    isSensitive: { type: Boolean, default: false },

    uploadedBy: { type: String, required: true },
    uploadedByRole: { type: String, required: true },
    accessibleToRoles: [{ type: String }],

    forensicToken: { type: String, default: null },

    watermarkApplied: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },

    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["Uploaded", "Verified", "Flagged", "Redacted"],
      default: "Uploaded",
    },
  },
  { timestamps: true }
);

attachmentSchema.index({ firNumber: 1, type: 1 });
attachmentSchema.index({ caseId: 1 });
attachmentSchema.index({ uploadedBy: 1 });

export const Attachment = mongoose.model<IAttachment>("Attachment", attachmentSchema);
