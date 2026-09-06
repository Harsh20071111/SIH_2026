import mongoose, { Schema, type Document } from "mongoose";

export type SecureDocsRole = "Admin" | "Officer" | "Legal Reviewer" | "Clerk" | "Auditor";

export interface IUser extends Document {
  appwriteId?: string;
  email: string;
  name: string;
  role: SecureDocsRole;
  department: string;
  employeeId?: string;
  jurisdictionId?: mongoose.Types.ObjectId;
  policeStationId?: string;
  districtCode?: string;
  stateCode?: string;
  isActive: boolean;
  isSuspended: boolean;
  lastLogin: Date | null;
  forensicTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    appwriteId: { type: String, index: true, sparse: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Officer", "Legal Reviewer", "Clerk", "Auditor"],
      default: "Officer",
    },
    department: { type: String, required: true, default: "General" },
    employeeId: { type: String, sparse: true },
    jurisdictionId: { type: Schema.Types.ObjectId, ref: "Jurisdiction", default: null },
    policeStationId: { type: String, default: "PS-CENTRAL-01" },
    districtCode: { type: String, default: "DIST-01" },
    stateCode: { type: String, default: "ST-01" },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    forensicTokens: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ appwriteId: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
