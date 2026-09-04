import mongoose, { Schema, type Document } from "mongoose";

export type CaseStatus =
  | "Active"
  | "Under Investigation"
  | "Under Review"
  | "Closed"
  | "Archived";

export type CasePriority = "Low" | "Medium" | "High";
export type CaseRisk = "Low" | "Medium" | "High";
export type ConfidentialityLevel =
  | "Public/Internal"
  | "Confidential"
  | "Restricted"
  | "Highly Restricted";

export interface ICase extends Document {
  caseId: string;
  title: string;
  type: string;
  description: string;
  department: string;
  assignedOfficer: string;
  priority: CasePriority;
  status: CaseStatus;
  risk: CaseRisk;
  confidentiality: ConfidentialityLevel;
  startDate: Date;
  documentsCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    caseId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    description: { type: String, default: "" },
    department: { type: String, required: true },
    assignedOfficer: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Active", "Under Investigation", "Under Review", "Closed", "Archived"],
      default: "Active",
    },
    risk: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    confidentiality: {
      type: String,
      enum: ["Public/Internal", "Confidential", "Restricted", "Highly Restricted"],
      default: "Confidential",
    },
    startDate: { type: Date, default: Date.now },
    documentsCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

caseSchema.index({ caseId: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ assignedOfficer: 1 });

export const Case = mongoose.model<ICase>("Case", caseSchema);
