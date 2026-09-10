import mongoose, { Schema, type Document } from "mongoose";

export type UserRole =
  | "Admin"
  | "Officer"
  | "Legal Reviewer"
  | "Clerk"
  | "Auditor"
  | "DutyOfficer"
  | "IO"
  | "SHO"
  | "SP"
  | "ForensicExpert"
  | "Magistrate"
  | "Reviewer"
  | "Administrator";

export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
  department: string;
  passwordHash: string;
  isActive: boolean;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  verificationDocuments: string[];
  lastLogin: Date | null;
  employeeId: string;
  assignedCases?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
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
      enum: [
        "Admin",
        "Officer",
        "Legal Reviewer",
        "Clerk",
        "Auditor",
        "DutyOfficer",
        "IO",
        "SHO",
        "SP",
        "ForensicExpert",
        "Magistrate",
        "Reviewer",
        "Administrator",
      ],
      default: "Officer",
    },
    department: { type: String, required: true, default: "General" },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    verificationDocuments: { type: [String], default: [] },
    lastLogin: { type: Date, default: null },
    employeeId: { type: String, required: true, unique: true },
    assignedCases: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Index for login lookups
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
