import mongoose, { Document as MongooseDocument, Model } from "mongoose";

export interface IDocument extends MongooseDocument {
  caseId: string;
  fileName: string;
  documentType?: string;
  description?: string;
  uploadedBy?: string | null;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  appwriteFileId?: string | null;
  storagePath?: string | null;
  sha256Hash?: string | null;
  encryptionAlgorithm?: string | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new mongoose.Schema<IDocument>(
  {
    caseId: {
      type: String,
      required: [true, "caseId is required"],
      trim: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, "fileName is required"],
      trim: true,
    },
    documentType: {
      type: String,
      default: "General",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    uploadedBy: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Under Review", "Approved", "Rejected"],
        message: "{VALUE} is not a valid document status",
      },
      default: "Pending",
    },
    appwriteFileId: {
      type: String,
      default: null,
    },
    storagePath: {
      type: String,
      default: null,
    },
    sha256Hash: {
      type: String,
      default: null,
    },
    encryptionAlgorithm: {
      type: String,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

DocumentSchema.index({ caseId: 1, createdAt: -1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ documentType: 1 });
DocumentSchema.index({ fileName: "text", description: "text" });

export const Document: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);

export default Document;
