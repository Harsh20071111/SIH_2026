import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
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

// Helpful indexes for querying documents by case and status
DocumentSchema.index({ caseId: 1, createdAt: -1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ documentType: 1 });
DocumentSchema.index({ fileName: "text", description: "text" });

const Document =
  mongoose.models.Document || mongoose.model("Document", DocumentSchema);

export default Document;
export { Document };
