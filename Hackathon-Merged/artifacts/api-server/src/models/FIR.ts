import mongoose, { Schema, type Document } from "mongoose";

export type FIRStatus =
  | "Draft"
  | "Submitted"
  | "UnderInvestigation"
  | "ChargeSheetFiled"
  | "ChargeSheetApproved"
  | "ChargeSheetRejected"
  | "Transferred"
  | "Closed"
  | "CourtReferred";

export interface IFIR extends Document {
  firNumber: string;          // e.g. "FIR/BLR/KOR/2026/001847"
  firDate: Date;
  caseId?: string;            // Logical connection to an existing Case (e.g. "CASE-2026-001")

  // Classification
  ipcSections: string[];      // e.g. ["302", "120B"]
  crimeType: string;
  isSensitive: boolean;
  sensitiveCategory?: string | null; // "POCSO" | "SEXUAL_ASSAULT" | "COMMUNAL" | null

  // Jurisdiction Binding
  policeStationId: string;
  districtCode: string;
  stateCode: string;
  jurisdictionId?: mongoose.Types.ObjectId;

  // Assignment
  draftedBy: string;          // User ID or Name who drafted
  assignedIOId?: string | null; // Investigating Officer
  assignedSHOId?: string | null; // Station House Officer

  // Content
  complainantDetails: {
    name: string;
    address?: string;
    phone?: string;
    idType?: string;
    idNumber?: string;
  };
  accusedDetails: Array<{
    name: string;
    description?: string;
    isIdentified?: boolean;
  }>;
  victimDetails: Array<{
    name: string;
    age?: number;
    isMinor?: boolean;
    gender?: string;
  }>;
  witnessDetails: Array<{
    name: string;
    contactInfo?: string;
    statement?: string;
  }>;

  incidentDescription: string;
  incidentDate: Date;
  incidentLocation: string;

  // Status & Workflow
  status: FIRStatus;
  priority: "Low" | "Medium" | "High" | "Critical";

  // Transfer
  transferHistory: Array<{
    fromStation: string;
    toStation: string;
    transferredBy: string;
    reason: string;
    timestamp: Date;
  }>;

  // Integrity
  contentHash: string;
  lastModifiedBy?: string;
  version: number;
  isLocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const firSchema = new Schema<IFIR>(
  {
    firNumber: { type: String, required: true, unique: true },
    firDate: { type: Date, default: Date.now },
    caseId: { type: String, default: null, index: true },

    ipcSections: [{ type: String }],
    crimeType: { type: String, required: true },
    isSensitive: { type: Boolean, default: false },
    sensitiveCategory: { type: String, default: null },

    policeStationId: { type: String, required: true, index: true, default: "PS-CENTRAL-01" },
    districtCode: { type: String, required: true, index: true, default: "DIST-01" },
    stateCode: { type: String, required: true, default: "ST-01" },
    jurisdictionId: { type: Schema.Types.ObjectId, ref: "Jurisdiction", default: null },

    draftedBy: { type: String, required: true },
    assignedIOId: { type: String, default: null, index: true },
    assignedSHOId: { type: String, default: null },

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
        "Draft",
        "Submitted",
        "UnderInvestigation",
        "ChargeSheetFiled",
        "ChargeSheetApproved",
        "ChargeSheetRejected",
        "Transferred",
        "Closed",
        "CourtReferred",
      ],
      default: "Draft",
    },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },

    transferHistory: [
      {
        fromStation: String,
        toStation: String,
        transferredBy: String,
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    contentHash: { type: String, default: "" },
    lastModifiedBy: { type: String, default: null },
    version: { type: Number, default: 1 },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

firSchema.index({ policeStationId: 1, status: 1 });
firSchema.index({ districtCode: 1, status: 1 });
firSchema.index({ firNumber: 1 });
firSchema.index({ caseId: 1 });

export const FIR = mongoose.model<IFIR>("FIR", firSchema);
