import mongoose, { Schema, type Document } from "mongoose";

export interface IReview extends Document {
  documentId: string;
  documentName: string;
  caseId: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  status: "Pending" | "In Review" | "Approved" | "Rejected";
  priority: "Low" | "Medium" | "High" | "Critical";
  comments?: string;
  reviewedBy?: string;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    documentId: { type: String, required: true, index: true },
    documentName: { type: String, required: true },
    caseId: { type: String, required: true, index: true },
    assignedReviewerId: { type: String, default: null },
    assignedReviewerName: { type: String, default: null },
    status: {
      type: String,
      enum: ["Pending", "In Review", "Approved", "Rejected"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    comments: { type: String, default: "" },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ status: 1 });
reviewSchema.index({ caseId: 1 });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
