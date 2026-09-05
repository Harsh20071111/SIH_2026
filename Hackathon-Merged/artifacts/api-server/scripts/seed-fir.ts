import mongoose from "mongoose";
import "dotenv/config";
import { User, OfficerRank } from "../src/models/User";
import { Jurisdiction } from "../src/models/Jurisdiction";
import { FIR } from "../src/models/FIR";
import { connectDB } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  await connectDB();
  
  // Clear existing
  await User.deleteMany({});
  await Jurisdiction.deleteMany({});
  await FIR.deleteMany({});
  
  // Create Jurisdictions
  const state = await Jurisdiction.create({
    code: "ST-KA", name: "Karnataka State Police", type: "State",
    districtCode: "KA-ALL", districtName: "Karnataka", stateCode: "KA", stateName: "Karnataka"
  });
  
  const district = await Jurisdiction.create({
    code: "DIST-BLR", name: "Bengaluru City Police", type: "District",
    districtCode: "BLR-URBAN", districtName: "Bengaluru Urban", stateCode: "KA", stateName: "Karnataka",
    parentJurisdictionId: state._id
  });
  
  const ps1 = await Jurisdiction.create({
    code: "PS-BLR-KOR", name: "Koramangala Police Station", type: "PoliceStation",
    districtCode: "BLR-URBAN", districtName: "Bengaluru Urban", stateCode: "KA", stateName: "Karnataka",
    parentJurisdictionId: district._id
  });
  
  const ps2 = await Jurisdiction.create({
    code: "PS-BLR-INDR", name: "Indiranagar Police Station", type: "PoliceStation",
    districtCode: "BLR-URBAN", districtName: "Bengaluru Urban", stateCode: "KA", stateName: "Karnataka",
    parentJurisdictionId: district._id
  });

  const passwordHash = await bcrypt.hash("secure123", 10);
  
  // Create Users for each role
  const usersToCreate = [
    { name: "Constable Ramesh", email: "ramesh.do@pol.ka.gov.in", employeeId: "DO-101", role: "DutyOfficer" as OfficerRank, policeStationId: ps1.code, districtCode: ps1.districtCode, stateCode: ps1.stateCode, jurisdictionId: ps1._id },
    { name: "Inspector Vikram", email: "vikram.io@pol.ka.gov.in", employeeId: "IO-202", role: "IO" as OfficerRank, policeStationId: ps1.code, districtCode: ps1.districtCode, stateCode: ps1.stateCode, jurisdictionId: ps1._id },
    { name: "SHO Anjali", email: "anjali.sho@pol.ka.gov.in", employeeId: "SHO-303", role: "SHO" as OfficerRank, policeStationId: ps1.code, districtCode: ps1.districtCode, stateCode: ps1.stateCode, jurisdictionId: ps1._id },
    { name: "DCP Ravi", email: "ravi.sp@pol.ka.gov.in", employeeId: "SP-404", role: "SP" as OfficerRank, policeStationId: district.code, districtCode: district.districtCode, stateCode: district.stateCode, jurisdictionId: district._id },
    { name: "Dr. Salunkhe", email: "salunkhe.fsl@pol.ka.gov.in", employeeId: "FSL-505", role: "ForensicExpert" as OfficerRank, policeStationId: "FSL-HQ", districtCode: district.districtCode, stateCode: district.stateCode, jurisdictionId: state._id, forensicTokens: ["FIR/BLR/KOR/2026/001"] },
    { name: "Hon. Magistrate Kumar", email: "kumar.mag@courts.ka.gov.in", employeeId: "MAG-606", role: "Magistrate" as OfficerRank, policeStationId: "COURT-1", districtCode: district.districtCode, stateCode: district.stateCode, jurisdictionId: district._id },
  ];
  
  const createdUsers = [];
  for (const u of usersToCreate) {
    const user = await User.create({ ...u, passwordHash, department: "Police" });
    createdUsers.push(user);
    console.log(`Created user: ${user.name} (${user.role}) - ${user.email}`);
  }
  
  // Create a Demo FIR
  const dutyOfficer = createdUsers.find(u => u.role === "DutyOfficer");
  const io = createdUsers.find(u => u.role === "IO");
  const sho = createdUsers.find(u => u.role === "SHO");
  
  if (dutyOfficer && io && sho) {
    await FIR.create({
      firNumber: "FIR/BLR/KOR/2026/001",
      firDate: new Date(),
      ipcSections: ["379", "420"],
      crimeType: "Theft",
      isSensitive: false,
      policeStationId: ps1.code,
      districtCode: ps1.districtCode,
      stateCode: ps1.stateCode,
      jurisdictionId: ps1._id,
      draftedBy: dutyOfficer._id,
      assignedIOId: io._id,
      assignedSHOId: sho._id,
      complainantDetails: { name: "Rahul Sharma", address: "123 Koramangala 4th Block", phone: "9876543210", idType: "Aadhaar", idNumber: "123456789012" },
      incidentDescription: "Theft of laptop from parked car near Forum Mall.",
      incidentDate: new Date(Date.now() - 86400000),
      incidentLocation: "Koramangala 4th Block",
      status: "UnderInvestigation",
      contentHash: "demo-hash-123",
      lastModifiedBy: dutyOfficer._id
    });
    console.log("Created demo FIR: FIR/BLR/KOR/2026/001");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
