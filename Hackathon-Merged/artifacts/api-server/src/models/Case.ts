import mongoose, { Document as MongooseDocument, Model } from "mongoose";

export interface ICase extends MongooseDocument {
  caseId: string;
  title: string;
  description?: string;
  caseType?: string;
  status: "Open" | "Under Investigation" | "Pending Review" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  createdBy?: string | null;
  assignedOfficer?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new mongoose.Schema<ICase>(
  {
    caseId: {
      type: String,
      required: [true, "caseId is required"],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    caseType: {
      type: String,
      default: "General",
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Open", "Under Investigation", "Pending Review", "Closed"],
        message: "{VALUE} is not a valid status",
      },
      default: "Open",
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High", "Critical"],
        message: "{VALUE} is not a valid priority",
      },
      default: "Medium",
    },
    createdBy: {
      type: String,
      default: null,
      trim: true,
    },
    assignedOfficer: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

CaseSchema.index({ caseId: 1 });
CaseSchema.index({ status: 1 });
CaseSchema.index({ priority: 1 });
CaseSchema.index({ title: "text", description: "text" });

export const Case: Model<ICase> =
  mongoose.models.Case || mongoose.model<ICase>("Case", CaseSchema);

export default Case;
