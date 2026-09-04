import mongoose, { Schema, type Document } from "mongoose";

export interface IDocument extends Document {
  documentId: string;
  documentName: string;
  caseId: string;
  documentType: string;
  description: string;
  firebaseStoragePath: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  hash: string; // SHA-256 computed via crypto
  version: number;
  status: "Pending Review" | "Approved" | "Rejected" | "Flagged";
  integrity: "Verified" | "Warning" | "Failed";
  confidentiality: "Public" | "Internal" | "Confidential" | "Restricted";
  uploadedBy: string;
  uploadDate: Date;
  lastModified: Date;
  totalAccesses: number;
  lastAccessedBy: string;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    documentId: { type: String, required: true, unique: true },
    documentName: { type: String, required: true },
    caseId: { type: String, required: true },
    documentType: { type: String, required: true },
    description: { type: String, default: "" },
    firebaseStoragePath: { type: String, required: true },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    hash: { type: String, required: true },
    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["Pending Review", "Approved", "Rejected", "Flagged"],
      default: "Pending Review",
    },
    integrity: {
      type: String,
      enum: ["Verified", "Warning", "Failed"],
      default: "Verified",
    },
    confidentiality: {
      type: String,
      enum: ["Public", "Internal", "Confidential", "Restricted"],
      default: "Confidential",
    },
    uploadedBy: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    totalAccesses: { type: Number, default: 0 },
    lastAccessedBy: { type: String, default: "" },
    lastAccessed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

documentSchema.index({ documentId: 1 });
documentSchema.index({ caseId: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedBy: 1 });

export const SecureDocument = mongoose.model<IDocument>("Document", documentSchema);
