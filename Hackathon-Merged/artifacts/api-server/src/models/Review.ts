import mongoose, { Schema, type Document } from "mongoose";

export interface IReview extends Document {
  documentId: string;
  caseId: string;
  documentName: string;
  reviewer: string;
  submittedBy: string;
  status: "Pending" | "Approved" | "Rejected" | "Flagged";
  comment: string;
  priority: "Low" | "Medium" | "High";
  submittedDate: Date;
  reviewedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    documentId: { type: String, required: true },
    caseId: { type: String, required: true },
    documentName: { type: String, required: true },
    reviewer: { type: String, default: "" },
    submittedBy: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Flagged"],
      default: "Pending",
    },
    comment: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    submittedDate: { type: Date, default: Date.now },
    reviewedDate: { type: Date, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ status: 1 });
reviewSchema.index({ documentId: 1 });
reviewSchema.index({ caseId: 1 });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
