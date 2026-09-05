import mongoose, { Schema, type Document } from "mongoose";

export type FIRStatus = 
  | "Draft"                  // Being drafted by Duty Officer
  | "Submitted"              // Submitted, awaiting IO assignment
  | "UnderInvestigation"     // IO assigned, investigation ongoing
  | "ChargeSheetFiled"       // IO uploaded charge sheet
  | "ChargeSheetApproved"    // SHO approved charge sheet
  | "ChargeSheetRejected"    // SHO rejected charge sheet
  | "Transferred"            // Transferred to another station
  | "Closed"                 // Investigation complete
  | "CourtReferred";         // Sent to Magistrate

export interface IFIR extends Document {
  firNumber: string;          // "FIR/BLR/KOR/2026/001847"
  firDate: Date;
  
  // ── Classification ──
  ipcSections: string[];      // ["302", "120B"]
  crimeType: string;          // "Murder", "Theft", etc.
  isSensitive: boolean;       // POCSO, sexual assault, etc.
  sensitiveCategory: string;  // "POCSO" | "SEXUAL_ASSAULT" | "COMMUNAL" | null
  
  // ── Jurisdiction Binding ──
  policeStationId: string;
  districtCode: string;
  stateCode: string;
  jurisdictionId: mongoose.Types.ObjectId;
  
  // ── Assignment ──
  draftedBy: mongoose.Types.ObjectId;       // Duty Officer who created it
  assignedIOId: mongoose.Types.ObjectId | null;  // Investigating Officer
  assignedSHOId: mongoose.Types.ObjectId;   // Station House Officer
  
  // ── Content (Encrypted at rest) ──
  complainantDetails: {
    name: string;
    address: string;
    phone: string;
    idType: string;       // "Aadhaar" | "PAN" | "Voter ID"
    idNumber: string;     // Encrypted
  };
  accusedDetails: Array<{
    name: string;
    description: string;
    isIdentified: boolean;
  }>;
  victimDetails: Array<{
    name: string;
    age: number;
    isMinor: boolean;     // Triggers POCSO redaction
    gender: string;
  }>;
  witnessDetails: Array<{
    name: string;
    contactInfo: string;  // Encrypted
    statement: string;
  }>;
  
  incidentDescription: string;
  incidentDate: Date;
  incidentLocation: string;
  
  // ── Status & Workflow ──
  status: FIRStatus;
  priority: "Low" | "Medium" | "High" | "Critical";
  
  // ── Transfer ──
  transferHistory: Array<{
    fromStation: string;
    toStation: string;
    transferredBy: mongoose.Types.ObjectId;
    reason: string;
    timestamp: Date;
  }>;
  
  // ── Integrity ──
  contentHash: string;         // SHA-256 of FIR content for tamper detection
  lastModifiedBy: mongoose.Types.ObjectId;
  version: number;
  isLocked: boolean;           // True after charge sheet approval
  
  createdAt: Date;
  updatedAt: Date;
}

const firSchema = new Schema<IFIR>({
  firNumber: { type: String, required: true, unique: true },
  firDate: { type: Date, default: Date.now },
  
  ipcSections: [{ type: String }],
  crimeType: { type: String, required: true },
  isSensitive: { type: Boolean, default: false },
  sensitiveCategory: { type: String, default: null },
  
  policeStationId: { type: String, required: true, index: true },
  districtCode: { type: String, required: true, index: true },
  stateCode: { type: String, required: true },
  jurisdictionId: { type: Schema.Types.ObjectId, ref: "Jurisdiction", required: true },
  
  draftedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assignedIOId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  assignedSHOId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  
  complainantDetails: { type: Schema.Types.Mixed, required: true },
  accusedDetails: [{ type: Schema.Types.Mixed }],
  victimDetails: [{ type: Schema.Types.Mixed }],
  witnessDetails: [{ type: Schema.Types.Mixed }],
  
  incidentDescription: { type: String, required: true },
  incidentDate: { type: Date, required: true },
  incidentLocation: { type: String, required: true },
  
  status: {
    type: String,
    enum: [
      "Draft", "Submitted", "UnderInvestigation", "ChargeSheetFiled",
      "ChargeSheetApproved", "ChargeSheetRejected", "Transferred",
      "Closed", "CourtReferred"
    ],
    default: "Draft",
  },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  
  transferHistory: [{
    fromStation: String,
    toStation: String,
    transferredBy: { type: Schema.Types.ObjectId, ref: "User" },
    reason: String,
    timestamp: { type: Date, default: Date.now },
  }],
  
  contentHash: { type: String, required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  version: { type: Number, default: 1 },
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

// Performance indexes
firSchema.index({ policeStationId: 1, status: 1 });
firSchema.index({ districtCode: 1, status: 1 });
firSchema.index({ assignedIOId: 1, status: 1 });
firSchema.index({ firNumber: 1 });
firSchema.index({ isSensitive: 1 });

export const FIR = mongoose.model<IFIR>("FIR", firSchema);
