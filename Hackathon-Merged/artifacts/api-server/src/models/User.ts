import mongoose, { Schema, type Document } from "mongoose";

export type UserRole = "Admin" | "Officer" | "Legal Reviewer" | "Clerk" | "Auditor";

export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
  department: string;
  passwordHash: string;
  isActive: boolean;
  lastLogin: Date | null;
  employeeId: string;
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
      enum: ["Admin", "Officer", "Legal Reviewer", "Clerk", "Auditor"],
      default: "Officer",
    },
    department: { type: String, required: true, default: "General" },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    employeeId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Index for login lookups
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
