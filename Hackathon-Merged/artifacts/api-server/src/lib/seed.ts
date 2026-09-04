import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MONGODB_URI =
  process.env["MONGODB_URI"] || "mongodb://localhost:27017/securedocs";

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected");

  // Import models (after connection)
  const { User } = await import("../models/User");
  const { Case } = await import("../models/Case");
  const { SecureDocument } = await import("../models/Document");
  const { DocumentVersion } = await import("../models/DocumentVersion");
  const { Review } = await import("../models/Review");
  const { AuditLog } = await import("../models/AuditLog");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Case.deleteMany({}),
    SecureDocument.deleteMany({}),
    DocumentVersion.deleteMany({}),
    Review.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // Seed users with bcrypt-hashed passwords
  console.log("👤 Creating users...");
  const salt = await bcrypt.genSalt(12);
  const defaultHash = await bcrypt.hash("password123", salt);

  const users = await User.insertMany([
    { email: "admin@securedocs.gov", name: "Admin User", role: "Admin", department: "Administration", passwordHash: defaultHash, employeeId: "EMP-001", isActive: true },
    { email: "raj.patel@securedocs.gov", name: "Officer Raj Patel", role: "Officer", department: "Investigation", passwordHash: defaultHash, employeeId: "EMP-002", isActive: true },
    { email: "amit.shah@securedocs.gov", name: "Officer Amit Shah", role: "Officer", department: "Cyber Crime", passwordHash: defaultHash, employeeId: "EMP-003", isActive: true },
    { email: "neha.patel@securedocs.gov", name: "Officer Neha Patel", role: "Officer", department: "Evidence", passwordHash: defaultHash, employeeId: "EMP-004", isActive: true },
    { email: "vikram.rao@securedocs.gov", name: "Officer Vikram Rao", role: "Officer", department: "Forensics", passwordHash: defaultHash, employeeId: "EMP-005", isActive: true },
    { email: "mehta@securedocs.gov", name: "Legal Reviewer Mehta", role: "Legal Reviewer", department: "Legal", passwordHash: defaultHash, employeeId: "EMP-006", isActive: true },
    { email: "clerk@securedocs.gov", name: "Court Clerk S. Webb", role: "Clerk", department: "Court Services", passwordHash: defaultHash, employeeId: "EMP-007", isActive: true },
    { email: "auditor@securedocs.gov", name: "Auditor Singh", role: "Auditor", department: "Audit", passwordHash: defaultHash, employeeId: "EMP-008", isActive: true },
  ]);
  console.log(`   ✅ Created ${users.length} users`);

  // Seed cases
  console.log("📁 Creating cases...");
  const cases = await Case.insertMany([
    { caseId: "CASE-2026-00421", title: "Theft Investigation — Downtown Precinct", type: "Theft", description: "Investigation related to reported theft and collection of supporting evidence from downtown district.", department: "Investigation", assignedOfficer: "Officer Raj Patel", priority: "High", status: "Active", risk: "Medium", confidentiality: "Restricted", startDate: new Date("2026-09-01"), createdBy: "Admin User", documentsCount: 3 },
    { caseId: "CASE-2026-00318", title: "Financial Fraud — Meridian Corp", type: "Fraud", description: "Investigation into suspected financial fraud involving Meridian Corporation.", department: "Investigation", assignedOfficer: "Officer Amit Shah", priority: "High", status: "Under Review", risk: "High", confidentiality: "Highly Restricted", startDate: new Date("2026-08-28"), createdBy: "Admin User", documentsCount: 5 },
    { caseId: "CASE-2026-00512", title: "Witness Protection — State v. Torres", type: "Investigation", description: "Witness protection case requiring careful document handling and restricted access.", department: "Evidence", assignedOfficer: "Officer Neha Patel", priority: "Medium", status: "Under Investigation", risk: "High", confidentiality: "Restricted", startDate: new Date("2026-08-25"), createdBy: "Admin User", documentsCount: 2 },
    { caseId: "CASE-2026-00287", title: "Cyber Intrusion Analysis", type: "Cyber Crime", description: "Analysis of network intrusion detected in government systems.", department: "Cyber Crime", assignedOfficer: "Officer Amit Shah", priority: "High", status: "Active", risk: "High", confidentiality: "Highly Restricted", startDate: new Date("2026-08-20"), createdBy: "Admin User", documentsCount: 4 },
    { caseId: "CASE-2026-00651", title: "Evidence Recovery — Cold Case #44", type: "Investigation", description: "Recovery and analysis of evidence from cold case file #44.", department: "Forensics", assignedOfficer: "Officer Vikram Rao", priority: "Medium", status: "Active", risk: "Low", confidentiality: "Confidential", startDate: new Date("2026-08-15"), createdBy: "Admin User", documentsCount: 2 },
    { caseId: "CASE-2026-00178", title: "Property Theft — East District", type: "Theft", description: "Property theft case in the east district involving multiple suspects.", department: "Investigation", assignedOfficer: "Officer Raj Patel", priority: "Medium", status: "Closed", risk: "Low", confidentiality: "Public/Internal", startDate: new Date("2026-07-10"), createdBy: "Admin User", documentsCount: 3 },
    { caseId: "CASE-2026-00904", title: "Court Filing — State v. Blake", type: "Court Filing", description: "Court filing and legal documentation for State v. Blake trial.", department: "Legal", assignedOfficer: "Legal Reviewer Mehta", priority: "High", status: "Under Review", risk: "Medium", confidentiality: "Public/Internal", startDate: new Date("2026-08-10"), createdBy: "Admin User", documentsCount: 2 },
    { caseId: "CASE-2026-00742", title: "Identity Misuse Investigation", type: "Fraud", description: "Investigation into identity misuse and document forgery ring.", department: "Investigation", assignedOfficer: "Officer Raj Patel", priority: "High", status: "Under Investigation", risk: "High", confidentiality: "Restricted", startDate: new Date("2026-08-05"), createdBy: "Admin User", documentsCount: 4 },
  ]);
  console.log(`   ✅ Created ${cases.length} cases`);

  // Seed documents
  console.log("📄 Creating documents...");
  const docData = [
    { documentId: "SD-260421", documentName: "FIR_2026_00421.pdf", caseId: "CASE-2026-00421", documentType: "FIR", uploadedBy: "Officer Raj Patel", status: "Approved" as const, integrity: "Verified" as const, confidentiality: "Restricted" as const },
    { documentId: "SD-260318", documentName: "Investigation_Report_017.pdf", caseId: "CASE-2026-00318", documentType: "Investigation Record", uploadedBy: "Officer Amit Shah", status: "Pending Review" as const, integrity: "Verified" as const, confidentiality: "Confidential" as const },
    { documentId: "SD-260512", documentName: "Witness_Statement_09.pdf", caseId: "CASE-2026-00512", documentType: "Witness Statement", uploadedBy: "Officer Neha Patel", status: "Flagged" as const, integrity: "Warning" as const, confidentiality: "Restricted" as const },
    { documentId: "SD-260287", documentName: "Police_Report_028.pdf", caseId: "CASE-2026-00287", documentType: "Police Report", uploadedBy: "Officer Vikram Rao", status: "Approved" as const, integrity: "Verified" as const, confidentiality: "Internal" as const },
    { documentId: "SD-260651", documentName: "Forensic_Report_FIB-44.pdf", caseId: "CASE-2026-00651", documentType: "Forensic Report", uploadedBy: "Officer Vikram Rao", status: "Pending Review" as const, integrity: "Verified" as const, confidentiality: "Restricted" as const },
    { documentId: "SD-260178", documentName: "Charge_Sheet_Torres.pdf", caseId: "CASE-2026-00178", documentType: "Charge Sheet", uploadedBy: "Legal Reviewer Mehta", status: "Approved" as const, integrity: "Verified" as const, confidentiality: "Confidential" as const },
    { documentId: "SD-260742", documentName: "Evidence_Record_07.pdf", caseId: "CASE-2026-00742", documentType: "Evidence Record", uploadedBy: "Officer Amit Shah", status: "Rejected" as const, integrity: "Failed" as const, confidentiality: "Restricted" as const },
    { documentId: "SD-260904", documentName: "Court_Filing_2026_19.pdf", caseId: "CASE-2026-00904", documentType: "Court Filing", uploadedBy: "Legal Reviewer Mehta", status: "Approved" as const, integrity: "Verified" as const, confidentiality: "Public" as const },
    { documentId: "SD-260433", documentName: "Legal_Notice_Meridian.pdf", caseId: "CASE-2026-00318", documentType: "Legal Notice", uploadedBy: "Officer Neha Patel", status: "Flagged" as const, integrity: "Warning" as const, confidentiality: "Internal" as const },
    { documentId: "SD-260610", documentName: "Judgment_2026_0610.pdf", caseId: "CASE-2026-00904", documentType: "Judgment", uploadedBy: "Court Clerk S. Webb", status: "Approved" as const, integrity: "Verified" as const, confidentiality: "Public" as const },
    { documentId: "SD-260321", documentName: "Case_Review_Appendix.pdf", caseId: "CASE-2026-00318", documentType: "Police Report", uploadedBy: "Officer Raj Patel", status: "Pending Review" as const, integrity: "Verified" as const, confidentiality: "Confidential" as const },
    { documentId: "SD-260118", documentName: "FIR_2026_00118_Annex.pdf", caseId: "CASE-2026-00421", documentType: "FIR", uploadedBy: "Officer Vikram Rao", status: "Rejected" as const, integrity: "Failed" as const, confidentiality: "Restricted" as const },
  ];

  const documents = await SecureDocument.insertMany(
    docData.map((d) => ({
      ...d,
      description: "",
      firebaseStoragePath: `seed/${d.documentId}/${d.documentName}`,
      originalFilename: d.documentName,
      mimeType: "application/pdf",
      size: Math.floor(100000 + Math.random() * 2000000),
      hash: crypto.createHash("sha256").update(`seed-${d.documentId}`).digest("hex"),
      version: 1 + Math.floor(Math.random() * 3),
      uploadDate: new Date(Date.now() - Math.random() * 30 * 86400000),
      lastModified: new Date(Date.now() - Math.random() * 15 * 86400000),
      totalAccesses: Math.floor(Math.random() * 40),
      lastAccessedBy: "Officer Raj Patel",
      lastAccessed: new Date(Date.now() - Math.random() * 7 * 86400000),
    }))
  );
  console.log(`   ✅ Created ${documents.length} documents`);

  // Seed version history for a few documents
  console.log("📋 Creating version histories...");
  const versions = await DocumentVersion.insertMany([
    { documentId: "SD-260318", version: 1, hash: crypto.createHash("sha256").update("v1-SD-260318").digest("hex"), firebaseStoragePath: "seed/SD-260318/v1", uploadedBy: "Officer Amit Shah", changeDescription: "Initial upload", size: 450000 },
    { documentId: "SD-260318", version: 2, hash: crypto.createHash("sha256").update("v2-SD-260318").digest("hex"), firebaseStoragePath: "seed/SD-260318/v2", uploadedBy: "Officer Amit Shah", changeDescription: "Evidence references updated", size: 467000 },
    { documentId: "SD-260318", version: 3, hash: crypto.createHash("sha256").update("v3-SD-260318").digest("hex"), firebaseStoragePath: "seed/SD-260318/v3", uploadedBy: "Officer Amit Shah", changeDescription: "Supplemental notes added", size: 521000 },
    { documentId: "SD-260287", version: 1, hash: crypto.createHash("sha256").update("v1-SD-260287").digest("hex"), firebaseStoragePath: "seed/SD-260287/v1", uploadedBy: "Officer Vikram Rao", changeDescription: "Initial upload", size: 380000 },
    { documentId: "SD-260287", version: 2, hash: crypto.createHash("sha256").update("v2-SD-260287").digest("hex"), firebaseStoragePath: "seed/SD-260287/v2", uploadedBy: "Officer Vikram Rao", changeDescription: "Supervisor approval recorded", size: 395000 },
  ]);
  console.log(`   ✅ Created ${versions.length} version records`);

  // Seed reviews
  console.log("📝 Creating reviews...");
  const reviews = await Review.insertMany([
    { documentId: "SD-260318", caseId: "CASE-2026-00318", documentName: "Investigation_Report_017.pdf", submittedBy: "Officer Amit Shah", status: "Pending", priority: "High", submittedDate: new Date("2026-09-02") },
    { documentId: "SD-260651", caseId: "CASE-2026-00651", documentName: "Forensic_Report_FIB-44.pdf", submittedBy: "Officer Vikram Rao", status: "Pending", priority: "Medium", submittedDate: new Date("2026-08-29") },
    { documentId: "SD-260321", caseId: "CASE-2026-00318", documentName: "Case_Review_Appendix.pdf", submittedBy: "Officer Raj Patel", status: "Pending", priority: "High", submittedDate: new Date("2026-08-27") },
    { documentId: "SD-260421", caseId: "CASE-2026-00421", documentName: "FIR_2026_00421.pdf", reviewer: "Legal Reviewer Mehta", submittedBy: "Officer Raj Patel", status: "Approved", priority: "High", submittedDate: new Date("2026-09-01"), reviewedDate: new Date("2026-09-02"), comment: "All required information verified" },
    { documentId: "SD-260742", caseId: "CASE-2026-00742", documentName: "Evidence_Record_07.pdf", reviewer: "Legal Reviewer Mehta", submittedBy: "Officer Amit Shah", status: "Rejected", priority: "High", submittedDate: new Date("2026-08-28"), reviewedDate: new Date("2026-08-30"), comment: "Integrity mismatch — re-upload required" },
  ]);
  console.log(`   ✅ Created ${reviews.length} reviews`);

  // Seed audit trail with hash chain
  console.log("🔗 Creating audit trail...");
  const auditEvents = [
    { action: "LOGIN_SUCCESS", userName: "Admin User", userRole: "Admin", result: "Success" },
    { action: "CASE_CREATED", userName: "Admin User", userRole: "Admin", caseId: "CASE-2026-00421", result: "Success" },
    { action: "DOCUMENT_UPLOADED", userName: "Officer Raj Patel", userRole: "Officer", caseId: "CASE-2026-00421", documentId: "SD-260421", result: "Success" },
    { action: "DOCUMENT_APPROVED", userName: "Legal Reviewer Mehta", userRole: "Legal Reviewer", caseId: "CASE-2026-00421", documentId: "SD-260421", result: "Success" },
    { action: "INTEGRITY_VERIFIED", userName: "Officer Raj Patel", userRole: "Officer", documentId: "SD-260421", result: "Verified" },
    { action: "LOGIN_FAILED", userName: "unknown@test.com", result: "Failed" },
    { action: "CASE_CREATED", userName: "Admin User", userRole: "Admin", caseId: "CASE-2026-00318", result: "Success" },
    { action: "DOCUMENT_UPLOADED", userName: "Officer Amit Shah", userRole: "Officer", caseId: "CASE-2026-00318", documentId: "SD-260318", result: "Success" },
  ];

  let previousHash: string | null = null;
  for (const event of auditEvents) {
    const eventData = JSON.stringify({ ...event, previousHash, timestamp: new Date().toISOString() });
    const eventHash = crypto.createHash("sha256").update(eventData).digest("hex");
    await AuditLog.create({ ...event, previousHash, eventHash, timestamp: new Date(Date.now() - Math.random() * 7 * 86400000) });
    previousHash = eventHash;
  }
  console.log(`   ✅ Created ${auditEvents.length} audit events (hash-chained)`);

  console.log("\n🎉 Seed complete! All data populated.");
  console.log("\n📋 Test credentials:");
  console.log("   Admin:          admin@securedocs.gov / password123");
  console.log("   Officer:        raj.patel@securedocs.gov / password123");
  console.log("   Legal Reviewer: mehta@securedocs.gov / password123");
  console.log("   Clerk:          clerk@securedocs.gov / password123");
  console.log("   Auditor:        auditor@securedocs.gov / password123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
