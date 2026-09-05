import mongoose, { Schema, type Document } from "mongoose";

export interface IJurisdiction extends Document {
  code: string;             // "PS-BLR-KOR-001"
  name: string;             // "Koramangala Police Station"
  type: "PoliceStation" | "District" | "State" | "Central";
  districtCode: string;     // "BLR-URBAN"
  districtName: string;     // "Bengaluru Urban"
  stateCode: string;        // "KA"
  stateName: string;        // "Karnataka"
  parentJurisdictionId: mongoose.Types.ObjectId | null;  // Hierarchical
  geoCoordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jurisdictionSchema = new Schema<IJurisdiction>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["PoliceStation", "District", "State", "Central"],
    required: true 
  },
  districtCode: { type: String, required: true, index: true },
  districtName: { type: String, required: true },
  stateCode: { type: String, required: true, index: true },
  stateName: { type: String, required: true },
  parentJurisdictionId: { type: Schema.Types.ObjectId, ref: "Jurisdiction", default: null },
  geoCoordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Jurisdiction = mongoose.model<IJurisdiction>("Jurisdiction", jurisdictionSchema);
