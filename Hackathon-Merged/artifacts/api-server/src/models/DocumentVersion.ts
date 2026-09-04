import mongoose, { Schema, type Document } from "mongoose";

export interface IDocumentVersion extends Document {
  documentId: string;
  version: number;
  hash: string;
  firebaseStoragePath: string;
  uploadedBy: string;
  changeDescription: string;
  size: number;
  createdAt: Date;
}

const documentVersionSchema = new Schema<IDocumentVersion>(
  {
    documentId: { type: String, required: true },
    version: { type: Number, required: true },
    hash: { type: String, required: true },
    firebaseStoragePath: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    changeDescription: { type: String, default: "" },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

documentVersionSchema.index({ documentId: 1, version: 1 });

export const DocumentVersion = mongoose.model<IDocumentVersion>(
  "DocumentVersion",
  documentVersionSchema
);
