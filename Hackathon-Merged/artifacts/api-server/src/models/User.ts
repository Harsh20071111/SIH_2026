import mongoose, { Schema, type Document } from "mongoose";

export type OfficerRank = 
  | "DutyOfficer"        // Desk Constable
  | "IO"                 // Investigating Officer
  | "SHO"               // Station House Officer / Inspector
  | "SP"                // Superintendent of Police / DCP
  | "ForensicExpert"    // Forensic / Cyber Lab
  | "Magistrate";       // Judicial Magistrate / Court

export interface IUser extends Document {
  email: string;
  name: string;
  employeeId: string;
  passwordHash: string;
  
  role: OfficerRank;
  department: string;
  
  jurisdictionId: mongoose.Types.ObjectId;
  policeStationId: string;
  districtCode: string;
  stateCode: string;
  
  isActive: boolean;
  isSuspended: boolean;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  lastLogin: Date | null;
  sessionFingerprint: string;
  
  forensicTokens: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    
    role: {
      type: String,
      required: true,
      enum: ["DutyOfficer", "IO", "SHO", "SP", "ForensicExpert", "Magistrate"],
    },
    department: { type: String, required: true, default: "General" },
    
    jurisdictionId: { type: Schema.Types.ObjectId, ref: "Jurisdiction", required: false }, // required false temporarily for migration if needed
    policeStationId: { type: String, required: true, index: true },
    districtCode: { type: String, required: true, index: true },
    stateCode: { type: String, required: true },
    
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    mfaEnabled: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },
    sessionFingerprint: { type: String, default: "" },
    
    forensicTokens: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ districtCode: 1, role: 1 });
userSchema.index({ policeStationId: 1, role: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
