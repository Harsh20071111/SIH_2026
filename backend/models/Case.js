import mongoose from "mongoose";

const CaseSchema = new mongoose.Schema(
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

// Helpful index for search/filtering
CaseSchema.index({ caseId: 1 });
CaseSchema.index({ status: 1 });
CaseSchema.index({ priority: 1 });
CaseSchema.index({ title: "text", description: "text" });

const Case = mongoose.models.Case || mongoose.model("Case", CaseSchema);

export default Case;
export { Case };
